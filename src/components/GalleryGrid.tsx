'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Camera, ImageOff, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Skeleton, LoadingRegion } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { getMediaUrl } from '@/lib/media-url'
import { MOCK_MODE, mockMedia } from '@/lib/mockData'

interface Media {
  id: string
  storage_path: string
  thumbnail_path: string | null
  mime_type: string
  width: number | null
  height: number | null
  uploaded_at: string | null
}

interface GalleryGridProps {
  eventId: string
  eventSlug?: string
  sessionTokenHash?: string
  isHost?: boolean
}

const PAGE_SIZE = 24

export default function GalleryGrid({
  eventId,
  eventSlug,
  sessionTokenHash,
  isHost,
}: GalleryGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['gallery', eventId, isHost ?? false],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number

      if (MOCK_MODE) {
        return {
          data: mockMedia.filter(
            (item) => item.status === 'approved'
          ) as unknown as Media[],
          nextOffset: null as number | null,
        }
      }

      if (isHost) {
        const { data: rows, error: queryError } = await supabase
          .from('media')
          .select('id, storage_path, thumbnail_path, mime_type, width, height, uploaded_at')
          .eq('event_id', eventId)
          .eq('status', 'approved')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1)

        if (queryError) throw queryError
        const list = rows ?? []
        return {
          data: list as Media[],
          nextOffset: list.length === PAGE_SIZE ? offset + PAGE_SIZE : null,
        }
      }

      const { data: rows, error: rpcError } = await supabase.rpc('get_guest_gallery', {
        p_event_id: eventId,
        p_session_token_hash: sessionTokenHash,
        p_limit: PAGE_SIZE,
        p_offset: offset,
      })

      if (rpcError) throw rpcError
      // The RPC returns JSON, which can legitimately be null when empty.
      const list = (Array.isArray(rows) ? rows : []) as Media[]
      return {
        data: list,
        nextOffset: list.length === PAGE_SIZE ? offset + PAGE_SIZE : null,
      }
    },
    // Declared after queryFn so its page type is inferred rather than unknown.
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  })

  /**
   * Paging is driven by an IntersectionObserver instead of a scroll listener.
   * The old listener ran unthrottled on every scroll event and read layout
   * (`scrollHeight`) each time, which forced a reflow per frame on mobile.
   */
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '600px 0px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (status === 'pending') {
    return (
      <LoadingRegion
        label="Loading photos"
        className="grid grid-cols-2 gap-1.5 p-1.5 sm:grid-cols-3 md:gap-2 md:p-2 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-lg" />
        ))}
      </LoadingRegion>
    )
  }

  if (status === 'error') {
    return (
      <div className="p-4">
        <Alert
          tone="error"
          title="We couldn't load the gallery"
          action={
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              <RefreshCw aria-hidden="true" />
              Retry
            </Button>
          }
        >
          <p>
            {error instanceof Error
              ? error.message
              : 'Something went wrong fetching the photos.'}
          </p>
        </Alert>
      </div>
    )
  }

  const items = data.pages.flatMap((page) => page.data)

  if (items.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={Camera}
          title="No photos yet"
          description="Be the first to add one — open the camera and take a shot. It appears here for everyone once the host approves it."
          action={
            eventSlug && (
              <Button asChild size="lg">
                <Link href={`/e/${encodeURIComponent(eventSlug)}/camera`}>
                  <Camera aria-hidden="true" />
                  Open the camera
                </Link>
              </Button>
            )
          }
        />
      </div>
    )
  }

  return (
    <>
      <ul
        role="list"
        className="grid grid-cols-2 gap-1.5 p-1.5 sm:grid-cols-3 md:gap-2 md:p-2 lg:grid-cols-4"
      >
        {items.map((media) => (
          <li key={media.id}>
            <MediaTile media={media} />
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} aria-hidden="true" className="h-1" />

      {isFetchingNextPage && (
        <p
          role="status"
          className="flex items-center justify-center gap-2 p-6 text-sm text-ink-muted"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading more photos…
        </p>
      )}

      {!hasNextPage && items.length > PAGE_SIZE && (
        <p className="p-6 text-center text-sm text-ink-muted">
          That&apos;s everything so far.
        </p>
      )}
    </>
  )
}

function MediaTile({ media }: { media: Media }) {
  const [failed, setFailed] = useState(false)
  const isVideo = media.mime_type?.startsWith('video/')
  const previewUrl = getMediaUrl(media.thumbnail_path || media.storage_path)
  const fullUrl = getMediaUrl(media.storage_path)

  if (!previewUrl || failed) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg bg-muted p-3 text-center">
        <ImageOff className="size-5 text-slate-400" aria-hidden="true" />
        <p className="text-[11px] leading-tight text-ink-muted">Unavailable</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
      {isVideo ? (
        <>
          <video
            src={fullUrl ?? undefined}
            controls
            preload="metadata"
            playsInline
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
          <span className="pointer-events-none absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Video
          </span>
        </>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- guest media is served
           from external object storage and is not routed through the optimiser. */
        <img
          src={previewUrl}
          alt={
            media.uploaded_at
              ? `Photo shared on ${new Date(media.uploaded_at).toLocaleDateString('en-GB')}`
              : 'Photo shared by a guest'
          }
          loading="lazy"
          decoding="async"
          // Explicit dimensions reserve the box and stop the grid shifting as
          // images arrive.
          width={media.width ?? 800}
          height={media.height ?? 800}
          className="size-full object-cover transition-transform duration-300 hover:scale-105"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
