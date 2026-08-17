'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Camera, LogOut, Plus, QrCode } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { JoinEventModalLazy } from '@/components/join-event-modal-lazy'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { session, user, loading, error, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [joinOpen, setJoinOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!loading && !session) {
      // Preserve where they were headed so sign-in can return them there.
      const next = encodeURIComponent(pathname || '/dashboard')
      router.replace(`/login?next=${next}`)
    }
  }, [loading, session, pathname, router])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !menuRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
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

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen flex-col items-center justify-center gap-3"
      >
        <span className="flex size-12 animate-pulse items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Camera className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-ink-muted">Checking your session…</p>
      </div>
    )
  }

  if (!session) {
    /**
     * The redirect above is already running. Rendering a short message rather
     * than `null` avoids a blank white screen if the navigation is slow, and
     * gives a way out if the session lookup itself failed.
     */
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <p className="text-sm text-ink-muted">
            {error
              ? 'We could not verify your session.'
              : 'Taking you to the sign-in page…'}
          </p>
          {error && (
            <>
              <Alert tone="error">
                <p>{error}</p>
              </Alert>
              <Button asChild block>
                <Link href="/login">Go to sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  const initial = (user?.email?.charAt(0) || 'H').toUpperCase()

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 pt-3">
        <Container width="wide" className="flex h-16 items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/85 px-4 shadow-pill backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-6">
            <Logo href="/dashboard" showLocalName={false} />
            <nav aria-label="Dashboard" className="hidden md:block">
              <Link
                href="/dashboard"
                aria-current={pathname === '/dashboard' ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-muted text-ink'
                    : 'text-ink-muted hover:bg-muted hover:text-ink'
                }`}
              >
                My events
              </Link>
            </nav>
          </div>

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

            <Button asChild size="sm">
              <Link href="/dashboard/events/new">
                <Plus aria-hidden="true" />
                <span className="hidden sm:inline">New event</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>

            <div className="relative">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="account-menu"
                className="flex size-10 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                <span aria-hidden="true">{initial}</span>
                <span className="sr-only">Account menu</span>
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  id="account-menu"
                  className="absolute right-0 top-full z-50 mt-2 w-64 animate-scale-in overflow-hidden rounded-xl border border-border bg-white shadow-lg"
                >
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-ink-muted">
                      Signed in as
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-ink">
                      {user?.email ?? 'Host'}
                    </p>
                  </div>
                  <nav aria-label="Account" className="p-1.5">
                    <Link
                      href="/dashboard"
                      className="flex min-h-11 items-center rounded-lg px-2.5 text-sm text-ink transition-colors hover:bg-muted md:hidden"
                    >
                      My events
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setJoinOpen(true)
                      }}
                      className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-ink transition-colors hover:bg-muted sm:hidden"
                    >
                      <QrCode className="size-4" aria-hidden="true" />
                      Join an event
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-60"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      {signingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </nav>
                </div>
              )}
            </div>

          </div>
        </Container>
      </header>

      <main id="main" className="flex-1 py-6 sm:py-8">
        <Container width="wide">{children}</Container>
      </main>

      <JoinEventModalLazy open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  )
}
