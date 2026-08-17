'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Check,
  Copy,
  ImageIcon,
  Layers,
  MapPin,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Skeleton, LoadingRegion } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import CustomSelect from '@/components/ui/custom-select'
import { JoinEventModalLazy } from '@/components/join-event-modal-lazy'
import { useAuth } from '@/features/auth/AuthContext'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'
import { copyToClipboard } from '@/lib/clipboard'
import { describeSupabaseError } from '@/lib/supabase-errors'
import { getMediaUrl } from '@/lib/media-url'
import { formatEventDate } from '@/lib/format'
import { absoluteUrl } from '@/lib/site'

interface EventItem {
  id: string
  name: string
  event_type?: string | null
  event_date: string
  location?: string | null
  status: string
  public_slug: string
  cover_image_path?: string | null
  guest_limit?: number | null
  storage_limit_bytes?: number | null
  created_at?: string | null
}

type SortKey = 'newest' | 'oldest' | 'date' | 'name'
type StatusKey = 'all' | 'active' | 'draft' | 'completed'

const STATUS_TABS: { key: StatusKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'completed', label: 'Completed' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyFailedId, setCopyFailedId] = useState<string | null>(null)
  const [joinOpen, setJoinOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const loadEvents = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setLoadError(null)

    if (MOCK_MODE) {
      setEvents(mockEvents as unknown as EventItem[])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('events')
      .select(
        'id, name, event_type, event_date, location, status, public_slug, cover_image_path, guest_limit, storage_limit_bytes, created_at'
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    /**
     * The previous version logged the error and left an empty array, which is
     * indistinguishable from "you have no events yet". A failure now says so and
     * offers a retry.
     */
    if (error) {
      setLoadError(
        describeSupabaseError(error, 'We could not load your events. Please try again.')
      )
    } else {
      setEvents(data ?? [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    let active = true
    loadEvents().catch(() => {
      if (active) {
        setLoadError('We could not load your events. Check your connection.')
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [loadEvents, reloadKey])

  // Clear the "Copied" confirmation without leaking a timer on unmount.
  useEffect(() => {
    if (!copiedId && !copyFailedId) return
    const timer = window.setTimeout(() => {
      setCopiedId(null)
      setCopyFailedId(null)
    }, 2200)
    return () => window.clearTimeout(timer)
  }, [copiedId, copyFailedId])

  const eventTypes = useMemo(() => {
    const types = new Set<string>()
    events.forEach((event) => {
      if (event.event_type) types.add(event.event_type)
    })
    return Array.from(types).sort()
  }, [events])

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return events
      .filter((event) => {
        if (statusFilter !== 'all' && event.status?.toLowerCase() !== statusFilter) {
          return false
        }
        if (typeFilter !== 'all' && event.event_type !== typeFilter) return false
        if (!query) return true

        return [event.name, event.location, event.public_slug, event.event_type]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(query))
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return timestamp(a) - timestamp(b)
          case 'date':
            return timestamp(a, true) - timestamp(b, true)
          case 'name':
            return a.name.localeCompare(b.name)
          default:
            return timestamp(b) - timestamp(a)
        }
      })
  }, [events, searchQuery, statusFilter, typeFilter, sortBy])

  const handleCopy = async (event: EventItem) => {
    // Built from the configured site URL, so it is correct even if the copy
    // happens before any client-side origin lookup has run.
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/join/${event.public_slug}`
        : absoluteUrl(`/join/${event.public_slug}`)

    const ok = await copyToClipboard(url)
    if (ok) setCopiedId(event.id)
    else setCopyFailedId(event.id)
  }

  const activeCount = events.filter((event) => event.status === 'active').length
  const guestCapacity = events.reduce(
    (total, event) => total + (event.guest_limit ?? 0),
    0
  )
  const filtersApplied =
    !!searchQuery.trim() || statusFilter !== 'all' || typeFilter !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            My events
          </h1>
          <p className="mt-1.5 max-w-prose text-sm text-ink-muted">
            Share a QR code, watch photos arrive, and download the originals when the
            party is over.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => setJoinOpen(true)}>
            <QrCode aria-hidden="true" />
            Join event
          </Button>
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus aria-hidden="true" />
              Create event
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary tiles — hidden while empty so a new host is not shown a wall of zeroes. */}
      {!loading && events.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { icon: Layers, label: 'Events', value: events.length, tone: 'bg-brand-50 text-brand-700' },
            { icon: Sparkles, label: 'Active now', value: activeCount, tone: 'bg-emerald-50 text-emerald-600' },
            { icon: Users, label: 'Guest capacity', value: guestCapacity || '—', tone: 'bg-amber-50 text-amber-600' },
            { icon: ImageIcon, label: 'Event types', value: eventTypes.length || 1, tone: 'bg-slate-100 text-slate-600' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-card backdrop-blur-sm"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}
              >
                <stat.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="truncate text-xs font-medium uppercase tracking-wide text-ink-muted">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 text-xl font-bold tracking-tight text-ink">
                  {stat.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {loadError && (
        <Alert
          tone="error"
          title="We couldn't load your events"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <RefreshCw aria-hidden="true" />
              Retry
            </Button>
          }
        >
          <p>{loadError}</p>
        </Alert>
      )}

      {/* Filters only make sense once there is more than one event to filter. */}
      {!loading && events.length > 1 && (
        <section
          aria-label="Filter events"
          className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-card backdrop-blur-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="event-search" className="sr-only">
                Search your events
              </label>
              <Input
                id="event-search"
                type="search"
                placeholder="Search by name, venue or code"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-muted hover:text-ink"
                >
                  <X className="size-4" aria-hidden="true" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {eventTypes.length > 1 && (
                <CustomSelect
                  label="Event type"
                  hideLabel
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { value: 'all', label: 'All types' },
                    ...eventTypes.map((type) => ({ value: type, label: type })),
                  ]}
                  className="w-40"
                />
              )}
              <CustomSelect
                label="Sort events by"
                hideLabel
                value={sortBy}
                onChange={(value) => setSortBy(value as SortKey)}
                options={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'date', label: 'Event date' },
                  { value: 'name', label: 'Name (A–Z)' },
                ]}
                className="w-44"
              />
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Filter by status"
            className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
          >
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-cta-gradient text-white shadow-cta'
                    : 'text-ink-muted hover:bg-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <LoadingRegion
          label="Loading your events"
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-card backdrop-blur-sm"
            >
              <Skeleton className="h-36 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </LoadingRegion>
      ) : events.length === 0 && !loadError ? (
        <EmptyState
          icon={Sparkles}
          title="Create your first event"
          description="Set it up in under a minute, print the QR card, and your guests can start adding photos straight away."
          action={
            <>
              <Button asChild size="lg">
                <Link href="/dashboard/events/new">
                  <Plus aria-hidden="true" />
                  Create event
                </Link>
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setJoinOpen(true)}>
                <QrCode aria-hidden="true" />
                Join someone else&apos;s event
              </Button>
            </>
          }
        />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          variant="plain"
          icon={Search}
          title="No events match those filters"
          description="Try a different search term, or clear the filters to see everything again."
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          {filtersApplied && (
            <p aria-live="polite" className="text-sm text-ink-muted">
              Showing {filteredEvents.length} of {events.length} events.
            </p>
          )}

          <ul role="list" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const coverUrl = getMediaUrl(event.cover_image_path)
              const isCopied = copiedId === event.id
              const copyFailed = copyFailedId === event.id

              return (
                <li key={event.id} className="flex">
                  <article className="group flex w-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-card backdrop-blur-sm transition-shadow hover:shadow-md">
                    <div className="relative h-36 overflow-hidden bg-ink-gradient">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={`Cover photo for ${event.name}`}
                          fill
                          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 45vw, 380px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold text-white/15"
                        >
                          {event.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"
                      />

                      <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                        {event.event_type ? (
                          <Badge tone="onDark">{event.event_type}</Badge>
                        ) : (
                          <span />
                        )}
                        <Badge
                          tone={event.status === 'active' ? 'success' : 'neutral'}
                          className="capitalize"
                        >
                          {event.status}
                        </Badge>
                      </div>

                      <h2 className="absolute inset-x-4 bottom-3 line-clamp-2 font-display text-lg font-semibold leading-tight text-white">
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="rounded outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          {event.name}
                        </Link>
                      </h2>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <dl className="space-y-2 text-sm text-ink-muted">
                        <div className="flex items-center gap-2">
                          <dt className="sr-only">Event date</dt>
                          <Calendar
                            className="size-4 shrink-0 text-brand-700"
                            aria-hidden="true"
                          />
                          <dd>
                            <time dateTime={event.event_date}>
                              {formatEventDate(event.event_date)}
                            </time>
                          </dd>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <dt className="sr-only">Venue</dt>
                            <MapPin
                              className="size-4 shrink-0 text-brand-700"
                              aria-hidden="true"
                            />
                            <dd className="line-clamp-1">{event.location}</dd>
                          </div>
                        )}
                      </dl>

                      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                            Event code
                          </p>
                          <code className="block truncate font-mono text-sm font-semibold text-ink">
                            {event.public_slug}
                          </code>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="shrink-0"
                          onClick={() => handleCopy(event)}
                        >
                          {isCopied ? (
                            <>
                              <Check className="text-emerald-600" aria-hidden="true" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy aria-hidden="true" />
                              Copy link
                            </>
                          )}
                        </Button>
                      </div>

                      <p aria-live="polite" className="sr-only">
                        {isCopied ? 'Join link copied to clipboard' : ''}
                      </p>
                      {copyFailed && (
                        <p className="text-xs text-destructive">
                          Copying is blocked in this browser. Open the event to see the
                          full link.
                        </p>
                      )}

                      <div className="mt-auto grid grid-cols-2 gap-2">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/dashboard/events/${event.id}/moderation`}>
                            <ImageIcon aria-hidden="true" />
                            Photos
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/dashboard/events/${event.id}`}>
                            <QrCode aria-hidden="true" />
                            QR &amp; share
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <JoinEventModalLazy open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  )
}

function timestamp(event: EventItem, preferEventDate = false) {
  const value = preferEventDate
    ? event.event_date
    : event.created_at || event.event_date
  const time = value ? new Date(value).getTime() : Number.NaN
  return Number.isNaN(time) ? 0 : time
}
