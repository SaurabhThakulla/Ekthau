'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, MapPin, QrCode, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useGuest } from '@/features/guest/GuestContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, FieldHint } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Skeleton, LoadingRegion } from '@/components/ui/skeleton'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { formatEventDateLong } from '@/lib/format'
import { getMediaUrl } from '@/lib/media-url'
import { describeSupabaseError, isEventMissing } from '@/lib/supabase-errors'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

interface PublicEvent {
  id: string
  name: string
  event_date: string | null
  location: string | null
  cover_image_path: string | null
  allow_anonymous: boolean
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; event: PublicEvent }
  | { status: 'not-found' }
  | { status: 'error'; message: string }

function randomHex(bytes: number) {
  const buffer = new Uint8Array(bytes)
  crypto.getRandomValues(buffer)
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function JoinEventClient({ slug }: { slug: string }) {
  const router = useRouter()
  const { getSessionForSlug, setSession } = useGuest()
  const nameId = useId()
  const hintId = useId()

  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [displayName, setDisplayName] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const loadEvent = useCallback(async (): Promise<LoadState> => {
    if (MOCK_MODE) {
      const match = mockEvents.find(
        (event) => event.public_slug.toLowerCase() === slug.toLowerCase()
      )
      return match
        ? { status: 'ready', event: { ...match, allow_anonymous: true } as PublicEvent }
        : { status: 'not-found' }
    }

    // The RPC is the authoritative check — it also enforces "active" and
    // "not expired". A "not found" from it is a real answer, not a failure.
    const rpc = await supabase.rpc('get_public_event_info', { p_slug: slug })
    if (rpc.data) {
      return { status: 'ready', event: rpc.data as PublicEvent }
    }

    // "Event not found" from the RPC is a definitive answer, not a failure.
    if (rpc.error && !isEventMissing(rpc.error)) {
      // The function may not be deployed; fall back to the table, still guarded
      // by row-level security.
      const table = await supabase
        .from('events')
        .select('id, name, event_date, location, cover_image_path')
        .eq('public_slug', slug)
        .eq('status', 'active')
        .maybeSingle()

      if (table.data) {
        return {
          status: 'ready',
          event: { ...table.data, allow_anonymous: true } as PublicEvent,
        }
      }
      if (table.error) {
        return {
          status: 'error',
          message: describeSupabaseError(
            table.error,
            'We could not reach the event right now. Please try again.'
          ),
        }
      }
    }

    /**
     * Previously an unknown slug was turned into a fabricated event named after
     * the URL, so guests "joined" something that did not exist and every upload
     * failed later with a 401. An unknown code now says so.
     */
    return { status: 'not-found' }
  }, [slug])

  useEffect(() => {
    let active = true

    // A guest who already joined this event should go straight to the camera.
    const existing = getSessionForSlug(slug)
    if (existing) {
      setSession(existing)
      router.replace(`/e/${encodeURIComponent(slug)}/camera`)
      return
    }

    setState({ status: 'loading' })
    loadEvent()
      .then((result) => {
        if (active) setState(result)
      })
      .catch(() => {
        if (active) {
          setState({
            status: 'error',
            message: 'Something went wrong loading this event. Please try again.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [slug, reloadKey, loadEvent, getSessionForSlug, setSession, router])

  const handleJoin = async (anonymous: boolean) => {
    if (state.status !== 'ready' || joining) return
    const event = state.event

    setJoining(true)
    setJoinError(null)

    try {
      const sessionTokenHash = randomHex(32)
      const deviceId =
        window.localStorage.getItem('ekthau_device_id') ?? crypto.randomUUID()
      try {
        window.localStorage.setItem('ekthau_device_id', deviceId)
      } catch {
        // Private browsing — a per-visit device id is acceptable.
      }

      const finalName = anonymous ? 'Guest' : displayName.trim() || 'Guest'

      if (MOCK_MODE) {
        setSession({
          session_id: `session_${crypto.randomUUID()}`,
          event_id: event.id,
          event_slug: slug,
          event_name: event.name,
          display_name: finalName,
          expires_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
          session_token_hash: sessionTokenHash,
        })
        router.replace(`/e/${encodeURIComponent(slug)}/camera`)
        return
      }

      const { data, error } = await supabase.rpc('join_event', {
        p_slug: slug,
        p_display_name: finalName,
        p_device_id: deviceId,
        p_session_token_hash: sessionTokenHash,
      })

      if (error || !data?.session_id) {
        /**
         * A failed join used to fall through to a client-only session, which
         * looked like success but produced uploads the server always rejected.
         * It now surfaces the failure so the guest can retry.
         */
        setJoinError(
          describeSupabaseError(
            error,
            'The host may have closed this event. Ask them to check that it is still active.'
          )
        )
        setJoining(false)
        return
      }

      setSession({
        session_id: data.session_id,
        event_id: data.event_id,
        event_slug: slug,
        event_name: event.name,
        display_name: finalName,
        expires_at: data.expires_at,
        session_token_hash: sessionTokenHash,
      })
      router.replace(`/e/${encodeURIComponent(slug)}/camera`)
    } catch {
      setJoinError('We could not reach the server. Check your connection and try again.')
      setJoining(false)
    }
  }

  /* ── Loading ──────────────────────────────────────────────────────── */
  if (state.status === 'loading') {
    return (
      <Shell>
        <LoadingRegion label="Opening the event" className="space-y-6">
          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto size-20 rounded-2xl" />
            <Skeleton className="mx-auto h-7 w-52" />
            <Skeleton className="mx-auto h-4 w-40" />
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-white p-6 shadow-card">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </LoadingRegion>
      </Shell>
    )
  }

  /* ── Unknown code ─────────────────────────────────────────────────── */
  if (state.status === 'not-found') {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-white p-7 text-center shadow-card">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <QrCode className="size-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
            We can&apos;t find that event
          </h1>
          <p className="mx-auto mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
            The code <span className="font-mono font-semibold text-ink">{slug}</span>{' '}
            does not match an open event. It may be mistyped, or the host may have
            already closed it.
          </p>
          <div className="mt-6 space-y-2.5">
            <Button asChild block>
              <Link href="/join">
                <ArrowLeft aria-hidden="true" />
                Try another code
              </Link>
            </Button>
            <Button asChild variant="ghost" block>
              <Link href="/">What is Ekthau?</Link>
            </Button>
          </div>
        </div>
      </Shell>
    )
  }

  /* ── Load failure (retryable) ─────────────────────────────────────── */
  if (state.status === 'error') {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-white p-7 text-center shadow-card">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Something went wrong
          </h1>
          <p className="mx-auto mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
            {state.message}
          </p>
          <Button
            block
            className="mt-6"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      </Shell>
    )
  }

  /* ── Ready to join ────────────────────────────────────────────────── */
  const { event } = state
  const coverUrl = getMediaUrl(event.cover_image_path)

  return (
    <Shell>
      <div className="text-center">
        {coverUrl ? (
          <div className="relative mx-auto h-40 w-full overflow-hidden rounded-2xl bg-muted shadow-card">
            <Image
              src={coverUrl}
              alt={`Cover photo for ${event.name}`}
              fill
              sizes="(max-width: 640px) 92vw, 420px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-ink-gradient font-display text-3xl font-bold text-white shadow-card"
          >
            {event.name?.trim().charAt(0).toUpperCase() || 'E'}
          </div>
        )}

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {event.name}
        </h1>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
          {event.event_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden="true" />
              <time dateTime={event.event_date}>
                {formatEventDateLong(event.event_date)}
              </time>
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {event.location}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-card">
        {joinError && (
          <Alert tone="error" className="mb-5" title="We couldn't join you">
            <p>{joinError}</p>
          </Alert>
        )}

        <form
          onSubmit={(formEvent) => {
            formEvent.preventDefault()
            handleJoin(false)
          }}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor={nameId}>What should we call you?</Label>
            <Input
              id={nameId}
              name="displayName"
              value={displayName}
              autoComplete="nickname"
              enterKeyHint="go"
              maxLength={40}
              autoFocus
              placeholder="e.g. Aarav"
              aria-describedby={hintId}
              onChange={(inputEvent) => setDisplayName(inputEvent.target.value)}
              className="h-12"
            />
            <FieldHint id={hintId}>
              Shown next to the photos you add, so the host can thank you.
            </FieldHint>
          </div>

          <Button
            type="submit"
            block
            size="lg"
            loading={joining}
            loadingText="Joining…"
            disabled={!displayName.trim() && !event.allow_anonymous}
          >
            Start taking photos
          </Button>

          {event.allow_anonymous && (
            <Button
              variant="ghost"
              block
              disabled={joining}
              onClick={() => handleJoin(true)}
            >
              Join without a name
            </Button>
          )}
        </form>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-ink-muted">
        Your photos are shared with this event only. The host can remove anything at
        any time.
      </p>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <header className="pt-3 sm:pt-4">
        <Container className="flex h-16 items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 shadow-pill backdrop-blur-xl sm:px-6">
          <Logo />
          <Link
            href="/join"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-700"
          >
            Different event?
          </Link>
        </Container>
      </header>
      <main id="main" className="flex flex-1 items-center py-8 sm:py-12">
        <Container width="narrow">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </Container>
      </main>
    </div>
  )
}
