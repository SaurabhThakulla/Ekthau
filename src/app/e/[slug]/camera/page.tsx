'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useGuest } from '@/features/guest/GuestContext'
import { Button } from '@/components/ui/button'
import {
  Camera as CameraIcon,
  SwitchCamera,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react'
import { compressImage, generateContentHash } from '@/lib/media'
import { get, set } from 'idb-keyval'
import { MOCK_MODE } from '@/lib/mockData'
import { supabase } from '@/lib/supabase'

interface QueuedItem {
  id: string
  file: File
  type: 'photo' | 'video'
  status: 'queued' | 'uploading' | 'completed' | 'failed'
  progress: number
}

const QUEUE_STORAGE_KEY = 'ekthau_upload_queue'

export default function GuestCameraPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { session } = useGuest()

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>(
    'environment'
  )
  const [permissionError, setPermissionError] = useState(false)
  const [queue, setQueue] = useState<QueuedItem[]>([])
  const [uploading, setUploading] = useState(false)

  // Stop current active stream tracks
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {
          // ignore
        }
      })
      streamRef.current = null
    }
  }, [])

  // Initialize Camera
  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      if (typeof window === 'undefined' || !navigator?.mediaDevices) return
      try {
        stopCurrentStream()
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        streamRef.current = newStream
        if (videoRef.current) {
          videoRef.current.srcObject = newStream
        }
        setPermissionError(false)
      } catch (err) {
        console.error('Camera access denied', err)
        setPermissionError(true)
      }
    },
    [stopCurrentStream]
  )

  useEffect(() => {
    startCamera(facingMode)
    return () => {
      stopCurrentStream()
    }
  }, [facingMode, startCamera, stopCurrentStream])

  // Load any unsynced queue from IndexedDB on mount
  useEffect(() => {
    async function loadPersistedQueue() {
      if (typeof window === 'undefined') return
      try {
        const stored = await get<
          Array<{
            id: string
            name: string
            type: 'photo' | 'video'
            buffer: ArrayBuffer
            mimeType: string
          }>
        >(QUEUE_STORAGE_KEY)
        if (stored && stored.length > 0) {
          const restoredItems: QueuedItem[] = stored.map((item) => ({
            id: item.id,
            file: new File([item.buffer], item.name, { type: item.mimeType }),
            type: item.type,
            status: 'queued',
            progress: 0,
          }))
          setQueue((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const filtered = restoredItems.filter((r) => !existingIds.has(r.id))
            return [...prev, ...filtered]
          })
        }
      } catch (err) {
        console.warn('Failed to load queue from IndexedDB', err)
      }
    }
    loadPersistedQueue()
  }, [])

  // Queue Management
  const addToQueue = useCallback(
    async (file: File, type: 'photo' | 'video') => {
      const id = crypto.randomUUID()

      // Compress immediately if photo
      let processedFile = file
      if (type === 'photo') {
        processedFile = await compressImage(file)
      }

      const newItem: QueuedItem = {
        id,
        file: processedFile,
        type,
        status: 'queued',
        progress: 0,
      }

      setQueue((prev) => [...prev, newItem])

      // Persist buffer to IndexedDB for offline / page refresh resilience
      if (typeof window !== 'undefined') {
        try {
          const buffer = await processedFile.arrayBuffer()
          const existing = (await get<any[]>(QUEUE_STORAGE_KEY)) || []
          await set(QUEUE_STORAGE_KEY, [
            ...existing,
            {
              id,
              name: processedFile.name,
              type,
              buffer,
              mimeType: processedFile.type,
            },
          ])
        } catch (err) {
          console.warn('Failed to persist queued file to IndexedDB', err)
        }
      }
    },
    []
  )

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !streamRef.current) return
    const canvas = document.createElement('canvas')
    const video = videoRef.current
    canvas.width = video.videoWidth || 1920
    canvas.height = video.videoHeight || 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          addToQueue(file, 'photo')
        }
      },
      'image/jpeg',
      0.95
    )
  }, [addToQueue])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const type = file.type.startsWith('video') ? 'video' : 'photo'
      addToQueue(file, type)
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Upload worker loop
  useEffect(() => {
    const processQueue = async () => {
      if (uploading || !session) return

      const nextItemIndex = queue.findIndex((q) => q.status === 'queued')
      if (nextItemIndex === -1) return

      setUploading(true)
      const item = queue[nextItemIndex]

      try {
        // 1. Mark uploading
        setQueue((prev) =>
          prev.map((q, i) =>
            i === nextItemIndex ? { ...q, status: 'uploading' } : q
          )
        )

        // 2. Hash content
        const contentHash = await generateContentHash(item.file)

        // 3. Request presigned URL from Edge Function
        if (MOCK_MODE) {
          await new Promise((resolve) => setTimeout(resolve, 800))
        } else {
          const supabaseUrl =
            process.env.NEXT_PUBLIC_SUPABASE_URL ||
            process.env.VITE_SUPABASE_URL
          const anonKey =
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
            process.env.VITE_SUPABASE_ANON_KEY
          const edgeFunctionUrl = supabaseUrl
            ? `${supabaseUrl}/functions/v1/upload-url`
            : null

          let storagePath = `events/${session.event_id}/media/${crypto.randomUUID()}/${item.file.name}`

          if (edgeFunctionUrl && anonKey) {
            const res = await fetch(edgeFunctionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${anonKey}`,
              },
              body: JSON.stringify({
                event_id: session.event_id,
                filename: item.file.name,
                content_type: item.file.type,
                session_token_hash: session.session_token_hash,
              }),
            })

            if (!res.ok) throw new Error('Failed to get signed URL')
            const data = await res.json()
            storagePath = data.storagePath

            // 4. Upload directly to R2
            const uploadRes = await fetch(data.signedUrl, {
              method: 'PUT',
              body: item.file,
              headers: { 'Content-Type': item.file.type },
            })
            if (!uploadRes.ok) throw new Error('Upload to storage failed')
          }

          // 5. Save metadata to Supabase using RPC
          await supabase.rpc('record_uploaded_media', {
            p_event_id: session.event_id,
            p_session_token_hash: session.session_token_hash,
            p_storage_path: storagePath,
            p_mime_type: item.file.type,
            p_size_bytes: item.file.size,
            p_content_hash: contentHash,
          })
        }

        // 6. Mark completed & cleanup from IndexedDB
        setQueue((prev) =>
          prev.map((q, i) =>
            i === nextItemIndex ? { ...q, status: 'completed' } : q
          )
        )
        if (typeof window !== 'undefined') {
          try {
            const existing = (await get<any[]>(QUEUE_STORAGE_KEY)) || []
            await set(
              QUEUE_STORAGE_KEY,
              existing.filter((e) => e.id !== item.id)
            )
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Upload error', err)
        setQueue((prev) =>
          prev.map((q, i) =>
            i === nextItemIndex ? { ...q, status: 'failed' } : q
          )
        )
      } finally {
        setUploading(false)
      }
    }

    processQueue()
  }, [queue, uploading, session])

  const pendingCount = queue.filter(
    (q) => q.status === 'queued' || q.status === 'uploading'
  ).length
  const completedCount = queue.filter((q) => q.status === 'completed').length

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 p-4 text-center">
        <p className="text-muted-foreground">Please join the event first.</p>
        <Link
          href={`/join/${slug}`}
          className="text-primary font-medium hover:underline"
        >
          Join Event
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden relative">
      {/* Top Bar */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <Link
          href={`/e/${slug}/gallery`}
          className="text-white drop-shadow-md font-medium text-sm"
        >
          Gallery
        </Link>

        {/* Upload Status */}
        {(pendingCount > 0 || completedCount > 0) && (
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
            {pendingCount > 0 ? (
              <>
                <UploadCloud className="h-3.5 w-3.5 animate-pulse text-blue-400" />
                <span>{pendingCount} uploading</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                <span>All uploaded</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Camera Viewport */}
      <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
        {permissionError ? (
          <div className="text-center p-6 space-y-4">
            <CameraIcon className="h-12 w-12 mx-auto text-zinc-500" />
            <h3 className="font-semibold text-lg">Camera Access Denied</h3>
            <p className="text-sm text-zinc-400">
              Please enable camera access or upload from your gallery.
            </p>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload from Gallery
            </Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-32 bg-black flex items-center justify-around pb-6 px-6">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 text-white hover:bg-white/20"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-6 w-6" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*"
          multiple
          onChange={handleFileUpload}
        />

        {/* Shutter Button */}
        <button
          onClick={capturePhoto}
          disabled={permissionError}
          className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50"
          aria-label="Take Photo"
        >
          <div className="h-16 w-16 bg-white rounded-full active:scale-95 transition-transform" />
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 text-white hover:bg-white/20"
          onClick={() =>
            setFacingMode((prev) =>
              prev === 'environment' ? 'user' : 'environment'
            )
          }
          disabled={permissionError}
          aria-label="Switch Camera"
        >
          <SwitchCamera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
