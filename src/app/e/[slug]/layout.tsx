import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Event camera',
  // Per-guest screens behind a session — never indexed.
  robots: { index: false, follow: false },
}

export default function GuestEventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
