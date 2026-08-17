import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { JoinClient } from './join-client'

export const metadata: Metadata = {
  title: 'Join an event',
  description:
    'Enter your event code or scan the QR code to join an Ekthau event. Share photos from your phone browser — no app download and no account needed.',
  alternates: { canonical: '/join' },
  openGraph: {
    title: 'Join an event | Ekthau',
    description:
      'Enter your event code or scan the QR code to start sharing photos. No app, no account.',
    url: '/join',
  },
}

export default function JoinLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-sheen">
      <header className="border-b border-border/70 bg-white/80 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-700"
          >
            What is Ekthau?
          </Link>
        </Container>
      </header>

      <main id="main" className="flex flex-1 items-center py-10 sm:py-14">
        <Container width="narrow">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Join the celebration
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              Add your photos to the shared album and see what everyone else has
              captured. There is nothing to install.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-lg">
            <JoinClient />
          </div>
        </Container>
      </main>
    </div>
  )
}
