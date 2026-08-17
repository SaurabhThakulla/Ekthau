'use client'

import { Suspense, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Cake,
  Check,
  Clock,
  GraduationCap,
  Heart,
  Layers,
  MapPin,
  PartyPopper,
  Sparkle,
  Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, FieldError, FieldHint } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import CalendarPicker from '@/components/ui/calendar-picker'
import CustomSelect, { type SelectOption } from '@/components/ui/custom-select'
import { useAuth } from '@/features/auth/AuthContext'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'
import { DEFAULT_PLAN_ID, PLANS, getPlan, isValidPlanId } from '@/lib/plans'
import { todayInputValue } from '@/lib/format'
import { describeSupabaseError } from '@/lib/supabase-errors'
import { cn } from '@/lib/utils'

const EVENT_TYPES: SelectOption[] = [
  { value: 'Wedding', label: 'Wedding & reception', icon: <Heart className="size-4" />, description: 'Ceremony, reception, multi-day' },
  { value: 'Birthday', label: 'Birthday party', icon: <Cake className="size-4" />, description: 'Milestones, kids parties, brunches' },
  { value: 'Engagement', label: 'Engagement', icon: <Sparkles className="size-4" />, description: 'Ring ceremony, rooftop toasts' },
  { value: 'Anniversary', label: 'Anniversary', icon: <PartyPopper className="size-4" />, description: 'Jubilees and family dinners' },
  { value: 'Corporate', label: 'Corporate event', icon: <Building2 className="size-4" />, description: 'Galas, retreats, mixers' },
  { value: 'College', label: 'College or alumni', icon: <GraduationCap className="size-4" />, description: 'Graduations and reunions' },
  { value: 'Festival', label: 'Festival', icon: <Sparkle className="size-4" />, description: 'Dashain, Tihar, Holi' },
  { value: 'Other', label: 'Something else', icon: <Layers className="size-4" />, description: 'Private parties and meetups' },
]

const MAX_NAME_LENGTH = 80

