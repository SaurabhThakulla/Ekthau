'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import GalleryGrid from '@/components/GalleryGrid'
import { GuestSessionGate } from '@/components/guest/guest-session-gate'
import { Container } from '@/components/layout/container'

export default function GuestGalleryPage() {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : ''

  return (
    <GuestSessionGate slug={slug}>
      {(session) => (
        <div className="min-h-[100dvh] bg-muted/30 pb-16">
          <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur-md">
            <Container className="flex h-14 items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight text-ink">
                  {session.event_name || 'Event gallery'}
                </h1>
                <p className="text-xs text-ink-muted">Photos everyone has shared</p>
              </div>
              <Link
                href={`/e/${encodeURIComponent(slug)}/camera`}
                className="flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-brand-700 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                <Camera className="size-4" aria-hidden="true" />
                Camera
              </Link>
            </Container>
          </header>

          <main id="main">
            <GalleryGrid
              eventId={session.event_id}
              eventSlug={slug}
              sessionTokenHash={session.session_token_hash}
            />
          </main>
        </div>
      )}
    </GuestSessionGate>
  )
}
