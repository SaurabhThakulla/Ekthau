'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, ExternalLink, Download } from 'lucide-react'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

interface EventDetail {
  id: string
  name: string
  public_slug: string
  status: string
  guest_limit: number
}

export default function EventDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
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
        .select('id, name, public_slug, status, guest_limit')
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
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!event) {
    return <div className="text-center p-12">Event not found</div>
  }

  const joinUrl = `${origin || ''}/join/${event.public_slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your event settings and media.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Card */}
        <div className="border rounded-lg p-6 bg-card flex flex-col items-center text-center space-y-4">
          <h3 className="font-semibold text-lg">Share your event</h3>
          <p className="text-sm text-muted-foreground">
            Guests can scan this code to join and upload photos without downloading an app.
          </p>

          <div className="bg-white p-4 rounded-xl shadow-sm border mt-4">
            <QRCodeSVG
              id="qr-code"
              value={joinUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/join/${event.public_slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Button className="w-full" onClick={downloadQR}>
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="font-semibold text-lg mb-4">Event Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize font-medium">{event.status}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Guest Limit</span>
                <span className="font-medium">{event.guest_limit}</span>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/dashboard/events/${event.id}/moderation`}>
                    Manage & Moderate Media
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
