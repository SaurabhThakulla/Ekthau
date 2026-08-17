'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Download,
  ExternalLink,
  Images,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Skeleton, LoadingRegion } from '@/components/ui/skeleton'
import { copyToClipboard } from '@/lib/clipboard'
import { formatEventDateLong } from '@/lib/format'
import { describeSupabaseError } from '@/lib/supabase-errors'
import { formatBytes } from '@/lib/media-url'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'
import { absoluteUrl } from '@/lib/site'

interface EventDetail {
  id: string
  name: string
  public_slug: string
  status: string
  guest_limit: number | null
  storage_limit_bytes: number | null
  plan: string | null
  event_date: string | null
  location: string | null
  expires_at: string | null
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; event: EventDetail }
  | { status: 'not-found' }
  | { status: 'error'; message: string }

const QR_SIZE = 224

export default function EventDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''

  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)
  const [copyError, setCopyError] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const qrWrapperRef = useRef<HTMLDivElement>(null)

  // The QR code must encode an absolute URL, so it is only rendered once the
  // real origin is known rather than guessed.
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const load = useCallback(async (): Promise<LoadState> => {
    if (!id) return { status: 'not-found' }

    if (MOCK_MODE) {
      const match = mockEvents.find((event) => event.id === id)
      return match
        ? { status: 'ready', event: match as unknown as EventDetail }
        : { status: 'not-found' }
    }

    const { data, error } = await supabase
      .from('events')
      .select(
        'id, name, public_slug, status, guest_limit, storage_limit_bytes, plan, event_date, location, expires_at'
      )
      .eq('id', id)
      .maybeSingle()

    if (error) {
      /**
       * The old code silently substituted a mock event when the query failed,
       * so a permissions problem looked like somebody else's wedding. Errors are
       * now reported as errors.
       */
      return {
        status: 'error',
        message: describeSupabaseError(
          error,
          'We could not load this event. Please try again.'
        ),
      }
    }
    if (!data) return { status: 'not-found' }
    return { status: 'ready', event: data as EventDetail }
  }, [id])

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    load()
      .then((result) => {
        if (active) setState(result)
      })
      .catch(() => {
        if (active) {
          setState({
            status: 'error',
            message: 'We could not load this event. Check your connection.',
          })
        }
      })
    return () => {
      active = false
    }
  }, [load, reloadKey])

  useEffect(() => {
    if (!copied && !copyError) return
    const timer = window.setTimeout(() => {
      setCopied(null)
      setCopyError(false)
    }, 2200)
    return () => window.clearTimeout(timer)
  }, [copied, copyError])

  const event = state.status === 'ready' ? state.event : null
  const joinUrl = event
    ? `${origin || absoluteUrl('')}/join/${event.public_slug}`
    : ''

  const handleCopy = async (what: 'link' | 'code') => {
    if (!event) return
    const ok = await copyToClipboard(what === 'link' ? joinUrl : event.public_slug)
    if (ok) setCopied(what)
    else setCopyError(true)
  }

  /**
   * Renders the on-screen SVG to a PNG with a white quiet zone and the event
   * code printed underneath, so a printed card is scannable and readable.
   * The previous version used `btoa`, which throws on any non-Latin1 character.
   */
  const downloadQr = () => {
    setDownloadError(null)
    const svg = qrWrapperRef.current?.querySelector('svg')
    if (!svg || !event) {
      setDownloadError('The QR code is still rendering. Try again in a moment.')
      return
    }

    const padding = 48
    const captionHeight = 56
    const scale = 3
    const source = new XMLSerializer().serializeToString(svg)
    // Encode as UTF-8 before base64 so non-ASCII content cannot break it.
    const encoded = window.btoa(
      String.fromCharCode(...new TextEncoder().encode(source))
    )

    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = (QR_SIZE + padding * 2) * scale
      canvas.height = (QR_SIZE + padding * 2 + captionHeight) * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setDownloadError('Your browser could not generate the image.')
        return
      }

      ctx.scale(scale, scale)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, padding, padding, QR_SIZE, QR_SIZE)

      ctx.fillStyle = '#0B132B'
      ctx.textAlign = 'center'
      ctx.font = '600 15px system-ui, sans-serif'
      ctx.fillText('Scan to add your photos', (QR_SIZE + padding * 2) / 2, QR_SIZE + padding + 26)
      ctx.font = '500 13px ui-monospace, monospace'
      ctx.fillStyle = '#475569'
      ctx.fillText(
        `Code: ${event.public_slug}`,
        (QR_SIZE + padding * 2) / 2,
        QR_SIZE + padding + 46
      )

      const link = document.createElement('a')
      link.download = `${slugifyFilename(event.name)}-qr.png`
      link.href = canvas.toDataURL('image/png')
      // Appending is required for the click to register in Firefox.
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
    image.onerror = () => {
      setDownloadError('The QR image could not be generated. Try a different browser.')
    }
    image.src = `data:image/svg+xml;base64,${encoded}`
  }

  if (state.status === 'loading') {
    return (
      <LoadingRegion label="Loading event details" className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-[26rem] rounded-2xl lg:col-span-7" />
          <div className="space-y-6 lg:col-span-5">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </LoadingRegion>
    )
  }

  if (state.status === 'not-found') {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Event not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          This event may have been deleted, or it belongs to a different account.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">
            <ArrowLeft aria-hidden="true" />
            Back to my events
          </Link>
        </Button>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-md py-12">
        <Alert
          tone="error"
          title="We couldn't load this event"
          action={
            <Button size="sm" variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCw aria-hidden="true" />
              Retry
            </Button>
          }
        >
          <p>{state.message}</p>
        </Alert>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/dashboard">
            <ArrowLeft aria-hidden="true" />
            Back to my events
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link href="/dashboard">
            <ArrowLeft aria-hidden="true" />
            All events
          </Link>
        </Button>

        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={event!.status === 'active' ? 'success' : 'neutral'} className="capitalize">
                {event!.status}
              </Badge>
              {event!.plan && <Badge tone="brand">{event!.plan}</Badge>}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {event!.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
              {event!.event_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" aria-hidden="true" />
                  <time dateTime={event!.event_date}>
                    {formatEventDateLong(event!.event_date)}
                  </time>
                </span>
              )}
              {event!.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {event!.location}
                </span>
              )}
            </div>
          </div>

          <Button asChild variant="secondary" className="shrink-0">
            <Link href={`/dashboard/events/${event!.id}/moderation`}>
              <Images aria-hidden="true" />
              Review photos
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── Share panel ────────────────────────────────────────────── */}
        <section
          aria-labelledby="share-heading"
          className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur-sm lg:col-span-7 sm:p-8"
        >
          <div className="text-center">
            <h2 id="share-heading" className="text-lg font-semibold text-ink">
              Your guest QR code
            </h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">
              Print it for the tables. Guests point any phone camera at it and start
              taking photos — no app, no sign-in.
            </p>
          </div>

          <div
            ref={qrWrapperRef}
            className="mx-auto mt-6 w-fit rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            {origin ? (
              <QRCodeSVG
                value={joinUrl}
                size={QR_SIZE}
                level="H"
                marginSize={0}
                title={`QR code linking to the ${event!.name} photo gallery`}
              />
            ) : (
              <Skeleton
                className="rounded-xl"
                style={{ width: QR_SIZE, height: QR_SIZE }}
              />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-3.5">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                Event code for manual entry
              </p>
              <code className="block truncate font-mono text-base font-semibold text-ink">
                {event!.public_slug}
              </code>
            </div>
            <Button size="sm" variant="secondary" className="shrink-0" onClick={() => handleCopy('code')}>
              {copied === 'code' ? (
                <>
                  <Check className="text-emerald-600" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy aria-hidden="true" />
                  Copy code
                </>
              )}
            </Button>
          </div>

          <div className="mt-3 space-y-2.5">
            <div className="flex gap-2">
              <Button variant="secondary" block onClick={() => handleCopy('link')}>
                {copied === 'link' ? (
                  <>
                    <Check className="text-emerald-600" aria-hidden="true" />
                    Link copied
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" />
                    Copy share link
                  </>
                )}
              </Button>
              <Button asChild variant="secondary" size="iconLg" className="shrink-0">
                <Link
                  href={`/join/${event!.public_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink aria-hidden="true" />
                  <span className="sr-only">
                    Open the guest join page in a new tab
                  </span>
                </Link>
              </Button>
            </div>

            <Button block onClick={downloadQr} disabled={!origin}>
              <Download aria-hidden="true" />
              Download printable QR code
            </Button>
          </div>

          <p aria-live="polite" className="sr-only">
            {copied === 'link' ? 'Share link copied to clipboard.' : ''}
            {copied === 'code' ? 'Event code copied to clipboard.' : ''}
          </p>

          {copyError && (
            <p className="mt-3 text-center text-xs text-destructive">
              Copying is blocked in this browser. Select the code above and copy it
              manually.
            </p>
          )}
          {downloadError && (
            <p role="alert" className="mt-3 text-center text-xs text-destructive">
              {downloadError}
            </p>
          )}
        </section>

        {/* ── Side panels ────────────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-5">
          <section
            aria-labelledby="details-heading"
            className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur-sm"
          >
            <h2 id="details-heading" className="text-base font-semibold text-ink">
              Event settings
            </h2>
            <dl className="mt-4 divide-y divide-border text-sm">
              {[
                {
                  label: 'Guest limit',
                  value: event!.guest_limit
                    ? `${event!.guest_limit >= 10_000 ? 'Unlimited' : event!.guest_limit} guests`
                    : '—',
                },
                {
                  label: 'Storage',
                  value: event!.storage_limit_bytes
                    ? formatBytes(event!.storage_limit_bytes, 0)
                    : '—',
                },
                {
                  label: 'Photos available until',
                  value: event!.expires_at
                    ? formatEventDateLong(event!.expires_at)
                    : '—',
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-ink-muted">{row.label}</dt>
                  <dd className="text-right font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="preview-heading"
            className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur-sm"
          >
            <h2 id="preview-heading" className="text-base font-semibold text-ink">
              Check what guests see
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              Worth doing once before the event so you know the flow.
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild variant="secondary" block>
                <Link
                  href={`/join/${event!.public_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Users aria-hidden="true" />
                  Open the guest join screen
                </Link>
              </Button>
              <Button asChild variant="ghost" block>
                <Link href={`/dashboard/events/${event!.id}/moderation`}>
                  <Images aria-hidden="true" />
                  Go to photo review
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function slugifyFilename(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'ekthau-event'
  )
}
