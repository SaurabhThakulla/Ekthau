'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  ImageOff,
  Images,
  RefreshCw,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Skeleton, LoadingRegion } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ConfirmDialog } from '@/components/ui/modal'
import { getMediaUrl } from '@/lib/media-url'
import { describeSupabaseError } from '@/lib/supabase-errors'
import { MOCK_MODE, mockMedia } from '@/lib/mockData'

interface MediaItem {
  id: string
  storage_path: string
  thumbnail_path?: string | null
  mime_type: string
  status: string
  created_at: string
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Waiting' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Hidden' },
]

export default function ModerationPage() {
  const params = useParams()
  const eventId = typeof params?.id === 'string' ? params.id : ''

  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const loadMedia = useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setLoadError(null)

    if (MOCK_MODE) {
      setMedia(mockMedia as unknown as MediaItem[])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('media')
      .select('id, storage_path, thumbnail_path, mime_type, status, created_at')
      .eq('event_id', eventId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error)
      setLoadError(
        describeSupabaseError(error, 'We could not load the photos. Please try again.')
      )
    else setMedia(data ?? [])
    setLoading(false)
  }, [eventId])

  useEffect(() => {
    let active = true
    loadMedia().catch(() => {
      if (active) {
        setLoadError('We could not load the photos. Check your connection.')
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [loadMedia, reloadKey])

  const counts = useMemo(
    () => ({
      all: media.length,
      pending: media.filter((item) => item.status === 'pending').length,
      approved: media.filter((item) => item.status === 'approved').length,
      rejected: media.filter((item) => item.status === 'rejected').length,
    }),
    [media]
  )

  const visible = useMemo(
    () => (filter === 'all' ? media : media.filter((item) => item.status === filter)),
    [media, filter]
  )

  /**
   * Applied optimistically and rolled back if the write fails, so the grid never
   * shows a state the database did not accept. The previous version updated
   * local state only on success and silently did nothing on failure.
   */
  const updateStatus = async (item: MediaItem, nextStatus: string) => {
    const previousStatus = item.status
    setActionError(null)
    setBusyId(item.id)
    setMedia((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, status: nextStatus } : entry
      )
    )

    if (MOCK_MODE) {
      setBusyId(null)
      return
    }

    const { error } = await supabase
      .from('media')
      .update({ status: nextStatus })
      .eq('id', item.id)

    if (error) {
      setMedia((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status: previousStatus } : entry
        )
      )
      setActionError(describeSupabaseError(error, 'That photo could not be updated.'))
    }
    setBusyId(null)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const target = pendingDelete
    setDeleting(true)
    setActionError(null)

    if (MOCK_MODE) {
      setMedia((current) => current.filter((entry) => entry.id !== target.id))
      setPendingDelete(null)
      setDeleting(false)
      return
    }

    const { error } = await supabase
      .from('media')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', target.id)

    if (error) {
      setActionError(describeSupabaseError(error, 'That photo could not be removed.'))
    } else {
      setMedia((current) => current.filter((entry) => entry.id !== target.id))
    }
    setPendingDelete(null)
    setDeleting(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link href={`/dashboard/events/${eventId}`}>
            <ArrowLeft aria-hidden="true" />
            Back to event
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Review photos
        </h1>
        <p className="mt-1.5 max-w-prose text-sm text-ink-muted">
          Approve what appears in the guest gallery and on the live wall. Hidden
          photos stay in your album but are not shown to guests.
        </p>
      </div>

      {loadError && (
        <Alert
          tone="error"
          title="We couldn't load the photos"
          action={
            <Button size="sm" variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCw aria-hidden="true" />
              Retry
            </Button>
          }
        >
          <p>{loadError}</p>
        </Alert>
      )}

      {actionError && (
        <Alert tone="error" title="That action didn't go through">
          <p>{actionError}</p>
        </Alert>
      )}

      {!loading && media.length > 0 && (
        <div
          role="tablist"
          aria-label="Filter photos by status"
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
        >
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={filter === tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-muted hover:bg-muted hover:text-ink'
              }`}
            >
              {tab.label}
              <span
                className={`rounded px-1.5 text-xs ${
                  filter === tab.key ? 'bg-white/20' : 'bg-muted'
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingRegion
          label="Loading photos"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-border bg-white"
            >
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-3">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </LoadingRegion>
      ) : media.length === 0 && !loadError ? (
        <EmptyState
          icon={Images}
          title="No photos yet"
          description="As soon as a guest scans your QR code and takes a photo, it appears here for you to approve."
          action={
            <Button asChild>
              <Link href={`/dashboard/events/${eventId}`}>Get the QR code</Link>
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          variant="plain"
          icon={Images}
          title={`Nothing in "${FILTERS.find((f) => f.key === filter)?.label}"`}
          description="Try a different filter to see the rest of the album."
          action={
            <Button variant="secondary" onClick={() => setFilter('all')}>
              Show all photos
            </Button>
          }
        />
      ) : (
        <ul
          role="list"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {visible.map((item) => (
            <li key={item.id}>
              <MediaCard
                item={item}
                busy={busyId === item.id}
                onApprove={() => updateStatus(item, 'approved')}
                onReject={() => updateStatus(item, 'rejected')}
                onDelete={() => setPendingDelete(item)}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        destructive
        title="Remove this photo?"
        description="It will be taken out of your album and the guest gallery. This cannot be undone from here."
        confirmLabel="Remove photo"
      />
    </div>
  )
}

function MediaCard({
  item,
  busy,
  onApprove,
  onReject,
  onDelete,
}: {
  item: MediaItem
  busy: boolean
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
}) {
  const [failed, setFailed] = useState(false)
  const isVideo = item.mime_type?.startsWith('video/')
  const url = getMediaUrl(item.thumbnail_path || item.storage_path)
  const fullUrl = getMediaUrl(item.storage_path)

  const statusTone =
    item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'
  const statusLabel =
    item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Hidden' : 'Waiting'

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      <div className="relative aspect-square bg-muted">
        {!url || failed ? (
          // A real placeholder instead of a browser-broken-image icon.
          <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center">
            <ImageOff className="size-6 text-slate-400" aria-hidden="true" />
            <p className="text-[11px] leading-tight text-ink-muted">
              Preview unavailable
            </p>
          </div>
        ) : isVideo ? (
          <video
            src={fullUrl ?? undefined}
            controls
            preload="metadata"
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- guest media lives
             on an external storage domain and is not run through the optimiser. */
          <img
            src={url}
            alt={`Guest upload from ${new Date(item.created_at).toLocaleString('en-GB')}`}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        )}

        <Badge tone={statusTone} className="absolute left-2 top-2 shadow-sm">
          {statusLabel}
        </Badge>
      </div>

      <div className="flex items-center gap-1.5 p-2.5">
        {item.status !== 'approved' && (
          <Button
            size="sm"
            variant="secondary"
            block
            disabled={busy}
            onClick={onApprove}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <Check aria-hidden="true" />
            Approve
          </Button>
        )}

        {item.status === 'approved' && (
          <Button size="sm" variant="secondary" block disabled={busy} onClick={onReject}>
            <Undo2 aria-hidden="true" />
            Hide
          </Button>
        )}

        {item.status === 'pending' && (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={onReject}
            aria-label="Hide this photo from guests"
            className="shrink-0"
          >
            <X aria-hidden="true" />
          </Button>
        )}

        <Button
          size="sm"
          variant="outlineDestructive"
          disabled={busy}
          onClick={onDelete}
          aria-label="Remove this photo permanently"
          className="shrink-0"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </article>
  )
}
