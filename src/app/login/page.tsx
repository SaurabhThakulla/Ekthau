import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthShell } from '@/components/layout/auth-shell'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Host sign in',
  description:
    'Sign in to your Ekthau host account to manage events, moderate guest uploads and download full-resolution photo albums.',
  alternates: { canonical: '/login' },
  // A sign-in form has no content worth ranking, but the page should still be
  // crawled so its links are followed.
  robots: { index: false, follow: true },
}

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Host dashboard"
      headline="Your events, your originals, all in one place."
      points={[
        'Every guest photo at full resolution',
        'Approve uploads before anyone sees them',
        'Download the whole album as one ZIP',
      ]}
    >
      {/* useSearchParams needs a Suspense boundary during prerender. */}
      <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
