import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { FAQS } from '@/lib/faqs'

export function FaqSection() {
  return (
    <section id="faq" className="section-y relative">
      <Container width="narrow">
        <ScrollReveal direction="up" distance={20}>
          <div className="text-center">
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-[2.75rem]">
              Everything hosts ask before their first event
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150} direction="up" distance={24}>
          <div className="mt-10 divide-y divide-border overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-card backdrop-blur-md">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group transition-colors duration-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-medium text-ink transition-all duration-200 hover:bg-brand-50/70 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-semibold transition-colors group-open:text-brand-700">
                    {faq.question}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-brand-50 text-brand-700 transition-all duration-300 group-hover:scale-110 group-open:rotate-45 group-open:bg-brand-700 group-open:text-white"
                  >
                    <Plus className="size-4" />
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-1">
                  <p className="max-w-prose text-sm leading-relaxed text-ink-muted">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={250} direction="up">
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
        </ScrollReveal>
      </Container>
    </section>
  )
}
