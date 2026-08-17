'use client'

import { useEffect, useId, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, FieldError } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { MOCK_MODE } from '@/lib/mockData'
import { useAuth } from '@/features/auth/AuthContext'

/** Only same-origin paths are honoured, so `?next=` cannot be used as an open redirect. */
function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session, forceMockLogin } = useAuth()
  const emailId = useId()
  const passwordId = useId()
  const emailErrorId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const redirectTo = safeRedirect(searchParams.get('next'))

  // Someone who is already signed in should not be looking at a login form.
  useEffect(() => {
    if (session) router.replace(redirectTo)
  }, [session, redirectTo, router])

  const validate = () => {
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) errors.email = 'Enter the email you signed up with.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = 'That email address looks incomplete.'
    if (!password) errors.password = 'Enter your password.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // Guards against a double submit from a fast second click or Enter press.
    if (submitting) return
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)

    if (MOCK_MODE && forceMockLogin) {
      forceMockLogin()
      router.replace(redirectTo)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        // Supabase returns the same message for a wrong password and an unknown
        // account; say something a human can act on rather than echoing it raw.
        setFormError(
          /invalid login credentials/i.test(error.message)
            ? 'That email and password combination does not match an account.'
            : error.message
        )
        setSubmitting(false)
        return
      }

      router.replace(redirectTo)
    } catch {
      setFormError(
        'We could not reach the server. Check your connection and try again.'
      )
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Welcome back</h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Sign in to manage your events, moderate uploads and download full-resolution
          albums.
        </p>
      </div>

      {formError && (
        <Alert tone="error" className="mt-6" title="Sign in failed">
          <p>{formError}</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={emailId} required>
            Email address
          </Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? emailErrorId : undefined}
              className="pl-10"
            />
          </div>
          <FieldError id={emailErrorId}>{fieldErrors.email}</FieldError>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={passwordId} required>
            Password
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id={passwordId}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
              invalid={!!fieldErrors.password}
              className="pl-10 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-pressed={showPassword}
              className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-muted hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </button>
          </div>
          <FieldError>{fieldErrors.password}</FieldError>
        </div>

        <Button
          type="submit"
          block
          size="lg"
          loading={submitting}
          loadingText="Signing in…"
        >
          Sign in
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>

      {MOCK_MODE && forceMockLogin && (
        <Button
          variant="secondary"
          block
          className="mt-3 border-dashed"
          onClick={() => {
            forceMockLogin()
            router.replace(redirectTo)
          }}
        >
          <Sparkles aria-hidden="true" />
          Explore with demo data
        </Button>
      )}

      <p className="mt-6 border-t border-border pt-6 text-center text-sm text-ink-muted">
        New to Ekthau?{' '}
        <Link
          href="/signup"
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Create a host account
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-ink-muted">
        Here as a guest?{' '}
        <Link
          href="/join"
          className="font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          Join an event with your code
        </Link>
      </p>
    </>
  )
}
