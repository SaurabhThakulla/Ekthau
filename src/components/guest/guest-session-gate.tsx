'use client'

import Link from 'next/link'
import { Camera, Loader2 } from 'lucide-react'
import { useGuest, type GuestSession } from '@/features/guest/GuestContext'
import { Button } from '@/components/ui/button'

/**
 * Guards the guest camera and gallery. It waits for the stored session to be
 * read before deciding — previously these screens rendered "please join first"
 * on every reload because the in-memory session had not been restored yet.
 */
export function GuestSessionGate({
  slug,
  children,
}: {
  slug: string
  children: (session: GuestSession) => React.ReactNode
}) {
  const { session, ready } = useGuest()

  if (!ready) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-ink text-white"
      >
        <Loader2 className="size-6 animate-spin text-brand-300" aria-hidden="true" />
        <p className="text-sm text-white/70">Opening your camera…</p>
      </div>
    )
  }

  if (!session || session.event_slug !== slug) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-brand-sheen p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-7 text-center shadow-card">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Camera className="size-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-ink">
            Join the event first
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
            Tell us your name once and the camera opens straight away. It takes a
            couple of seconds.
          </p>
          <Button asChild block size="lg" className="mt-6">
            <Link href={`/join/${encodeURIComponent(slug)}`}>Join the event</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <>{children(session)}</>
}
