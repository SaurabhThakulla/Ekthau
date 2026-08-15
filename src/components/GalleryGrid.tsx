import { useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

import { MOCK_MODE, mockMedia } from '@/lib/mockData'

interface Media {
  id: string
  storage_path: string
  thumbnail_path: string | null
  mime_type: string
  width: number
  height: number
  uploaded_at: string
}

interface GalleryGridProps {
  eventId: string
  sessionTokenHash?: string // If guest
  isHost?: boolean
}

export default function GalleryGrid({ eventId, sessionTokenHash, isHost }: GalleryGridProps) {
  const fetchMedia = async ({ pageParam = 0 }) => {
    const limit = 20
    
    if (MOCK_MODE) {
      return { 
        data: mockMedia.filter(m => m.status === 'approved') as any, 
        nextOffset: null 
      }
    }

    if (isHost) {
      const { data, error } = await supabase
        .from('media')
        .select('id, storage_path, thumbnail_path, mime_type, width, height, uploaded_at')
        .eq('event_id', eventId)
        .eq('status', 'approved')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + limit - 1)
        
      if (error) throw error
      return { data, nextOffset: data.length === limit ? pageParam + limit : null }
    } else {
      // Guest uses RPC
      const { data, error } = await supabase.rpc('get_guest_gallery', {
        p_event_id: eventId,
        p_session_token_hash: sessionTokenHash,
        p_limit: limit,
        p_offset: pageParam
      })
      
      if (error) throw error
      return { data, nextOffset: data.length === limit ? pageParam + limit : null }
    }
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['gallery', eventId, isHost],
    queryFn: fetchMedia,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0
  })

  // Basic infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage()
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const getMediaUrl = (storagePath: string) => {
    // For MVP, we assume public access or signed URLs.
    // If the bucket is completely private, we would need to generate download URLs here.
    // However, generating hundreds of signed URLs is slow. A common pattern is to have an edge function proxy.
    // For now, we will construct a mock edge function URL or a public R2 url if configured.
    const publicDomain = import.meta.env.VITE_R2_PUBLIC_DOMAIN
    if (publicDomain) {
      return `https://${publicDomain}/${storagePath}`
    }
    // Fallback if no public domain (broken images without real implementation)
    return `/mock-storage/${storagePath}`
  }

  if (status === 'pending') {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  if (status === 'error') {
    return <div className="text-center p-12 text-destructive">Failed to load gallery</div>
  }

  const mediaItems = data.pages.flatMap((page) => page.data)

  if (mediaItems.length === 0) {
    return (
      <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg m-4">
        No photos or videos yet. Be the first to upload!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 p-1 md:p-2">
      {mediaItems.map((media: Media) => (
        <div key={media.id} className="aspect-square bg-gray-100 dark:bg-zinc-800 relative overflow-hidden group">
          {media.mime_type.startsWith('video/') ? (
            <div className="w-full h-full relative">
              <video 
                src={getMediaUrl(media.storage_path)} 
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                onMouseOut={(e) => {
                  const el = (e.target as HTMLVideoElement)
                  el.pause()
                  el.currentTime = 0
                }}
              />
              <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white font-medium">
                VIDEO
              </div>
            </div>
          ) : (
            <img 
              src={getMediaUrl(media.storage_path)} 
              alt="Event media" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="col-span-full flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
