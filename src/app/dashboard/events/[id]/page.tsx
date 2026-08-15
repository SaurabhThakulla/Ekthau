'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Copy,
  ExternalLink,
  Download,
  Check,
  Camera,
  Images,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

interface EventDetail {
  id: string
  name: string
  public_slug: string
  status: string
  guest_limit: number
  event_date?: string
  location?: string | null
}

export default function EventDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    async function loadEvent() {
      if (!id) return

      if (MOCK_MODE) {
        setEvent(
          (mockEvents.find((e) => e.id === id) as unknown as EventDetail) ||
            (mockEvents[0] as unknown as EventDetail)
        )
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('events')
        .select('id, name, public_slug, status, guest_limit, event_date, location')
        .eq('id', id)
        .single()

      if (!error && data) {
        setEvent(data)
      }
      setLoading(false)
    }
    loadEvent()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading event details...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center p-12 space-y-4">
        <p className="text-muted-foreground">Event not found or you don&apos;t have permission.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const joinUrl = `${origin || ''}/join/${event.public_slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(event.public_slug)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width + 40
        canvas.height = img.height + 40
        if (ctx) {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 20, 20)
        }
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = `${event.name}-QR.png`
        downloadLink.href = `${pngFile}`
        downloadLink.click()
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                All Events
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-black tracking-tight">{event.name}</h1>
          <p className="text-sm text-muted-foreground">
            Share this QR code or event code with your guests to start streaming photos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-xl font-semibold">
            <Link href={`/dashboard/events/${event.id}/moderation`}>
              <Images className="mr-2 h-4 w-4 text-amber-500" />
              Moderate Media
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Left Column: QR Code Display & Sharing (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div className="border rounded-3xl p-6 sm:p-8 bg-card flex flex-col items-center text-center space-y-5 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-bold text-xl">Guest QR Pass</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Guests can point any smartphone camera at this code to join and upload photos instantly.
              </p>
            </div>

            {/* High-Resolution SVG QR Code */}
            <div className="bg-white p-5 rounded-3xl shadow-md border mt-2">
              <QRCodeSVG
                id="qr-code"
                value={joinUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Event Code Pill with Copy */}
            <div className="w-full bg-muted/60 p-3.5 rounded-2xl border flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Event Code for Manual Entry
                </span>
                <code className="text-sm font-mono font-bold text-foreground">
                  {event.public_slug}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                className="rounded-xl h-8 text-xs font-semibold"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            {/* Link Actions */}
            <div className="flex flex-col w-full gap-2.5 pt-2">
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 rounded-xl font-semibold h-11" onClick={copyLink}>
                  {copiedLink ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-emerald-500" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Shareable Link
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon" asChild className="rounded-xl h-11 w-11 shrink-0">
                  <Link href={`/join/${event.public_slug}`} target="_blank" title="Test guest landing page">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <Button className="w-full rounded-xl font-bold h-11 shadow-md shadow-primary/20" onClick={downloadQR}>
                <Download className="mr-2 h-4 w-4" />
                Download Printable QR Code (PNG)
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Status, Quick Links & Live Info (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Event Status Card */}
          <div className="border rounded-3xl p-6 bg-card space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Event Status
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${
                    event.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Guest Limit</span>
                <span className="font-semibold">{event.guest_limit} guests</span>
              </div>

              {event.location && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Venue</span>
                  <span className="font-semibold text-right">{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guest Shortcut View Card */}
          <div className="border rounded-3xl p-6 bg-card space-y-4 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Test Guest Experience
            </h3>
            <p className="text-xs text-muted-foreground">
              Preview what your guests see when they scan your QR code or open their camera.
            </p>

            <div className="space-y-2 pt-1">
              <Button variant="secondary" className="w-full rounded-xl text-xs font-semibold h-10" asChild>
                <Link href={`/join/${event.public_slug}`} target="_blank">
                  <Users className="mr-2 h-4 w-4" />
                  Open Guest Join Screen
                </Link>
              </Button>

              <Button variant="outline" className="w-full rounded-xl text-xs font-semibold h-10" asChild>
                <Link href={`/dashboard/events/${event.id}/moderation`}>
                  <Images className="mr-2 h-4 w-4" />
                  Go to Media Moderation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
