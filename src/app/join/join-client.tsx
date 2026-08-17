'use client'

import { useCallback, useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Camera, Keyboard, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, FieldError, FieldHint } from '@/components/ui/label'
import { QrScannerLazy } from '@/components/qr-scanner-lazy'
import { extractEventSlug } from '@/lib/event-code'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

export function JoinClient() {
  const router = useRouter()
  const inputId = useId()
  const hintId = useId()
  const [mode, setMode] = useState<'code' | 'scan'>('code')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [navigating, setNavigating] = useState(false)

  const goToEvent = useCallback(
    (slug: string) => {
      setNavigating(true)
      router.push(`/join/${encodeURIComponent(slug)}`)
    },
    [router]
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const slug = extractEventSlug(code)
    if (!slug) {
      setError(
        'Event codes are letters and numbers only. Check the card on your table, or paste the full link your host sent.'
      )
      return
    }
    setError(null)
    goToEvent(slug)
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-float backdrop-blur-sm">
      <div
        role="tablist"
        aria-label="How would you like to join?"
        className="grid grid-cols-2 gap-1.5 border-b border-border bg-brand-50/70 p-2"
      >
        {(
          [
            { id: 'code', label: 'Enter your code', icon: Keyboard },
            { id: 'scan', label: 'Scan QR code', icon: Camera },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={mode === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setMode(tab.id)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors ${
              mode === tab.id
                ? 'bg-white text-ink shadow-pill'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <tab.icon className="size-4" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {mode === 'code' ? (
          <form
            id="panel-code"
            role="tabpanel"
            aria-labelledby="tab-code"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor={inputId} required>
                Event code
              </Label>
              <Input
                id={inputId}
                name="eventCode"
                value={code}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="go"
                autoFocus
                placeholder="a1b2c3d4"
                invalid={!!error}
                aria-describedby={hintId}
                onChange={(event) => {
                  setCode(event.target.value)
                  if (error) setError(null)
                }}
                className="h-12 font-mono text-lg tracking-wider"
              />
              <FieldHint id={hintId}>
                It is printed on the table cards and invitations. Pasting the whole
                link works too.
              </FieldHint>
              <FieldError>{error}</FieldError>
            </div>

            {MOCK_MODE && (
              <div className="rounded-xl border border-dashed border-border bg-muted/50 p-3">
                <p className="text-xs font-medium text-ink-muted">
                  Demo mode — try one of these:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mockEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setCode(event.public_slug)}
                      className="rounded-lg border border-border bg-white px-2.5 py-1.5 font-mono text-xs text-ink transition-colors hover:border-brand-200 hover:bg-brand-50"
                    >
                      {event.public_slug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              block
              size="lg"
              loading={navigating}
              loadingText="Finding your event…"
              disabled={!code.trim()}
            >
              Join the event
              <ArrowRight aria-hidden="true" />
            </Button>
          </form>
        ) : (
          <div id="panel-scan" role="tabpanel" aria-labelledby="tab-scan">
            <QrScannerLazy
              active={mode === 'scan'}
              onDetected={goToEvent}
              onSwitchToCode={() => setMode('code')}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-6 py-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
          Nothing to download or install
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="size-4 text-amber-500" aria-hidden="true" />
          Start shooting in seconds
        </span>
      </div>

      <p className="border-t border-border px-6 py-4 text-center text-sm text-ink-muted">
        Hosting the event?{' '}
        <Link
          href="/login"
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Sign in to your dashboard
        </Link>
      </p>
    </div>
  )
}
