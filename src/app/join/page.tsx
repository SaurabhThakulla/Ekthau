'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

export default function GenericJoinPage() {
  const [activeTab, setActiveTab] = useState<'code' | 'scan'>('code')
  const [eventCode, setEventCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const cleanCode = (input: string) => {
    let clean = input.trim()
    if (clean.includes('/join/')) {
      clean = clean.split('/join/')[1].split('/')[0].split('?')[0]
    }
    return clean
  }

  const handleJoinByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const slug = cleanCode(eventCode)
    if (!slug) {
      setError('Please enter an event code or public slug')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (MOCK_MODE) {
        const found = mockEvents.find(
          (ev) => ev.public_slug.toLowerCase() === slug.toLowerCase() || ev.id === slug
        )
        if (found) {
          router.push(`/join/${found.public_slug}`)
          return
        } else {
          router.push(`/join/${slug}`)
          return
        }
      }

      // Check if event exists via Supabase
      const { data, error: queryError } = await supabase
        .from('events')
        .select('public_slug')
        .eq('public_slug', slug)
        .maybeSingle()

      if (queryError || !data) {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_public_event_info',
          { p_slug: slug }
        )
        if (rpcError || !rpcData) {
          setError(`No active event found matching code "${slug}". Please check the spelling or ask the host.`)
          setLoading(false)
          return
        }
      }

      router.push(`/join/${slug}`)
    } catch (err: any) {
      setError(err?.message || 'Failed to verify event')
    } finally {
      setLoading(false)
    }
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
    } catch (err: any) {
      console.warn('Camera error:', err)
      setCameraError('Camera access not granted or unavailable. Please enter the event code manually.')
    }
  }, [stopCamera])

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
                {cameraError ? (
                  <div className="p-6 text-xs text-zinc-400 space-y-3">
                    <Camera className="h-10 w-10 mx-auto text-zinc-600" />
                    <p className="leading-relaxed">{cameraError}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveTab('code')}
                      className="rounded-xl text-xs font-semibold"
                    >
                      Enter Code Manually
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
                  Your device will automatically open the event gallery once detected.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setActiveTab('code')}
                className="w-full h-11 rounded-2xl text-xs font-bold"
              >
                Prefer typing the code? Enter manually
              </Button>
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
