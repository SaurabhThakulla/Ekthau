import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { pageMetadata } from '@/lib/metadata'
import { Logo } from '@/components/layout/logo'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { JoinClient } from './join-client'

export const metadata: Metadata = pageMetadata({
  title: 'Join an event',
  description:
    'Enter your event code or scan the QR code to join an Ekthau event. Share photos from your phone browser — no app download and no account needed.',
  path: '/join',
  socialTitle: 'Join an event | Ekthau',
  socialDescription:
    'Enter your event code or scan the QR code to start sharing photos. No app, no account.',
})

export default function JoinLandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas overflow-hidden">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-20 size-80 animate-blob rounded-full bg-brand-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-40 size-80 animate-blob-slow rounded-full bg-pink-200/30 blur-3xl"
      />

      <header className="pt-3 sm:pt-4 relative">
        <Container className="flex h-16 items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 shadow-pill backdrop-blur-xl sm:px-6">
          <Logo />
          <Link
            href="/"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-700"
          >
            What is Ekthau?
          </Link>
        </Container>
      </header>

      <main id="main" className="relative flex flex-1 items-center py-10 sm:py-14">
        <Container width="narrow">
          <ScrollReveal direction="up" distance={20}>
            <div className="mx-auto max-w-lg text-center">
              <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
                Join the celebration
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">
                Add your photos to the shared album and see what everyone else has
                captured. There is nothing to install.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} direction="up" distance={24}>
            <div className="mx-auto mt-8 max-w-lg">
              <JoinClient />
            </div>
          </ScrollReveal>
        </Container>
      </main>
    </div>
  )
}
