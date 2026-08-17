'use client'

import { useEffect, useId, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, MailCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, FieldError, FieldHint } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { MOCK_MODE } from '@/lib/mockData'
import { useAuth } from '@/features/auth/AuthContext'
import { getPlan, isValidPlanId } from '@/lib/plans'

const MIN_PASSWORD_LENGTH = 8

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session, forceMockLogin } = useAuth()
  const emailId = useId()
  const passwordId = useId()
  const emailErrorId = useId()
  const passwordHintId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [emailSent, setEmailSent] = useState(false)

  /**
   * The pricing table links here as `/signup?plan=30gb`. Previously the value
   * was ignored, so a host who picked a paid plan landed on the create-event
   * form with the free tier selected. It is now carried through the redirect.
   */
  const planParam = searchParams.get('plan')
  const selectedPlan = isValidPlanId(planParam) ? getPlan(planParam) : null
  const nextPath = selectedPlan
    ? `/dashboard/events/new?plan=${selectedPlan.id}`
    : '/dashboard'

  useEffect(() => {
    if (session) router.replace(nextPath)
  }, [session, nextPath, router])

  const validate = () => {
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) errors.email = 'We need an email to send your confirmation link.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = 'That email address looks incomplete.'
    if (password.length < MIN_PASSWORD_LENGTH)
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)

    if (MOCK_MODE && forceMockLogin) {
      forceMockLogin()
      router.replace(nextPath)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // Send confirmed hosts straight to the plan they picked.
          emailRedirectTo: `${window.location.origin}${nextPath}`,
        },
      })

      if (error) {
        setFormError(
          /already registered|already exists/i.test(error.message)
            ? 'An account with that email already exists. Try signing in instead.'
            : error.message
        )
        setSubmitting(false)
        return
      }

      // With email confirmation off, Supabase returns a live session and the
      // host can go straight to the dashboard.
      if (data.session) {
        router.replace(nextPath)
        return
      }

      setEmailSent(true)
      setSubmitting(false)
    } catch {
      setFormError('We could not reach the server. Check your connection and try again.')
      setSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <MailCheck className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
          Confirm your email
        </h1>
        <p className="mx-auto mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
          We sent a confirmation link to{' '}
          <strong className="font-semibold text-ink">{email.trim()}</strong>. Open it
          to activate your host account — it expires in 24 hours.
        </p>
        <div className="mt-7 space-y-3">
          <Button asChild variant="secondary" block>
            <Link href="/login">Go to sign in</Link>
          </Button>
          <Button
            variant="ghost"
            block
            onClick={() => {
              setEmailSent(false)
              setPassword('')
            }}
          >
            Use a different email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Create your host account
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          One account covers every event you host. Your guests never need one.
        </p>
      </div>

      {selectedPlan && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-3.5">
          <Check className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-brand-900">
              {selectedPlan.name} selected{' '}
              <Badge tone="brand" className="ml-1 align-middle">
                {selectedPlan.priceLabel}
              </Badge>
            </p>
            <p className="mt-0.5 text-brand-900/75">
              {selectedPlan.storageLabel} storage · {selectedPlan.guestLabel}. We will
              carry it over to your first event.
            </p>
          </div>
        </div>
      )}

      {formError && (
        <Alert tone="error" className="mt-5" title="We couldn't create the account">
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
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
              invalid={!!fieldErrors.password}
              aria-describedby={passwordHintId}
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
          <FieldHint id={passwordHintId}>
            {`Minimum ${MIN_PASSWORD_LENGTH} characters. A short phrase works well.`}
          </FieldHint>
          <FieldError>{fieldErrors.password}</FieldError>
        </div>

        <Button
          type="submit"
          block
          size="lg"
          loading={submitting}
          loadingText="Creating account…"
        >
          Create account
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-6 border-t border-border pt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
