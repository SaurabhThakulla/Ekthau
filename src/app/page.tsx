import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Camera,
  Check,
  Download,
  ImageOff,
  MonitorPlay,
  QrCode,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout/container'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { JoinCodeForm } from '@/components/landing/join-code-form'
import { PricingSection } from '@/components/landing/pricing-section'
import { FaqSection } from '@/components/landing/faq-section'
import { FAQS } from '@/lib/faqs'
import { PLANS } from '@/lib/plans'
import { absoluteUrl, site, siteUrl } from '@/lib/site'

const pageTitle = 'Event Photo Sharing by QR Code — No App for Guests'

export const metadata: Metadata = {
  // Set explicitly (not via the template) so the home page keeps a tight,
  // keyword-led title instead of "… | Ekthau" appended to the brand name.
  title: `${site.name} — ${pageTitle}`,
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${site.name} — ${pageTitle}`,
    description: site.description,
    url: siteUrl,
    type: 'website',
  },
  twitter: {
    title: `${site.name} — ${pageTitle}`,
    description: site.shortDescription,
  },
}

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
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border bg-brand-sheen">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 right-0 hidden size-[36rem] rounded-full bg-brand-200/35 blur-3xl lg:block"
          />

          <Container className="relative py-14 md:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-6 xl:col-span-6">
                <Badge tone="brand" className="mb-5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-brand-700"
                  />
                  No app download for guests
                </Badge>

                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
                  Every guest photo from your event,{' '}
                  <span className="text-gradient-brand">in one shared album</span>
                </h1>

                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
                  Put a QR card on each table. Guests scan with the camera they
                  already have, shoot away, and every full-resolution photo lands in
                  your gallery — live, and yours to download.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="sm:w-auto">
                    <Link href="/signup">
                      Create your event — free
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/#how-it-works">See how it works</Link>
                  </Button>
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <JoinCodeForm />
                </div>

                <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
                  {[
                    { value: '1 GB', label: 'Free with every account' },
                    { value: 'Original', label: 'Quality, never compressed' },
                    { value: 'Offline', label: 'Uploads that finish themselves' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <dt className="sr-only">{stat.label}</dt>
                      <dd>
                        <span className="block font-display text-lg font-bold text-ink">
                          {stat.value}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                          {stat.label}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Product visual: the table card guests actually see. */}
              <div className="lg:col-span-6 xl:col-span-6">
                <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-brand-950/40 bg-ink-gradient p-4 shadow-xl sm:p-5 lg:max-w-none">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-300">
                        Table signage
                      </p>
                      <p className="truncate font-display text-sm font-semibold text-white">
                        Table 08 · Banquet Hall
                      </p>
                    </div>
                    <Badge tone="onDark" className="shrink-0">
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-emerald-400"
                      />
                      Live
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-5 items-center gap-4">
                    <div className="relative col-span-2 aspect-square overflow-hidden rounded-xl border border-white/10 bg-white">
                      <Image
                        src="/images/table-qr-stand.jpg"
                        alt="A printed Ekthau QR card standing on a decorated dinner table"
                        fill
                        priority
                        sizes="(max-width: 640px) 40vw, (max-width: 1024px) 180px, 200px"
                        className="object-cover"
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <p className="text-sm font-medium leading-snug text-white">
                        Guests scan with their normal camera app and start shooting.
                      </p>
                      <ul className="space-y-1 text-xs text-white/65">
                        {[
                          'Works in Safari and Chrome',
                          'Keeps shooting on weak signal',
                          'Photos appear on screen live',
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-1.5">
                            <Check
                              className="size-3 shrink-0 text-brand-300"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                      Arriving now
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          src: '/images/phone-camera-snap.jpg',
                          alt: 'A guest holding up a phone to photograph friends at a party table',
                          caption: 'Table 08',
                        },
                        {
                          src: '/images/live-wall.jpg',
                          alt: 'Guests laughing together during a celebration',
                          caption: 'On the wall',
                        },
                      ].map((shot) => (
                        <figure
                          key={shot.src}
                          className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-black"
                        >
                          <Image
                            src={shot.src}
                            alt={shot.alt}
                            fill
                            sizes="(max-width: 640px) 45vw, 220px"
                            className="object-cover"
                          />
                          <figcaption className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 text-[10px] font-medium text-white/85">
                            {shot.caption}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="section-y border-b border-border bg-white">
          <Container>
            <div className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Set up in three steps, before the first guest arrives
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                Creating an event takes under a minute. Everything after that happens
                on its own.
              </p>
            </div>

            <ol role="list" className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="group rounded-2xl border border-border bg-white p-6 shadow-card transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-display text-3xl font-bold text-brand-100"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* ── Why it beats the alternatives ────────────────────────────── */}
        <section className="section-y border-b border-border bg-muted/40">
          <Container>
            <div className="max-w-2xl">
              <p className="eyebrow">Why hosts switch</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                The photos you actually want are on other people&apos;s phones
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                Your photographer captures the ceremony. Table six captures the
                moment your uncle finally danced. Ekthau collects both without asking
                anyone to install anything.
              </p>
            </div>

            <ul role="list" className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12">
              {COMPARISONS.map((item) => (
                <li
                  key={item.problem}
                  className="flex gap-4 rounded-2xl border border-border bg-white p-6 shadow-card"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-ink">
                      {item.problem}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {item.solution}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ── Live wall ────────────────────────────────────────────────── */}
        <section
          id="live-wall"
          className="section-y border-b border-brand-950 bg-ink-gradient text-white"
        >
          <Container>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-300">
                  Live photo wall
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Put the celebration on the venue screen as it happens
                </h2>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-white/70">
                  Plug any laptop into the projector or TV and open your live wall
                  link. Approved photos fade in seconds after they are taken.
                </p>
              </div>
              <Button asChild variant="onDark" size="lg" className="shrink-0">
                <Link href="/signup">
                  Set up a live wall
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <figure className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl sm:aspect-[21/9]">
              <Image
                src="/images/projector-live-wall.jpg"
                alt="Guest photos projected onto a large screen above a celebration dance floor"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 p-4 text-xs text-white/80">
                <span>Photos rotate automatically every few seconds</span>
                <span className="hidden sm:inline">Works over HDMI on any laptop</span>
              </figcaption>
            </figure>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="size-4 text-brand-300" aria-hidden="true" />
                  You approve what goes up
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Switch moderation on and nothing reaches the screen or the shared
                  gallery until you have seen it in your dashboard.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="size-4 text-brand-300" aria-hidden="true" />
                  Find yourself with a selfie
                  <Badge tone="onDark" className="ml-1">
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
          </Container>
        </section>

        <PricingSection />
        <FaqSection />

        {/* ── Closing CTA ──────────────────────────────────────────────── */}
        <section className="bg-ink-gradient py-16 text-white md:py-20">
          <Container width="narrow" className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your next celebration deserves every angle
            </h2>
            <p className="mx-auto mt-4 max-w-prose text-base leading-relaxed text-white/70">
              Create your event, print the QR card, and let your guests do the rest.
              The first gigabyte is free.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="onDark" size="lg">
                <Link href="/signup">
                  Create your event
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="onDarkGhost" size="lg">
                <Link href="/join">
                  <QrCode aria-hidden="true" />
                  I&apos;m a guest
                </Link>
              </Button>
            </div>
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
