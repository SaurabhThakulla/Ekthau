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
  AlertCircle,
  RefreshCw,
  X,
  WifiOff,
  Sparkles,
  ChevronDown,
  Layers,
} from 'lucide-react'
import {
  uploadQueueManager,
  UploadQueueItem,
} from '@/lib/upload/uploadQueue'

export default function GuestCameraPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { session } = useGuest()

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [permissionError, setPermissionError] = useState(false)
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [flashEffect, setFlashEffect] = useState(false)

  // Bind session to UploadQueueManager
  useEffect(() => {
    if (session?.event_id && session?.session_token_hash) {
      uploadQueueManager.setSession(session.event_id, session.session_token_hash)
    }
  }, [session])

  // Subscribe to queue changes
  useEffect(() => {
    const unsubscribe = uploadQueueManager.subscribe((items) => {
      setQueue(items)
    })
    return () => unsubscribe()
  }, [])

  // Camera stream controls
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

  // Instant shutter capture (< 50ms)
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !streamRef.current || !session) return

    // Trigger visual shutter flash
    setFlashEffect(true)
    setTimeout(() => setFlashEffect(false), 120)

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1920
    canvas.height = video.videoHeight || 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Capture full resolution raw JPEG without downscaling
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const rawFile = new File([blob], `capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          // Send straight to background queue
          uploadQueueManager.addFile(rawFile, 'photo', session.event_id)
        }
      },
      'image/jpeg',
      0.98 // High original quality preservation
    )
  }, [session])

  // File Picker Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !session) return

    Array.from(files).forEach((file) => {
      const type = file.type.startsWith('video') ? 'video' : 'photo'
      uploadQueueManager.addFile(file, type, session.event_id)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const stats = uploadQueueManager.getStats()
  const activeUpload = queue.find((q) => q.status === 'uploading' || q.status === 'registering')

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 p-4 text-center bg-background">
        <p className="text-muted-foreground font-medium">Please join the celebration first.</p>
        <Button asChild className="rounded-xl font-bold">
          <Link href={`/join/${slug}`}>Join Event</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden relative select-none">
      {/* Shutter White Flash Animation */}
      {flashEffect && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-100 opacity-80" />
      )}

      {/* Top Header Bar */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <Link
          href={`/e/${slug}/gallery`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/10 active:scale-95 transition-transform"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Live Gallery</span>
        </Link>

        {/* Floating Upload Status Pill */}
        {queue.length > 0 && (
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg transition-all active:scale-95 ${
              !stats.isOnline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : stats.failed > 0
                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                : stats.pending > 0
                ? 'bg-primary/25 text-white border-primary/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {!stats.isOnline ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span>Offline (Paused)</span>
              </>
            ) : stats.failed > 0 ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                <span>{stats.failed} failed</span>
              </>
            ) : stats.pending > 0 ? (
              <>
                <UploadCloud className="h-3.5 w-3.5 animate-pulse text-blue-400" />
                <span>
                  {stats.pending} uploading
                  {activeUpload && ` • ${activeUpload.progress}%`}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>All {stats.completed} saved</span>
              </>
            )}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        )}
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 relative bg-zinc-950 flex items-center justify-center overflow-hidden">
        {permissionError ? (
          <div className="text-center p-6 space-y-4 max-w-xs">
            <CameraIcon className="h-12 w-12 mx-auto text-zinc-500" />
            <h3 className="font-bold text-lg">Camera Access Needed</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enable camera permissions in your browser settings or choose photos directly from your gallery.
            </p>
            <Button
              variant="secondary"
              className="rounded-xl font-bold text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload from Device
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
      <div className="h-32 bg-black/90 backdrop-blur-md flex items-center justify-around pb-6 px-6 z-20 border-t border-white/5">
        {/* Gallery Pick Button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-transform"
          onClick={() => fileInputRef.current?.click()}
          title="Upload full resolution photo or video"
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
          className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 active:scale-90 transition-transform shadow-xl shadow-white/10"
          aria-label="Snap High-Res Photo"
        >
          <div className="h-16 w-16 bg-white rounded-full" />
        </button>

        {/* Switch Camera */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-transform"
          onClick={() =>
            setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
          }
          disabled={permissionError}
          aria-label="Switch Camera"
        >
          <SwitchCamera className="h-6 w-6" />
        </Button>
      </div>

      {/* Upload Queue Popover / Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in-50">
          <div
            className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 max-h-[70vh] flex flex-col space-y-4 animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Upload Activity</h3>
                <p className="text-xs text-zinc-400">
                  {stats.pending > 0
                    ? `${stats.pending} remaining • Uploading in original quality`
                    : `All ${stats.completed} uploads completed`}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-full p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions */}
            {stats.failed > 0 && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs">
                <span className="text-red-300 font-medium">
                  {stats.failed} upload{stats.failed > 1 ? 's' : ''} encountered a network issue
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 rounded-xl text-xs font-bold"
                  onClick={() => uploadQueueManager.retryAllFailed()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry All
                </Button>
              </div>
            )}

            {/* List of queue items */}
            <div className="overflow-y-auto space-y-2.5 max-h-[45vh] pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 rounded-xl bg-zinc-800 shrink-0 flex items-center justify-center font-mono font-bold text-[10px] text-zinc-400">
                      {item.type === 'video' ? 'VID' : 'RAW'}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{item.file.name}</p>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                        {item.isMultipart && ' • Multipart'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'completed' && (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        Saved
                      </span>
                    )}

                    {item.status === 'uploading' && (
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                        <UploadCloud className="h-4 w-4 animate-pulse" />
                        <span>{item.progress}%</span>
                      </div>
                    )}

                    {item.status === 'registering' && (
                      <span className="text-purple-400 font-bold animate-pulse">Syncing...</span>
                    )}

                    {item.status === 'queued' && (
                      <span className="text-zinc-400 font-medium">Queued</span>
                    )}

                    {item.status === 'paused' && (
                      <span className="text-amber-400 font-medium">Paused</span>
                    )}

                    {item.status === 'failed' && (
                      <button
                        onClick={() => uploadQueueManager.retryFailed(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 font-bold flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-11 rounded-xl font-bold"
              onClick={() => setDrawerOpen(false)}
            >
              Continue Snapping
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
