import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Camera,
  Download,
  ImageOff,
  MonitorPlay,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout/container'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { JoinCodeForm } from '@/components/landing/join-code-form'
import { HeroShowcase } from '@/components/landing/hero-showcase'
import { FeatureMarquee } from '@/components/landing/feature-marquee'
import { PricingSection } from '@/components/landing/pricing-section'
import { FaqSection } from '@/components/landing/faq-section'
import { FAQS } from '@/lib/faqs'
import { pageMetadata } from '@/lib/metadata'
import { PLANS } from '@/lib/plans'
import { absoluteUrl, site, siteUrl } from '@/lib/site'

// Set explicitly (not via the title template) so the home page keeps a tight,
// keyword-led title instead of "… | Ekthau" appended to the brand name.
const pageTitle = `${site.name} — Event Photo Sharing by QR Code, No App for Guests`

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: site.description,
  path: '/',
  socialDescription: site.shortDescription,
})

const STEPS = [
  {
    icon: QrCode,
    title: 'Print the QR cards',
    body: 'Create your event and download a print-ready QR card. Put one on every table, at the entrance, or on the back of the menu.',
  },
  {
    icon: Camera,
    title: 'Guests scan and shoot',
    body: 'Their normal phone camera opens Ekthau in the browser. They start taking photos in seconds — no app, no login, no password.',
  },
  {
    icon: Download,
    title: 'You get everything',
    body: 'Photos land in one gallery as they are taken. Show them on the venue screen, and download the full-resolution album whenever you like.',
  },
]

const COMPARISONS = [
  {
    icon: ImageOff,
    problem: 'WhatsApp groups wreck the quality',
    solution:
      'Ekthau uploads the original file. A 24 MB photo arrives as a 24 MB photo, ready to print.',
  },
  {
    icon: ShieldCheck,
    problem: 'Shared drives need accounts and permissions',
    solution:
      'Guests never sign in. One scan puts them in your event, and only people with the code can get in.',
  },
  {
    icon: WifiOff,
    problem: 'Packed halls kill the signal mid-upload',
    solution:
      'Photos save to the phone first and finish uploading on their own once signal returns. Nothing is lost.',
  },
  {
    icon: MonitorPlay,
    problem: 'Nobody sees the photos until days later',
    solution:
      'Approved photos appear on the venue projector within seconds, so the party watches itself unfold.',
  },
]

