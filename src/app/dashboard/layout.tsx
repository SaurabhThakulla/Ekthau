import type { Metadata } from 'next'
import { DashboardShell } from './dashboard-shell'

export const metadata: Metadata = {
  title: 'Host dashboard',
  description: 'Manage your Ekthau events, QR codes and guest uploads.',
  // Private area — never indexed, and links inside are not worth crawling.
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
