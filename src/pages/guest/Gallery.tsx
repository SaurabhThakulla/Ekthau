import { useParams, Link } from 'react-router-dom'
import { useGuest } from '@/features/guest/GuestContext'
import GalleryGrid from '@/components/GalleryGrid'
import { Camera } from 'lucide-react'

export default function GuestGallery() {
  const { slug } = useParams()
  const { session } = useGuest()

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 p-4 text-center">
        <p>Please join the event to view the gallery.</p>
        <Link to={`/join/${slug}`} className="text-primary hover:underline font-medium">
          Join Event
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-zinc-950 pb-20">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold tracking-tight text-lg">Event Gallery</h1>
        <Link to={`/e/${slug}/camera`} className="text-primary">
          <Camera className="h-5 w-5" />
        </Link>
      </div>
      
      <GalleryGrid 
        eventId={session.event_id} 
        sessionTokenHash={session.session_token_hash} 
      />
    </div>
  )
}
