import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { FAQS } from '@/lib/faqs'

/**
 * Built on native <details>/<summary>: keyboard operable, announced correctly,
 * expandable without JavaScript, and — unlike the previous conditional render —
 * the answer text is present in the HTML for crawlers.
 */
export function FaqSection() {
  return (
    <section id="faq" className="section-y">
      <Container width="narrow">
        <div className="text-center">
          <p className="eyebrow">Questions</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-[2.75rem]">
            Everything hosts ask before their first event
          </h2>
        </div>

        <div className="mt-10 divide-y divide-border overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-card backdrop-blur-sm">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-medium text-ink transition-colors hover:bg-brand-50/60 [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-brand-50 text-brand-700 transition-transform group-open:rotate-45"
                >
                  <Plus className="size-4" />
                </span>
              </summary>
              <div className="px-5 pb-5">
                <p className="max-w-prose text-sm leading-relaxed text-ink-muted">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Still deciding?{' '}
          <Link href="/#pricing" className="font-medium text-brand-700 hover:underline">
            Compare the plans
          </Link>{' '}
          or{' '}
          <Link href="/signup" className="font-medium text-brand-700 hover:underline">
            create a free event
          </Link>{' '}
          and try it with one table.
        </p>
      </Container>
    </section>
  )
}
