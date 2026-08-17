'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, QrCode, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { primaryNav } from '@/lib/site'
import { useAuth } from '@/features/auth/AuthContext'
import { JoinEventModalLazy } from '@/components/join-event-modal-lazy'

/**
 * Detached "pill" header: an inset rounded bar floating over the page canvas
 * rather than a flush edge-to-edge strip. Below `md` the links collapse into a
 * real disclosure panel instead of simply disappearing.
 */
export function SiteHeader() {
  const { session, loading } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

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
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
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

  const [isMenuRendered, setIsMenuRendered] = useState(false)
  const [isMenuClosing, setIsMenuClosing] = useState(false)

  useEffect(() => {
    if (menuOpen) {
      setIsMenuRendered(true)
      setIsMenuClosing(false)
    } else if (isMenuRendered) {
      setIsMenuClosing(true)
      const timer = window.setTimeout(() => {
        setIsMenuRendered(false)
        setIsMenuClosing(false)
      }, 180)
      return () => window.clearTimeout(timer)
    }
  }, [menuOpen, isMenuRendered])

  return (
    <>
      <header className="sticky top-0 z-50 pt-3 sm:pt-4 transition-all duration-300">
        <Container>
          <div className="relative rounded-2xl border border-white/70 bg-white/80 shadow-pill backdrop-blur-xl transition-all duration-300">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
              <Logo />

              <nav aria-label="Main" className="hidden md:block">
                <ul className="flex items-center gap-1">
                  {primaryNav.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
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
                  shape="pill"
                  className="hidden sm:inline-flex"
                  onClick={() => setJoinOpen(true)}
                >
                  <QrCode aria-hidden="true" />
                  Join event
                </Button>

                {/* Reserve the slot while auth resolves so the header does not jump. */}
                {loading ? (
                  <span
                    aria-hidden="true"
                    className="hidden h-10 w-32 animate-pulse rounded-full bg-brand-50 sm:block"
                  />
                ) : session ? (
                  <Button asChild size="sm" shape="pill">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-brand-700 lg:block"
                    >
                      Sign in
                    </Link>
                    <Button asChild size="sm" shape="pill">
                      <Link href="/signup">
                        <span className="sm:hidden">Start free</span>
                        <span className="hidden sm:inline">Create an event</span>
                      </Link>
                    </Button>
                  </>
                )}

                <button
                  ref={toggleRef}
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-nav"
                  className="flex size-10 items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-brand-50 md:hidden"
                >
                  {menuOpen ? (
                    <X className="size-5" aria-hidden="true" />
                  ) : (
                    <Menu className="size-5" aria-hidden="true" />
                  )}
                  <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
                </button>
              </div>
            </div>

            {isMenuRendered && (
              <div
                ref={panelRef}
                id="mobile-nav"
                className={`border-t border-border px-3 py-2 md:hidden ${
                  isMenuClosing ? 'animate-fade-out pointer-events-none' : 'animate-fade-in'
                }`}
              >
                <nav aria-label="Mobile">
                  <ul className="flex flex-col">
                    {[
                      ...primaryNav,
                      { href: '/join', label: 'Join an event' },
                      ...(session ? [] : [{ href: '/login', label: 'Host sign in' }]),
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-ink transition-colors hover:bg-brand-50"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </Container>
      </header>

      <JoinEventModalLazy open={joinOpen} onClose={() => setJoinOpen(false)} />
    </>
  )
}