/**
 * Product schema is generated from the same PLANS list the pricing table
 * renders, so the marked-up offers can never contradict the visible prices.
 */
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': absoluteUrl('/#software'),
  name: site.name,
  alternateName: site.nameLocal,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web browser',
  url: siteUrl,
  description: site.description,
  publisher: { '@id': absoluteUrl('/#organization') },
  offers: PLANS.map((plan) => ({
    '@type': 'Offer',
    name: plan.name,
    description: plan.summary,
    price: plan.priceValue,
    priceCurrency: 'NPR',
    url: absoluteUrl(plan.id === 'free' ? '/signup' : `/signup?plan=${plan.id}`),
    availability: 'https://schema.org/InStock',
  })),
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': absoluteUrl('/#faq'),
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': absoluteUrl('/#how-it-works'),
  name: 'How to collect photos from every guest at your event',
  description:
    'Set up a shared event gallery that guests contribute to by scanning a QR code, with no app to download.',
  step: STEPS.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.title,
    text: step.body,
    url: absoluteUrl('/#how-it-works'),
  })),
}

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas overflow-x-hidden">
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Ambient background lighting mesh */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 top-0 size-[500px] animate-blob rounded-full bg-brand-200/40 blur-[100px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 top-20 size-[500px] animate-blob-slow rounded-full bg-pink-200/30 blur-[100px]"
          />

          <Container className="relative pb-12 pt-10 md:pb-16 md:pt-16 lg:pb-20 lg:pt-20">
            <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-6">
                <ScrollReveal direction="up" distance={16} delay={0}>
                  <p className="chip mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 transition-all duration-300 hover:scale-105 hover:border-brand-300">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-radar-ping rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-violet-600" />
                    </span>
                    No app download for guests
                  </p>
                </ScrollReveal>

                <ScrollReveal direction="up" distance={20} delay={100}>
                  <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.03em] text-ink sm:text-5xl lg:text-[3.6rem]">
                    Every guest photo,{' '}
                    <span className="text-gradient-brand">in one shared album.</span>
                  </h1>
                </ScrollReveal>

                <ScrollReveal direction="up" distance={20} delay={180}>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
                    Put a QR card on each table. Guests scan with the camera they
                    already have, shoot away, and every full-resolution photo lands in
                    your gallery — live, and yours to download.
                  </p>
                </ScrollReveal>

                <ScrollReveal direction="up" distance={20} delay={240}>
                  <ul
                    role="list"
                    className="mt-7 flex flex-wrap items-center gap-2.5"
                  >
                    {[
                      { icon: Users, label: '1 GB free, no card needed' },
                      { icon: Sparkles, label: 'Originals, never compressed' },
                      { icon: WifiOff, label: 'Uploads finish themselves' },
                    ].map((item) => (
                      <li
                        key={item.label}
                        className="chip transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm"
                      >
                        <item.icon
                          className="size-4 shrink-0 text-violet-600"
                          aria-hidden="true"
                        />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </ScrollReveal>

                <ScrollReveal direction="up" distance={20} delay={300}>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      asChild
                      size="xl"
                      shape="pill"
                      className="group transition-all duration-300 hover:scale-[1.02] hover:shadow-cta"
                    >
                      <Link href="/signup">
                        Create your event — free
                        <ArrowRight
                          className="transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      size="xl"
                      shape="pill"
                      className="transition-all duration-300 hover:scale-[1.02] hover:border-brand-300"
                    >
                      <Link href="/#how-it-works">See how it works</Link>
                    </Button>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" distance={20} delay={380}>
                  <div className="mt-8 max-w-md border-t border-white/70 pt-6">
                    <JoinCodeForm />
                  </div>
                </ScrollReveal>
              </div>

              <div className="lg:col-span-6">
                <ScrollReveal direction="up" distance={30} delay={150}>
                  <HeroShowcase />
                </ScrollReveal>
              </div>
            </div>
          </Container>
        </section>

        <FeatureMarquee />

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="section-y relative overflow-hidden">
          {/* Subtle background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-1/3 size-80 animate-blob rounded-full bg-brand-200/30 blur-3xl"
          />

          <Container className="relative">
            <ScrollReveal direction="up" distance={20}>
              <div className="max-w-2xl">
                <p className="eyebrow">How it works</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-[2.75rem]">
                  Set up in three steps, before the first guest arrives
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-muted">
                  Creating an event takes under a minute. Everything after that happens
                  on its own.
                </p>
              </div>
            </ScrollReveal>

            <ol role="list" className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex">
                  <ScrollReveal
                    delay={index * 140}
                    direction="up"
                    distance={24}
                    className="w-full flex"
                  >
                    <div className="group relative flex w-full flex-col rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-brand-300 hover:shadow-xl">
                      <div className="flex items-center justify-between">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-cta-gradient text-white shadow-cta transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <step.icon className="size-5" aria-hidden="true" />
                        </span>
                        <span
                          aria-hidden="true"
                          className="font-display text-3xl font-extrabold text-brand-100 transition-colors duration-300 group-hover:text-brand-300"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink transition-colors group-hover:text-brand-700">
                        <span className="sr-only">Step {index + 1}: </span>
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        {step.body}
                      </p>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* ── Why it beats the alternatives ────────────────────────────── */}
        <section className="section-y relative overflow-hidden">
          <Container className="relative">
            <ScrollReveal direction="up" distance={20}>
              <div className="max-w-2xl">
                <p className="eyebrow">Why hosts switch</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl lg:text-[2.75rem]">
                  The photos you actually want are on other people&apos;s phones
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-muted">
                  Your photographer captures the ceremony. Table six captures the
                  moment your uncle finally danced. Ekthau collects both without asking
                  anyone to install anything.
                </p>
              </div>
            </ScrollReveal>

            <ul role="list" className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12">
              {COMPARISONS.map((item, index) => (
                <li key={item.problem} className="flex">
                  <ScrollReveal
                    delay={index * 100}
                    direction="up"
                    distance={20}
                    className="w-full flex"
                  >
                    <div className="group flex w-full gap-4 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lg">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-100">
                        <item.icon className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-brand-700">
                          {item.problem}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ── Live wall ────────────────────────────────────────────────── */}
        <section id="live-wall" className="section-y relative">
          <Container>
            <ScrollReveal direction="up" distance={28}>
              <div className="relative overflow-hidden rounded-[2rem] bg-ink-gradient p-6 text-white shadow-float sm:p-10 lg:p-12">
                {/* Ambient glow inside the live wall card */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-20 size-80 animate-pulse-glow rounded-full bg-brand-500/20 blur-3xl"
                />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-300">
                      Live photo wall
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]">
                      Put the celebration on the venue screen as it happens
                    </h2>
                    <p className="mt-4 max-w-prose text-base leading-relaxed text-white/70">
                      Plug any laptop into the projector or TV and open your live wall
                      link. Approved photos fade in seconds after they are taken.
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="onDark"
                    size="lg"
                    className="group shrink-0 transition-transform hover:scale-105"
                  >
                    <Link href="/signup">
                      Set up a live wall
                      <ArrowRight
                        className="transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </div>

                <figure className="group relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl sm:aspect-[21/9]">
                  <Image
                    src="/images/projector-live-wall.jpg"
                    alt="Guest photos projected onto a large screen above a celebration dance floor"
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 1100px"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-4 text-xs text-white/85 backdrop-blur-[2px]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Photos rotate automatically every few seconds
                    </span>
                    <span className="hidden sm:inline text-white/70">
                      Works over HDMI on any laptop
                    </span>
                  </figcaption>
                </figure>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-0.5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <ShieldCheck
                        className="size-4 text-brand-300 transition-transform group-hover:scale-110"
                        aria-hidden="true"
                      />
                      You approve what goes up
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      Switch moderation on and nothing reaches the screen or the shared
                      gallery until you have seen it in your dashboard.
                    </p>
                  </div>
                  <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xs transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-0.5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Sparkles
                        className="size-4 text-brand-300 transition-transform group-hover:scale-110"
                        aria-hidden="true"
                      />
                      Find yourself with a selfie
                      <Badge tone="onDark" className="ml-1 animate-pulse">
                        In development
                      </Badge>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      We are building a selfie search so guests can pull up every photo
                      they appear in. It is not live yet — plans that mention it are
                      labelled clearly.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>

        <PricingSection />
        <FaqSection />

        {/* ── Closing CTA ──────────────────────────────────────────────── */}
        <section className="section-y relative overflow-hidden">
          <Container>
            <ScrollReveal direction="up" distance={28}>
              <div className="relative overflow-hidden rounded-[2rem] bg-cta-animated px-6 py-14 text-center text-white shadow-float sm:px-12 md:py-16">
                {/* Floating ambient particles / lights */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-12 -top-12 size-48 rounded-full bg-white/10 blur-2xl animate-float"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-12 -right-12 size-48 rounded-full bg-violet-400/20 blur-2xl animate-float-reverse"
                />

                <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]">
                  Your next celebration deserves every angle
                </h2>
                <p className="relative mx-auto mt-4 max-w-prose text-base leading-relaxed text-white/80">
                  Create your event, print the QR card, and let your guests do the
                  rest. The first gigabyte is free.
                </p>
                <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    variant="onDark"
                    size="xl"
                    shape="pill"
                    className="group transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <Link href="/signup">
                      Create your event
                      <ArrowRight
                        className="transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="onDarkGhost"
                    size="xl"
                    shape="pill"
                    className="transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/join">
                      <QrCode aria-hidden="true" />
                      I&apos;m a guest
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      </main>

      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productSchema, howToSchema, faqSchema]),
        }}
      />
    </div>
  )
}
