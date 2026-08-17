import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthShell } from '@/components/layout/auth-shell'
import { SignupForm } from './signup-form'

export const metadata: Metadata = {
  title: 'Create a free event',
  description:
    'Set up an Ekthau event in under a minute. Get a printable QR code, collect full-resolution photos from every guest, and start with 1 GB free.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Create a free event photo gallery | Ekthau',
    description:
      'Set up an event in under a minute, print your QR card, and collect full-resolution photos from every guest. 1 GB free.',
    url: '/signup',
  },
}

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Free to start"
      headline="Create an event in under a minute."
      points={[
        '1 GB of storage included, no card needed',
        'Print-ready QR cards for every table',
        'Guests join with one scan — no app, no account',
      ]}
    >
      <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  )
}
