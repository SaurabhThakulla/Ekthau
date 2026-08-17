'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'

/**
 * Route-level error boundary. Without this, an unhandled render error showed
 * Next's default error screen in development and a blank page in production.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="pt-3 sm:pt-4">
        <Container className="flex h-16 items-center rounded-2xl border border-white/70 bg-white/80 px-4 shadow-pill backdrop-blur-xl sm:px-6">
          <Logo />
        </Container>
      </header>

      <main id="main" className="flex flex-1 items-center py-16">
        <Container width="narrow" className="text-center">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
            This page ran into a problem
          </h1>
          <p className="mx-auto mt-4 max-w-prose text-base leading-relaxed text-ink-muted">
            Your photos and events are safe. Try loading the page again — if it keeps
            failing, head back to the home page and start over.
          </p>

          {error.digest && (
            <p className="mt-4 font-mono text-xs text-ink-muted">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={reset}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/">
                <Home aria-hidden="true" />
                Back to home
              </Link>
            </Button>
          </div>
        </Container>
      </main>
    </div>
  )
}