function CreateEventForm() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const nameId = useId()
  const nameErrorId = useId()
  const nameHintId = useId()
  const typeId = useId()
  const dateId = useId()
  const dateErrorId = useId()
  const locationId = useId()

  const planParam = searchParams.get('plan')
  const [selectedPlanId, setSelectedPlanId] = useState(
    isValidPlanId(planParam) ? planParam! : DEFAULT_PLAN_ID
  )
  const [form, setForm] = useState({
    name: '',
    event_type: 'Wedding',
    event_date: '',
    location: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; date?: string }>({})

  const plan = getPlan(selectedPlanId)

  // Keep the selection in sync if the query string changes (e.g. back button).
  useEffect(() => {
    if (isValidPlanId(planParam)) setSelectedPlanId(planParam!)
  }, [planParam])

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === 'name' && fieldErrors.name) {
      setFieldErrors((errors) => ({ ...errors, name: undefined }))
    }
    if (key === 'event_date' && fieldErrors.date) {
      setFieldErrors((errors) => ({ ...errors, date: undefined }))
    }
  }

  const validate = () => {
    const errors: { name?: string; date?: string } = {}
    if (!form.name.trim()) {
      errors.name = 'Give your event a name so guests recognise it.'
    } else if (form.name.trim().length < 3) {
      errors.name = 'Use at least 3 characters.'
    }
    if (!form.event_date) {
      errors.date = 'Pick the date of the celebration.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // Blocks a second submit while the first insert is still in flight, which
    // previously could create two events from one impatient double-click.
    if (submitting) return
    setFormError(null)

    if (!validate()) return
    if (!user) {
      setFormError('Your session expired. Sign in again to create this event.')
      return
    }

    setSubmitting(true)

    if (MOCK_MODE) {
      router.push(`/dashboard/events/${mockEvents[0].id}`)
      return
    }

    // Unguessable public slug so event links cannot be enumerated.
    const slugBytes = new Uint8Array(8)
    crypto.getRandomValues(slugBytes)
    const publicSlug = Array.from(slugBytes, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('')

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + plan.retentionDays)

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          owner_id: user.id,
          name: form.name.trim(),
          event_type: form.event_type,
          event_date: form.event_date,
          location: form.location.trim() || null,
          public_slug: publicSlug,
          plan: plan.name,
          guest_limit: plan.guestLimit,
          storage_limit_bytes: plan.storageBytes,
          expires_at: expiresAt.toISOString(),
        })
        .select('id')
        .single()

      if (error || !data?.id) {
        setFormError(
          describeSupabaseError(
            error,
            'The event could not be created. Please try again.'
          )
        )
        setSubmitting(false)
        return
      }

      /**
       * Default settings are best-effort: the database has sensible column
       * defaults, so a failure here must not block the host from reaching their
       * new event.
       */
      const settingsResult = await supabase
        .from('event_settings')
        .insert({ event_id: data.id })
      if (settingsResult.error) {
        console.warn('Default event settings were not created:', settingsResult.error)
      }

      router.push(`/dashboard/events/${data.id}`)
    } catch {
      setFormError(
        'We could not reach the server. Check your connection and try again.'
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
        <Link href="/dashboard">
          <ArrowLeft aria-hidden="true" />
          All events
        </Link>
      </Button>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Create an event
        </h1>
        <p className="max-w-prose text-sm text-ink-muted">
          Two details and you are done. We generate the QR code and guest camera link
          straight after.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 space-y-8 rounded-2xl border border-border bg-white p-5 shadow-card sm:p-7"
      >
        {formError && (
          <Alert tone="error" title="We couldn't create the event">
            <p>{formError}</p>
          </Alert>
        )}

        <fieldset className="space-y-4" disabled={submitting}>
          <legend className="mb-4 w-full border-b border-border pb-2.5 text-sm font-semibold text-ink">
            Event details
          </legend>

          <div className="space-y-1.5">
            <Label htmlFor={nameId} required>
              Event name
            </Label>
            <Input
              id={nameId}
              name="eventName"
              value={form.name}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
              enterKeyHint="next"
              placeholder="Sita & Ramesh — Wedding Reception"
              invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? nameErrorId : nameHintId}
              onChange={(event) => update('name', event.target.value)}
            />
            {fieldErrors.name ? (
              <FieldError id={nameErrorId}>{fieldErrors.name}</FieldError>
            ) : (
              <FieldHint id={nameHintId}>
                Guests see this when they scan the QR code.
              </FieldHint>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CustomSelect
              id={typeId}
              label="Event type"
              value={form.event_type}
              onChange={(value) => update('event_type', value)}
              options={EVENT_TYPES}
              disabled={submitting}
            />

            <div>
              <Label htmlFor={dateId} required className="mb-1.5">
                Event date
              </Label>
              <CalendarPicker
                id={dateId}
                label="Event date"
                value={form.event_date}
                onChange={(value) => update('event_date', value)}
                minDate={todayInputValue()}
                disabled={submitting}
                invalid={!!fieldErrors.date}
                describedBy={fieldErrors.date ? dateErrorId : undefined}
                placeholder="Pick the date"
              />
              <div className="mt-1.5">
                <FieldError id={dateErrorId}>{fieldErrors.date}</FieldError>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={locationId}>Venue (optional)</Label>
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id={locationId}
                name="location"
                value={form.location}
                maxLength={120}
                autoComplete="off"
                placeholder="Yak & Yeti Grand Ballroom, Kathmandu"
                onChange={(event) => update('location', event.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </fieldset>

        <fieldset disabled={submitting}>
          <legend className="mb-4 flex w-full flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5 text-sm font-semibold text-ink">
            Storage plan
            <span className="text-xs font-normal text-ink-muted">
              You can upgrade later
            </span>
          </legend>

          <div
            role="radiogroup"
            aria-label="Storage plan"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {PLANS.map((option) => {
              const isSelected = option.id === selectedPlanId
              return (
                <label
                  key={option.id}
                  className={cn(
                    'relative flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-colors',
                    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                    isSelected
                      ? 'border-brand-700 bg-brand-50/60 ring-1 ring-brand-700/20'
                      : 'border-border bg-white hover:border-slate-300 hover:bg-muted/40'
                  )}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelectedPlanId(option.id)}
                    className="sr-only"
                  />

                  {option.popular && (
                    <Badge
                      tone="solid"
                      className="absolute -top-2.5 right-3 rounded-md px-1.5 py-0 text-[10px] uppercase"
                    >
                      Popular
                    </Badge>
                  )}

                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-ink">{option.name}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-full border',
                        isSelected
                          ? 'border-brand-700 bg-brand-700 text-white'
                          : 'border-slate-300'
                      )}
                    >
                      {isSelected && <Check className="size-2.5" strokeWidth={3} />}
                    </span>
                  </span>

                  <span>
                    <span className="font-display text-lg font-bold text-ink">
                      {option.priceLabel}
                    </span>
                    <span className="ml-1.5 text-sm font-medium text-brand-700">
                      {option.storageLabel}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-muted">
                      {option.guestLabel}
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5 border-t border-border pt-2 text-xs text-ink-muted">
                    <Clock className="size-3 shrink-0 text-brand-700" aria-hidden="true" />
                    Photos kept for {option.retentionLabel}
                  </span>
                </label>
              )
            })}
          </div>

          <p className="mt-3 text-xs text-ink-muted">
            Selected: <strong className="font-semibold text-ink">{plan.name}</strong> —{' '}
            {plan.storageLabel} of storage, {plan.guestLabel.toLowerCase()}, kept for{' '}
            {plan.retentionLabel}.
          </p>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button asChild variant="ghost" size="lg" className="sm:w-auto">
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            loadingText="Creating event…"
          >
            Create event
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <CreateEventForm />
    </Suspense>
  )
}
