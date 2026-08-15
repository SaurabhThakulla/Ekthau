'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  QrCode,
  Keyboard,
  Camera,
  Search,
  Loader2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Zap,
  Upload,
  CheckCircle2,
} from 'lucide-react'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'
import jsQR from 'jsqr'

export default function GenericJoinPage() {
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

  const extractSlug = (input: string) => {
    let clean = input.trim()
    if (clean.includes('/join/')) {
      clean = clean.split('/join/')[1].split('/')[0].split('?')[0]
    }
    return clean
  }

  const navigateToSlug = (slug: string) => {
    router.push(`/join/${slug}`)
  }

  const handleJoinByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const slug = extractSlug(eventCode)
    if (!slug) {
      setError('Please enter an event code or public link')
      return
    }

    setLoading(true)
    setError(null)
    navigateToSlug(slug)
  }

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
      console.warn('Camera error:', err)
      setCameraError('Camera access not granted or unavailable. You can enter the event code manually or upload a QR image.')
    }
  }, [stopCamera, scanFrame])

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
    if (activeTab === 'scan') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [activeTab, startCamera, stopCamera])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Top Header */}
      <div className="w-full max-w-lg mb-8 text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5 font-black text-2xl tracking-tighter hover:opacity-90 transition-opacity">
          <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
            <Camera className="h-5 w-5" />
          </div>
          <span>Ekthau</span>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Join an Event</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Share your candid moments and explore the live celebration gallery with other guests.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-lg bg-card text-card-foreground border rounded-3xl shadow-xl overflow-hidden">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-muted/40 border-b gap-1.5">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'code'
                ? 'bg-background shadow-md text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Keyboard className="h-4 w-4" />
            Enter Event Code
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'scan'
                ? 'bg-background shadow-md text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="h-4 w-4" />
            Scan QR Code
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl text-sm bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {activeTab === 'code' ? (
            <form onSubmit={handleJoinByCode} className="space-y-5">
              <div className="space-y-2 text-left">
                <Label htmlFor="event-code" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Event Code or URL Slug
                </Label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="event-code"
                    placeholder="e.g. sita-ramesh-2026"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value)}
                    autoFocus
                    className="pl-12 h-14 text-lg rounded-2xl font-mono tracking-wide bg-background border-2 border-input focus-visible:border-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The event code is provided on event invitations, table stands, or the host&apos;s QR screen.
                </p>
              </div>

              {MOCK_MODE && (
                <div className="pt-2">
                  <span className="text-xs text-muted-foreground font-semibold block mb-2">
                    Quick demo codes to try:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {mockEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setEventCode(ev.public_slug)}
                        className="px-3 py-1.5 text-xs rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors font-mono font-medium border border-border/50"
                      >
                        {ev.public_slug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !eventCode.trim()}
                className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Finding Event...
                  </>
                ) : (
                  <>
                    Join Celebration
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="relative aspect-square w-full max-w-[300px] mx-auto rounded-3xl overflow-hidden bg-zinc-950 border-2 border-border flex items-center justify-center shadow-inner">
                {scannedCode ? (
                  <div className="p-6 text-center space-y-2 text-white">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="font-bold text-base">QR Code Detected!</h4>
                    <p className="text-xs text-zinc-300 font-mono">{scannedCode}</p>
                    <p className="text-xs text-emerald-300">Opening event space...</p>
                  </div>
                ) : cameraError ? (
                  <div className="p-6 text-xs text-zinc-400 space-y-3">
                    <Camera className="h-10 w-10 mx-auto text-zinc-600" />
                    <p className="leading-relaxed">{cameraError}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl text-xs font-semibold"
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
                    <div className="absolute inset-8 border-2 border-primary rounded-2xl pointer-events-none flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                      <div className="w-full h-0.5 bg-primary animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold">Align QR Code inside frame</h4>
                <p className="text-xs text-muted-foreground">
                  Point camera at the event QR code — it detects automatically.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-2xl text-xs font-bold h-11"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload QR Screenshot
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
                  onClick={() => setActiveTab('code')}
                  className="flex-1 rounded-2xl text-xs font-bold h-11"
                >
                  Enter Code Manually
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer features banner */}
        <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            No app download required
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" />
            Instant photo stream
          </span>
        </div>
      </div>

      {/* Host Link */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        Are you an event host?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
          Sign in to Host Dashboard
        </Link>
      </div>
    </div>
  )
}
