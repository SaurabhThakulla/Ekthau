import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: {
    default: 'Event photos',
    /**
     * Re-declared here because a nested segment only inherits the title
     * template from its immediate parent. Without it the child layouts below
     * rendered bare titles like "Camera" with no brand suffix.
     */
    template: `%s | ${site.name}`,
  },
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
