'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, QrCode, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { primaryNav } from '@/lib/site'
import { useAuth } from '@/features/auth/AuthContext'
import { JoinEventModalLazy } from '@/components/join-event-modal-lazy'

/**
 * Public site header. Below `md` the links collapse into a real disclosure
 * panel instead of simply disappearing, which is what the previous header did.
 */
export function SiteHeader() {
  const { session, loading } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Any navigation closes the panel so it never lingers over the new page.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !panelRef.current?.contains(target) &&
        !toggleRef.current?.contains(target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/80 bg-white/85 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setJoinOpen(true)}
            >
              <QrCode aria-hidden="true" />
              Join event
            </Button>

            {/* Reserve the slot while auth resolves so the header does not jump. */}
            {loading ? (
              <span className="hidden h-9 w-28 animate-pulse rounded-xl bg-muted sm:block" />
            ) : session ? (
              <Button asChild size="sm">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink lg:block"
                >
                  Sign in
                </Link>
                <Button asChild size="sm">
                  <Link href="/signup">
                    <span className="sm:hidden">Start free</span>
                    <span className="hidden sm:inline">Create an event</span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </>
            )}

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="flex size-10 items-center justify-center rounded-xl border border-border text-ink transition-colors hover:bg-muted md:hidden"
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
              <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </Container>

        {menuOpen && (
          <div
            ref={panelRef}
            id="mobile-nav"
            className="animate-fade-in border-t border-border bg-white md:hidden"
          >
            <Container className="py-3">
              <nav aria-label="Mobile">
                <ul className="flex flex-col">
                  {primaryNav.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex min-h-12 items-center rounded-lg px-2 text-base font-medium text-ink transition-colors hover:bg-muted"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/join"
                      className="flex min-h-12 items-center rounded-lg px-2 text-base font-medium text-ink transition-colors hover:bg-muted"
                    >
                      Join an event
                    </Link>
                  </li>
                  {!session && (
                    <li>
                      <Link
                        href="/login"
                        className="flex min-h-12 items-center rounded-lg px-2 text-base font-medium text-ink transition-colors hover:bg-muted"
                      >
                        Host sign in
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </Container>
          </div>
        )}
      </header>

      <JoinEventModalLazy open={joinOpen} onClose={() => setJoinOpen(false)} />
    </>
  )
}
