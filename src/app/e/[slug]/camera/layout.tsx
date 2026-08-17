import type { Metadata } from 'next'

/**
 * The pages themselves are client components and cannot export metadata, so the
 * per-screen titles live in these thin layouts. Without them both screens
 * inherited a single shared title.
 */
export const metadata: Metadata = {
  title: 'Camera',
}

export default function CameraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
