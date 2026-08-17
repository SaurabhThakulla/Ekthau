'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CheckCircle2, Upload } from 'lucide-react'
import jsQR from 'jsqr'
import { Button } from '@/components/ui/button'
import { extractEventSlug } from '@/lib/event-code'

interface QrScannerProps {
  /** Camera only runs while true — stops as soon as the panel is hidden. */
  active: boolean
  onDetected: (slug: string) => void
  onSwitchToCode?: () => void
}

/**
 * Live QR scanner with an image-upload fallback. This logic previously existed
 * twice (join page + join modal); both copies leaked the camera when the page
 * was backgrounded and captured a stale navigation callback in the scan loop.
 */
export function QrScanner({ active, onDetected, onSwitchToCode }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Held in a ref so the animation loop always calls the current callback.
  const onDetectedRef = useRef(onDetected)
  const settledRef = useRef(false)

  const [cameraError, setCameraError] = useState<string | null>(null)
  const [detected, setDetected] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    onDetectedRef.current = onDetected
  }, [onDetected])

  const stopCamera = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const handleMatch = useCallback(
    (slug: string) => {
      if (settledRef.current) return
      settledRef.current = true
      setDetected(slug)
      stopCamera()
      // Brief pause so the guest sees the confirmation before navigating.
      window.setTimeout(() => onDetectedRef.current(slug), 350)
    },
    [stopCamera]
  )

  useEffect(() => {
    if (!active) {
      stopCamera()
      return
    }

    settledRef.current = false
    setDetected(null)
    setCameraError(null)
    let cancelled = false

    const scan = () => {
      const video = videoRef.current
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        frameRef.current = requestAnimationFrame(scan)
        return
      }

      if (!canvasRef.current) canvasRef.current = document.createElement('canvas')
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      if (ctx) {
        // Downscale before decoding — full 1280px frames were being read back
        // from the GPU on every animation frame, which pinned the main thread.
        const scale = Math.min(1, 640 / video.videoWidth)
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsQR(image.data, image.width, image.height, {
          inversionAttempts: 'dontInvert',
        })

        const slug = result?.data ? extractEventSlug(result.data) : null
        if (slug) {
          handleMatch(slug)
          return
        }
      }

      frameRef.current = requestAnimationFrame(scan)
    }

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          'This browser cannot open the camera. Enter the code manually or upload a photo of the QR code.'
        )
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
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
        frameRef.current = requestAnimationFrame(scan)
      } catch {
        if (!cancelled) {
          setCameraError(
            'Camera access was blocked. Allow it in your browser settings, enter the code manually, or upload a photo of the QR code.'
          )
        }
      }
    }

    start()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [active, handleMatch, stopCamera])

  // Release the camera when the tab is hidden, so it is not left recording.
  useEffect(() => {
    if (!active) return
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') stopCamera()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [active, stopCamera])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Clear immediately so re-picking the same file still fires a change event.
    event.target.value = ''
    if (!file) return

    setUploadError(null)
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const canvas = document.createElement('canvas')
      // Cap the decode size; phone photos are far larger than jsQR needs.
      const scale = Math.min(1, 1400 / Math.max(image.width, image.height))
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setUploadError('Could not read that image. Try entering the code instead.')
        return
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const result = jsQR(data.data, data.width, data.height)
      const slug = result?.data ? extractEventSlug(result.data) : null

      if (slug) {
        handleMatch(slug)
      } else {
        setUploadError(
          'No event QR code was found in that image. Try a clearer photo or enter the code.'
        )
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setUploadError('That file could not be opened as an image.')
    }

    image.src = objectUrl
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-ink">
        {detected ? (
          <div className="space-y-2 p-6 text-center text-white">
            <CheckCircle2 className="mx-auto size-10 text-emerald-400" aria-hidden="true" />
            <p className="font-semibold">QR code found</p>
            <p className="font-mono text-xs text-white/70">{detected}</p>
          </div>
        ) : cameraError ? (
          <div className="space-y-3 p-6 text-center">
            <Camera className="mx-auto size-9 text-white/40" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-white/75">{cameraError}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="Camera viewfinder for scanning an event QR code"
              className="size-full object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-8 rounded-xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(11,19,43,0.55)]"
            />
          </>
        )}
      </div>

      <p aria-live="polite" className="text-center text-sm text-ink-muted">
        {detected
          ? 'Opening the event…'
          : cameraError
            ? 'Camera unavailable'
            : 'Point your camera at the QR code — it scans automatically.'}
      </p>

      {uploadError && (
        <p role="alert" className="text-center text-xs font-medium text-destructive">
          {uploadError}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          block
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          Upload QR photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageUpload}
          aria-label="Upload a photo containing the event QR code"
        />
        {onSwitchToCode && (
          <Button type="button" variant="ghost" block onClick={onSwitchToCode}>
            Enter code instead
          </Button>
        )}
      </div>
    </div>
  )
}
