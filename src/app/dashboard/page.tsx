'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import JoinEventModal from '@/components/JoinEventModal'
import {
  Loader2,
  Calendar,
  MapPin,
  Plus,
  Search,
  QrCode,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Users,
  Image as ImageIcon,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Layers,
  Activity,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

interface EventItem {
  id: string
  name: string
  event_type?: string
  event_date: string
  location?: string | null
  status: string
  public_slug: string
  cover_image_path?: string | null
  guest_limit?: number
  storage_limit_bytes?: number
  created_at?: string
}

export default function OverviewPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'date' | 'name'>('newest')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    async function loadEvents() {
      if (!user) return

      if (MOCK_MODE) {
        setEvents(mockEvents as unknown as EventItem[])
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, name, event_type, event_date, location, status, public_slug, cover_image_path, guest_limit, storage_limit_bytes, created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setEvents(data)
        }
      } catch (err) {
        console.error('Error loading events:', err)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [user])

  // Extract distinct event types
  const eventTypes = useMemo(() => {
    const types = new Set<string>()
    events.forEach((e) => {
      if (e.event_type) types.add(e.event_type)
    })
    return Array.from(types)
  }, [events])

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Status filter
        if (statusFilter !== 'all' && ev.status?.toLowerCase() !== statusFilter) {
          return false
        }
        // Type filter
        if (typeFilter !== 'all' && ev.event_type !== typeFilter) {
          return false
        }
        // Search query filter (matches name, location, public slug, event type)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const nameMatch = ev.name?.toLowerCase().includes(q)
          const locationMatch = ev.location?.toLowerCase().includes(q)
          const slugMatch = ev.public_slug?.toLowerCase().includes(q)
          const typeMatch = ev.event_type?.toLowerCase().includes(q)
          return nameMatch || locationMatch || slugMatch || typeMatch
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || b.event_date).getTime() - new Date(a.created_at || a.event_date).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at || a.event_date).getTime() - new Date(b.created_at || b.event_date).getTime()
        }
        if (sortBy === 'date') {
          return new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name)
        }
        return 0
      })
  }, [events, searchQuery, statusFilter, typeFilter, sortBy])

  // Copy event join link
  const copyLink = (publicSlug: string, eventId: string) => {
    const url = `${origin || ''}/join/${publicSlug}`
    navigator.clipboard.writeText(url)
    setCopiedId(eventId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Dashboard Metrics
  const activeCount = useMemo(() => events.filter((e) => e.status === 'active').length, [events])
  const totalGuests = useMemo(() => events.reduce((acc, e) => acc + (e.guest_limit || 30), 0), [events])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading your events...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Events Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your event galleries, track live guest uploads, and download original media.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setJoinModalOpen(true)}
            className="rounded-xl h-10 font-semibold border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
          >
            <QrCode className="h-4 w-4 mr-2 text-primary" />
            Join Event
          </Button>

          <Button asChild className="rounded-xl h-10 font-semibold shadow-md shadow-primary/20">
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Events</p>
            <h3 className="text-2xl font-bold tracking-tight">{events.length}</h3>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Spaces</p>
            <h3 className="text-2xl font-bold tracking-tight">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guest Quota</p>
            <h3 className="text-2xl font-bold tracking-tight">{totalGuests}</h3>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instant QR</p>
            <h3 className="text-2xl font-bold tracking-tight">Enabled</h3>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event name, code, venue, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 h-11 rounded-xl bg-background border-input focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-xs font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="date">Event Date Soonest</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Tabs and Type Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            {(['all', 'active', 'draft', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-background shadow-xs text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          {eventTypes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium focus-visible:ring-primary"
              >
                <option value="all">All Types</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid / List */}
      {filteredEvents.length === 0 ? (
        events.length === 0 ? (
          /* Entirely Empty Dashboard */
          <div className="border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center flex flex-col items-center justify-center bg-card/50">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Create your first event space</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
              Generate instant QR codes, invite wedding or party guests, and start collecting memories in real time.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild className="rounded-xl h-11 px-6 font-semibold shadow-md shadow-primary/20">
                <Link href="/dashboard/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => setJoinModalOpen(true)}
                className="rounded-xl h-11 px-5 font-semibold"
              >
                <QrCode className="mr-2 h-4 w-4 text-primary" />
                Join Existing Event
              </Button>
            </div>
          </div>
        ) : (
          /* Search / Filter Zero Results */
          <div className="border rounded-2xl p-12 text-center bg-card space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">No events match your criteria</h3>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t find any events matching &ldquo;{searchQuery || statusFilter}&rdquo;.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setTypeFilter('all')
              }}
              className="rounded-xl text-xs font-semibold"
            >
              Reset Search & Filters
            </Button>
          </div>
        )
      ) : (
        /* Event Cards Grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const isCopied = copiedId === event.id
            const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div
                key={event.id}
                className="border rounded-3xl overflow-hidden bg-card hover:border-primary/50 transition-all hover:shadow-lg flex flex-col group"
              >
                {/* Card Top Banner / Cover */}
                <div className="relative h-36 bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden">
                  {event.cover_image_path ? (
                    <Image
                      src={event.cover_image_path}
                      alt={event.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-indigo-500/20 to-purple-600/30 flex items-center justify-center">
                      <span className="text-5xl font-black text-white/20 select-none uppercase">
                        {event.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full backdrop-blur-md bg-black/50 text-white border border-white/10 uppercase tracking-wider">
                      {event.event_type || 'Event'}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full capitalize backdrop-blur-md border ${
                        event.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          : 'bg-zinc-800/80 text-zinc-300 border-zinc-600/30'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-3 inset-x-3 z-10">
                    <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-primary-foreground transition-colors">
                      {event.name}
                    </h3>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>{formattedDate}</span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}

                    {/* Event Code Pill */}
                    <div className="pt-2 flex items-center justify-between bg-muted/50 p-2 rounded-xl border">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Event Code
                        </span>
                        <code className="text-xs font-mono font-bold text-foreground">
                          {event.public_slug}
                        </code>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyLink(event.public_slug, event.id)}
                        className="h-7 px-2 text-xs rounded-lg hover:bg-background"
                        title="Copy event join link"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                            <span className="text-[11px] text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span className="text-[11px]">Copy Link</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-2 border-t grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-semibold h-9">
                      <Link href={`/dashboard/events/${event.id}/moderation`}>
                        <ImageIcon className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                        Moderate
                      </Link>
                    </Button>

                    <Button size="sm" asChild className="rounded-xl text-xs font-semibold h-9 shadow-xs">
                      <Link href={`/dashboard/events/${event.id}`}>
                        <QrCode className="h-3.5 w-3.5 mr-1.5" />
                        QR & Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Global Join Modal */}
      <JoinEventModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </div>
  )
}
