'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { extractEventSlug } from '@/lib/event-code'

/**
 * Inline "I already have a code" entry point. Previously this assigned to
 * `window.location.href`, forcing a full document reload; it now uses the
 * router so the transition stays client-side.
 */
export function JoinCodeForm({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const router = useRouter()
  const inputId = useId()
  const errorId = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const slug = extractEventSlug(code)

    if (!slug) {
      setError('Enter the code printed on your table card, or paste the full link.')
      return
    }

    setError(null)
    setSubmitting(true)
    router.push(`/join/${encodeURIComponent(slug)}`)
  }

  const dark = tone === 'dark'

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full sm:w-auto">
      <label
        htmlFor={inputId}
        className={`block text-xs font-medium ${dark ? 'text-brand-200' : 'text-ink-muted'}`}
      >
        Already have an event code?
      </label>

      <div className="mt-1.5 flex w-full items-stretch gap-2 sm:w-auto">
        <input
          id={inputId}
          name="eventCode"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          placeholder="e.g. a1b2c3d4"
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            if (error) setError(null)
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full min-w-0 rounded-xl border px-3.5 font-mono text-base tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 sm:w-44 sm:text-sm ${
            dark
              ? 'border-white/20 bg-white/10 text-white placeholder:text-white/45 focus-visible:border-white/60 focus-visible:ring-white/25'
              : 'border-input bg-white text-ink placeholder:text-slate-400 focus-visible:border-brand-700 focus-visible:ring-ring/25'
          } ${error ? 'border-destructive' : ''}`}
        />
        <button
          type="submit"
          disabled={submitting}
          className={`inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${
            dark
              ? 'bg-white text-ink hover:bg-brand-50'
              : 'border border-border bg-white text-ink hover:bg-muted'
          }`}
        >
          {submitting ? 'Opening…' : 'Go'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className={`mt-2 text-xs font-medium ${dark ? 'text-red-300' : 'text-destructive'}`}
        >
          {error}
        </p>
      )}
    </form>
  )
}
