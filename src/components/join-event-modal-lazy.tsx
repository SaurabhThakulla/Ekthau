'use client'

import dynamic from 'next/dynamic'

/**
 * The join dialog pulls in the jsQR decoder (~40 kB), which was landing in the
 * initial bundle of every page that renders the header — including the home
 * page, where nobody scans anything. Loading it on demand keeps it out of the
 * critical path; the dialog only ever appears after a click, so there is no
 * visible delay to hide.
 */
const JoinEventModal = dynamic(() => import('@/components/JoinEventModal'), {
  ssr: false,
})

export function JoinEventModalLazy({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  // Not mounted at all until first opened, so the chunk is never requested for
  // visitors who do not use it.
  if (!open) return null
  return <JoinEventModal open={open} onClose={onClose} />
}
