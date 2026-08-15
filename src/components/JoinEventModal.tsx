'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  QrCode,
  Keyboard,
  Camera,
  Search,
  Loader2,
  X,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Upload,
  CheckCircle2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'
import jsQR from 'jsqr'

interface JoinEventModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function JoinEventModal({ isOpen, onClose }: JoinEventModalProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'scan'>('code')
  const [eventCode, setEventCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scannedCode, setScannedCode] = useState<string | null>(null)

  // Clean code input (extract slug if full URL was passed)
  const extractSlug = (input: string) => {
    let clean = input.trim()
    if (clean.includes('/join/')) {
      clean = clean.split('/join/')[1].split('/')[0].split('?')[0]
    }
    return clean
  }

  const navigateToSlug = (slug: string) => {
    onClose()
    router.push(`/join/${slug}`)
  }

  const handleJoinByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const slug = extractSlug(eventCode)
    if (!slug) {
      setError('Please enter an event code or link')
      return
    }

    setLoading(true)
    setError(null)
    navigateToSlug(slug)
  }

  // Camera stream controls
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  // Continuous frame scanning loop with jsQR
  const scanFrame = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }

    const video = videoRef.current
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code && code.data) {
        const foundSlug = extractSlug(code.data)
        if (foundSlug) {
          setScannedCode(foundSlug)
          stopCamera()
          // Brief success delay before navigating
          setTimeout(() => {
            navigateToSlug(foundSlug)
          }, 400)
          return
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame)
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setScannedCode(null)
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setCameraActive(true)
      animationFrameRef.current = requestAnimationFrame(scanFrame)
    } catch (err: any) {
      console.warn('Camera access error:', err)
      setCameraError('Camera access not granted or unavailable. You can enter the event code manually or upload a QR image.')
    }
  }, [stopCamera, scanFrame])

  // Handle uploaded QR image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imgData.data, imgData.width, imgData.height)
          if (code && code.data) {
            const slug = extractSlug(code.data)
            if (slug) {
              setScannedCode(slug)
              setTimeout(() => navigateToSlug(slug), 300)
              return
            }
          }
          setError('No QR code found in this image. Please try another image or enter the code.')
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (isOpen && activeTab === 'scan') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, activeTab, startCamera, stopCamera])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50">
      <div
        className="bg-card text-card-foreground border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">Join an Event</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Enter as a guest to snap & view photos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-muted/40 border-b gap-1.5">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'code'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Keyboard className="h-4 w-4" />
            Enter Code
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'scan'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="h-4 w-4" />
            Scan QR Code
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl text-xs bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'code' ? (
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Event Code or URL Slug
                </Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="event-code"
                    placeholder="e.g. sita-ramesh-2026"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value)}
                    autoFocus
                    className="pl-10 h-12 text-base rounded-xl font-mono tracking-wide bg-background"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask the event host for their unique event code or scan their QR display.
                </p>
              </div>

              {/* Quick sample chips */}
              {MOCK_MODE && (
                <div className="pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium block mb-1.5">
                    Demo events you can try:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mockEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setEventCode(ev.public_slug)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors font-mono"
                      >
                        {ev.public_slug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !eventCode.trim()}
                  className="flex-1 h-11 rounded-xl font-semibold shadow-md shadow-primary/20"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <>
                      Enter Event
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-zinc-950 border flex items-center justify-center shadow-inner">
                {scannedCode ? (
                  <div className="p-6 text-center space-y-2 text-white">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="font-bold text-base">QR Code Detected!</h4>
                    <p className="text-xs text-zinc-300 font-mono">{scannedCode}</p>
                    <p className="text-xs text-emerald-300">Opening event space...</p>
                  </div>
                ) : cameraError ? (
                  <div className="p-4 text-xs text-zinc-400 space-y-2">
                    <Camera className="h-8 w-8 mx-auto text-zinc-600" />
                    <p>{cameraError}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Upload QR Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Scanner Target Box Overlay */}
                    <div className="absolute inset-8 border-2 border-primary/80 rounded-2xl pointer-events-none flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                      <div className="w-full h-0.5 bg-primary animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Point your camera at the QR code — it will scan automatically.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-xl text-xs font-semibold h-9"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload QR Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('code')}
                  className="flex-1 rounded-xl text-xs font-semibold h-9"
                >
                  Enter Code Instead
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
