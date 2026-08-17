import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { extractEventSlug } from '@/lib/event-code'
import { JoinEventClient } from './join-event-client'

export const metadata: Metadata = {
  title: 'Join this event',
  description:
    'Add your photos to this shared event album. Nothing to download and no account needed.',
  // Event links are private and unique per event — they must never be indexed.
  robots: { index: false, follow: false },
}

export default async function JoinEventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: rawSlug } = await params
  const slug = extractEventSlug(decodeURIComponent(rawSlug))

  // A slug that cannot possibly be an event code gets a real 404 rather than a
  // client-side "not found" panel rendered under a 200 status.
  if (!slug) notFound()

  return <JoinEventClient slug={slug} />
}
