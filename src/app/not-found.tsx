import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Compass, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { SiteFooter } from '@/components/layout/site-footer'
import { Logo } from '@/components/layout/logo'
import { primaryNav } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Page not found',
  description:
    'The page you were looking for does not exist. Find your way back to Ekthau or join an event with your code.',
  // A 404 must never be indexed, but its links should still be followed.
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <Container className="flex h-16 items-center">
          <Logo />
        </Container>
      </header>

      <main id="main" className="flex flex-1 items-center py-16">
        <Container width="narrow" className="text-center">
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mx-auto mt-4 max-w-prose text-base leading-relaxed text-ink-muted">
            The link may be mistyped, or the event it pointed to has ended. If you
            were trying to reach a celebration, enter the code from your table card
            instead.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/join">
                <QrCode aria-hidden="true" />
                Join with an event code
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/">
                <Compass aria-hidden="true" />
                Back to home
              </Link>
            </Button>
          </div>

          <nav
            aria-label="Helpful links"
            className="mt-12 border-t border-border pt-8"
          >
            <h2 className="text-sm font-semibold text-ink">Popular pages</h2>
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {primaryNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
                  >
                    {item.label}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
                >
                  Create an event
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </nav>
        </Container>
      </main>

      <SiteFooter />
    </div>
  )
}
