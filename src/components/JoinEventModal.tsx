'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, FieldHint } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Modal } from '@/components/ui/modal'
import { QrScannerLazy } from '@/components/qr-scanner-lazy'
import { extractEventSlug } from '@/lib/event-code'

interface JoinEventModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Shared "join an event" dialog used by the marketing header and the host
 * dashboard. Built on the accessible Modal so it traps focus, closes on Escape
 * or a backdrop click, and locks background scrolling — none of which the
 * previous hand-rolled overlay did.
 */
export default function JoinEventModal({ open, onClose }: JoinEventModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'code' | 'scan'>('code')
  const [eventCode, setEventCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [navigating, setNavigating] = useState(false)
  const inputId = useId()
  const hintId = useId()

  // Reset transient state each time the dialog is opened.
  useEffect(() => {
    if (open) {
      setMode('code')
      setError(null)
      setNavigating(false)
    }
  }, [open])

  const goToEvent = useCallback(
    (slug: string) => {
      setNavigating(true)
      onClose()
      router.push(`/join/${encodeURIComponent(slug)}`)
    },
    [onClose, router]
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const slug = extractEventSlug(eventCode)
    if (!slug) {
      setError('That does not look like an event code. Check the card on your table.')
      return
    }
    setError(null)
    goToEvent(slug)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Join an event"
      description="Enter the code from your table card, or scan the QR code."
    >
      <div className="space-y-5">
        <div
          role="tablist"
          aria-label="How to join"
          className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
        >
          {(
            [
              { id: 'code', label: 'Enter code', icon: Keyboard },
              { id: 'scan', label: 'Scan QR', icon: Camera },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`join-tab-${tab.id}`}
              aria-selected={mode === tab.id}
              aria-controls={`join-panel-${tab.id}`}
              onClick={() => setMode(tab.id)}
              className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === tab.id
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <tab.icon className="size-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {mode === 'code' ? (
          <form
            id="join-panel-code"
            role="tabpanel"
            aria-labelledby="join-tab-code"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor={inputId}>Event code or link</Label>
              <Input
                id={inputId}
                name="eventCode"
                value={eventCode}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="go"
                placeholder="a1b2c3d4 or ekthau.com/join/…"
                invalid={!!error}
                aria-describedby={hintId}
                onChange={(event) => {
                  setEventCode(event.target.value)
                  if (error) setError(null)
                }}
                className="font-mono"
              />
              <FieldHint id={hintId}>
                Your host prints this on table cards and invitations.
              </FieldHint>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="secondary" block onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                block
                loading={navigating}
                loadingText="Opening…"
                disabled={!eventCode.trim()}
              >
                Join event
              </Button>
            </div>
          </form>
        ) : (
          <div id="join-panel-scan" role="tabpanel" aria-labelledby="join-tab-scan">
            <QrScannerLazy
              active={open && mode === 'scan'}
              onDetected={goToEvent}
              onSwitchToCode={() => setMode('code')}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
