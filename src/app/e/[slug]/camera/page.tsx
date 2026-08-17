'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  Camera as CameraIcon,
  CheckCircle2,
  ChevronUp,
  Images,
  RefreshCw,
  SwitchCamera,
  UploadCloud,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { GuestSessionGate } from '@/components/guest/guest-session-gate'
import type { GuestSession } from '@/features/guest/GuestContext'
import { uploadQueueManager, type UploadQueueItem } from '@/lib/upload/uploadQueue'
import { formatBytes } from '@/lib/media-url'

export default function GuestCameraPage() {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''

  return (
    <GuestSessionGate slug={slug}>
      {(session) => <CameraScreen slug={slug} session={session} />}
    </GuestSessionGate>
  )
}

function CameraScreen({ slug, session }: { slug: string; session: GuestSession }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const flashTimerRef = useRef<number | null>(null)

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraState, setCameraState] = useState<'starting' | 'live' | 'blocked'>('starting')
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [flash, setFlash] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    uploadQueueManager.setSession(session.event_id, session.session_token_hash)
  }, [session.event_id, session.session_token_hash])

  useEffect(() => uploadQueueManager.subscribe(setQueue), [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  /**
   * The <video> element stays mounted in every state. Previously it was
   * unmounted whenever permission was denied, so `videoRef.current` was null on
   * retry and the stream had nowhere to attach — granting access never worked
   * without a full reload.
   */
  useEffect(() => {
    let cancelled = false

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState('blocked')
        return
      }
      setCameraState('starting')
      stopStream()

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setCameraState('live')
      } catch {
        if (!cancelled) setCameraState('blocked')
      }
    }

    start()
    return () => {
      cancelled = true
      stopStream()
    }
  }, [facingMode, attempt, stopStream])

  // Release the camera when the guest switches apps, and pick it back up after.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopStream()
      } else {
        setAttempt((value) => value + 1)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [stopStream])

  // Clear the shutter-flash timer so it cannot fire after unmount.
  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video || !streamRef.current || cameraState !== 'live') return

    setFlash(true)
    if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current)
    flashTimerRef.current = window.setTimeout(() => setFlash(false), 130)

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1920
    canvas.height = video.videoHeight || 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `ekthau-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        uploadQueueManager.addFile(file, 'photo', session.event_id)
      },
      'image/jpeg',
      0.98
    )
  }, [cameraState, session.event_id])

  const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        uploadQueueManager.addFile(
          file,
          file.type.startsWith('video') ? 'video' : 'photo',
          session.event_id
        )
      })
    }
    // Reset so choosing the same file twice still fires a change event.
    event.target.value = ''
  }

  const stats = uploadQueueManager.getStats()
  const active = queue.find(
    (item) => item.status === 'uploading' || item.status === 'registering'
  )

  const statusLabel = !stats.isOnline
    ? 'Offline — photos are saved and will send later'
    : stats.failed > 0
      ? `${stats.failed} upload${stats.failed > 1 ? 's' : ''} need retrying`
      : stats.pending > 0
        ? `Sending ${stats.pending} photo${stats.pending > 1 ? 's' : ''}${active ? ` · ${active.progress}%` : ''}`
        : `All ${stats.completed} photo${stats.completed === 1 ? '' : 's'} saved`

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-black text-white">
      {flash && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-50 bg-white opacity-80"
        />
      )}

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="pt-safe absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/75 to-transparent px-4 pb-6">
        <Link
          href={`/e/${encodeURIComponent(slug)}/gallery`}
          className="flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/15 px-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
        >
          <Images className="size-4" aria-hidden="true" />
          Gallery
        </Link>

        {queue.length > 0 && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold backdrop-blur-md transition-colors ${
              !stats.isOnline
                ? 'border-amber-400/30 bg-amber-500/25 text-amber-100'
                : stats.failed > 0
                  ? 'border-red-400/30 bg-red-500/25 text-red-100'
                  : stats.pending > 0
                    ? 'border-white/20 bg-white/20 text-white'
                    : 'border-emerald-400/30 bg-emerald-500/25 text-emerald-100'
            }`}
          >
            {!stats.isOnline ? (
              <WifiOff className="size-4" aria-hidden="true" />
            ) : stats.failed > 0 ? (
              <AlertCircle className="size-4" aria-hidden="true" />
            ) : stats.pending > 0 ? (
              <UploadCloud className="size-4 animate-pulse" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            )}
            <span className="max-w-[9.5rem] truncate">{statusLabel}</span>
            <ChevronUp className="size-3.5 opacity-70" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Announced separately so the badge itself is not a live region. */}
      <p aria-live="polite" className="sr-only">
        {statusLabel}
      </p>

      {/* ── Viewfinder ───────────────────────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="Camera viewfinder"
          className={`size-full object-cover transition-opacity duration-300 ${
            cameraState === 'live' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {cameraState !== 'live' && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {cameraState === 'starting' ? (
              <p role="status" className="text-sm text-white/60">
                Starting the camera…
              </p>
            ) : (
              <div className="max-w-xs space-y-4 text-center">
                <CameraIcon
                  className="mx-auto size-10 text-white/40"
                  aria-hidden="true"
                />
                <div className="space-y-1.5">
                  <h1 className="text-lg font-semibold">Camera access needed</h1>
                  <p className="text-sm leading-relaxed text-white/65">
                    Allow camera access in your browser, then tap retry. You can also
                    pick photos you have already taken.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="onDark"
                    block
                    onClick={() => setAttempt((value) => value + 1)}
                  >
                    <RefreshCw aria-hidden="true" />
                    Retry camera
                  </Button>
                  <Button
                    variant="onDarkGhost"
                    block
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Images aria-hidden="true" />
                    Choose from my photos
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="pb-safe z-20 flex items-center justify-around border-t border-white/10 bg-black/90 px-6 pt-5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <Images className="size-6" aria-hidden="true" />
          <span className="sr-only">Upload photos or video from your device</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={handleFilePick}
          aria-label="Upload photos or video from your device"
        />

        <button
          type="button"
          onClick={capturePhoto}
          disabled={cameraState !== 'live'}
          className="flex size-20 items-center justify-center rounded-full border-4 border-white transition-transform active:scale-90 disabled:opacity-40"
        >
          <span aria-hidden="true" className="size-16 rounded-full bg-white" />
          <span className="sr-only">Take a photo</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))
          }
          disabled={cameraState === 'blocked'}
          className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
        >
          <SwitchCamera className="size-6" aria-hidden="true" />
          <span className="sr-only">
            Switch to the {facingMode === 'environment' ? 'front' : 'back'} camera
          </span>
        </button>
      </div>

      {/* ── Upload queue ─────────────────────────────────────────────── */}
      <Modal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="sheet"
        title="Your uploads"
        description={statusLabel}
        footer={
          <div className="flex gap-2">
            {stats.failed > 0 && (
              <Button
                variant="secondary"
                block
                onClick={() => uploadQueueManager.retryAllFailed()}
              >
                <RefreshCw aria-hidden="true" />
                Retry all
              </Button>
            )}
            <Button block onClick={() => setDrawerOpen(false)}>
              Keep shooting
            </Button>
          </div>
        }
      >
        {queue.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Nothing in the queue. Every photo you take shows up here while it uploads.
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {queue.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-ink-muted shadow-xs"
                  >
                    {item.type === 'video' ? 'VID' : 'IMG'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatBytes(item.file.size)}
                      {item.isMultipart && ' · large file'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-xs font-semibold">
                  {item.status === 'completed' && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      Saved
                    </span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="text-brand-700">{item.progress}%</span>
                  )}
                  {item.status === 'registering' && (
                    <span className="text-brand-700">Finishing…</span>
                  )}
                  {item.status === 'retrying' && (
                    <span className="text-amber-600">Retrying…</span>
                  )}
                  {item.status === 'queued' && (
                    <span className="text-ink-muted">Waiting</span>
                  )}
                  {item.status === 'paused' && (
                    <span className="text-amber-600">Paused</span>
                  )}
                  {item.status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => uploadQueueManager.retryFailed(item.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-red-700 transition-colors hover:bg-red-100"
                    >
                      <RefreshCw className="size-3.5" aria-hidden="true" />
                      Retry
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
