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
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

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
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Clean code input (remove spaces, extract slug if full URL was pasted)
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
      setError('Please enter an event code or public link')
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
          onClose()
          router.push(`/join/${found.public_slug}`)
          return
        } else {
          // Allow joining anyway in mock mode with the slug
          onClose()
          router.push(`/join/${slug}`)
          return
        }
      }

      // Check if event exists via Supabase RPC or table query
      const { data, error: queryError } = await supabase
        .from('events')
        .select('public_slug')
        .eq('public_slug', slug)
        .maybeSingle()

      if (queryError || !data) {
        // Fallback: try RPC get_public_event_info
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_public_event_info',
          { p_slug: slug }
        )
        if (rpcError || !rpcData) {
          setError(`No active event found with code "${slug}". Please verify and try again.`)
          setLoading(false)
          return
        }
      }

      onClose()
      router.push(`/join/${slug}`)
    } catch (err: any) {
      setError(err?.message || 'Failed to find event')
    } finally {
      setLoading(false)
    }
  }

  // Camera stream controls for Scanner tab
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
      console.warn('Camera access error:', err)
      setCameraError('Camera access unavailable. Please enter the event code manually.')
    }
  }, [stopCamera])

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
                {cameraError ? (
                  <div className="p-4 text-xs text-zinc-400 space-y-2">
                    <Camera className="h-8 w-8 mx-auto text-zinc-600" />
                    <p>{cameraError}</p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveTab('code')}
                      className="mt-2 text-xs"
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
                    {/* Scanner Target Box Overlay */}
                    <div className="absolute inset-8 border-2 border-primary/80 rounded-2xl pointer-events-none flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                      <div className="w-full h-0.5 bg-primary animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Point your camera directly at the event&apos;s QR code to enter automatically.
              </p>

              <Button
                variant="outline"
                onClick={() => setActiveTab('code')}
                className="w-full h-10 rounded-xl text-xs font-semibold"
              >
                Switch to Manual Code Entry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
