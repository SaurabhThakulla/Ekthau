import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout/container'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { PLANS } from '@/lib/plans'
import { cn } from '@/lib/utils'

export function PricingSection() {
  return (
    <section id="pricing" className="section-y relative overflow-hidden">
      {/* Subtle ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-96 animate-blob-slow rounded-full bg-brand-200/30 blur-3xl"
      />

      <Container className="relative">
        <ScrollReveal direction="up" distance={20}>
          <div className="max-w-2xl">
            <p className="eyebrow">Pricing</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-[2.75rem]">
              Pay once per event. Start free.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              No subscription and no per-guest fee. Pick the size that matches your
              celebration — every plan keeps photos at their original resolution and
              lets you download the whole album as a ZIP.
            </p>
          </div>
        </ScrollReveal>

        <ul
          role="list"
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:mt-12"
        >
          {PLANS.map((plan, index) => (
            <li key={plan.id} className="flex">
              <ScrollReveal
                delay={index * 120}
                direction="up"
                distance={24}
                className="w-full flex"
              >
                <article
                  className={cn(
                    'group relative flex w-full flex-col rounded-3xl border p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-2',
                    plan.popular
                      ? 'border-brand-400/80 bg-white shadow-float ring-1 ring-brand-700/20 hover:shadow-2xl hover:border-brand-500'
                      : 'border-white/80 bg-white/90 shadow-card hover:border-brand-300 hover:shadow-xl'
                  )}
                >
                  {plan.popular && (
                    <Badge
                      tone="solid"
                      className="absolute -top-3 right-5 rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide shadow-md transition-transform duration-300 group-hover:scale-105"
                    >
                      Most chosen
                    </Badge>
                  )}

                  <header>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-brand-700">
                        {plan.name}
                      </h3>
                      {plan.aiPreview && (
                        <Badge tone="brand" className="shrink-0 animate-pulse">
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

                  <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-brand-50/60 p-3 text-center transition-colors group-hover:bg-brand-50/90">
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
                          className="mt-0.5 size-4 shrink-0 text-brand-700 transition-transform duration-300 group-hover:scale-110"
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
                      'mt-6 inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-sm font-semibold transition-all duration-300',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      plan.popular
                        ? 'bg-cta-gradient text-white shadow-cta hover:scale-[1.02] hover:brightness-110 hover:shadow-lg'
                        : 'border border-border bg-white text-ink shadow-pill hover:scale-[1.02] hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                    )}
                  >
                    {plan.priceValue === 0
                      ? 'Start free'
                      : `Choose ${plan.name}`}
                    <span className="sr-only"> plan</span>
                  </Link>
                </article>
              </ScrollReveal>
            </li>
          ))}
        </ul>

        <ScrollReveal delay={350} direction="up">
          <p className="mt-8 text-sm text-ink-muted">
            Prices are in Nepalese rupees and charged per event, not per month.{' '}
            <Link href="/#faq" className="font-medium text-brand-700 hover:underline">
              Read what happens when storage runs out
            </Link>
            .
          </p>
        </ScrollReveal>
      </Container>
    </section>
  )
}
