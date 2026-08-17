import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout/container'
import { PLANS } from '@/lib/plans'
import { cn } from '@/lib/utils'

export function PricingSection() {
  return (
    <section id="pricing" className="section-y border-t border-border bg-brand-sheen">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Pay once per event. Start free.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            No subscription and no per-guest fee. Pick the size that matches your
            celebration — every plan keeps photos at their original resolution and
            lets you download the whole album as a ZIP.
          </p>
        </div>

        <ul
          role="list"
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:mt-12"
        >
          {PLANS.map((plan) => (
            <li key={plan.id} className="flex">
              <article
                className={cn(
                  'relative flex w-full flex-col rounded-2xl border bg-white p-6 transition-shadow',
                  plan.popular
                    ? 'border-brand-700 shadow-lg ring-1 ring-brand-700/15'
                    : 'border-border shadow-card hover:shadow-md'
                )}
              >
                {plan.popular && (
                  <Badge
                    tone="solid"
                    className="absolute -top-3 right-5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                  >
                    Most chosen
                  </Badge>
                )}

                <header>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold tracking-tight text-ink">
                      {plan.name}
                    </h3>
                    {plan.aiPreview && (
                      <Badge tone="brand" className="shrink-0">
                        <Sparkles aria-hidden="true" />
                        Preview
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{plan.summary}</p>
                </header>

                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-bold tracking-tight text-ink">
                    {plan.priceLabel}
                  </span>
                  <span className="text-sm text-ink-muted">/ {plan.period}</span>
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/50 p-3 text-center">
                  {[
                    { label: 'Storage', value: plan.storageLabel },
                    { label: 'Guests', value: plan.guestLimit >= 10_000 ? '∞' : plan.guestLimit },
                    { label: 'Kept for', value: plan.retentionLabel },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-[11px] uppercase tracking-wide text-ink-muted">
                        {stat.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-ink">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul role="list" className="mt-5 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-brand-700"
                        aria-hidden="true"
                      />
                      <span className="text-ink-muted">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={
                    plan.id === 'free' ? '/signup' : `/signup?plan=${plan.id}`
                  }
                  className={cn(
                    'mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    plan.popular
                      ? 'bg-brand-700 text-white hover:bg-brand-800'
                      : 'border border-border bg-white text-ink hover:border-brand-200 hover:bg-brand-50'
                  )}
                >
                  {plan.priceValue === 0
                    ? 'Start free'
                    : `Choose ${plan.name}`}
                  <span className="sr-only"> plan</span>
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-ink-muted">
          Prices are in Nepalese rupees and charged per event, not per month.{' '}
          <Link href="/#faq" className="font-medium text-brand-700 hover:underline">
            Read what happens when storage runs out
          </Link>
          .
        </p>
      </Container>
    </section>
  )
}
