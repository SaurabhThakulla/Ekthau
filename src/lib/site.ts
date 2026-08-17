/**
 * Single source of truth for anything that describes the product itself:
 * naming, canonical URL, nav structure and default share copy. Metadata,
 * sitemap, JSON-LD and the header/footer all read from here so they can never
 * drift apart.
 */

function normaliseUrl(value: string | undefined, fallback: string) {
  const raw = (value || fallback).trim()
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  return withProtocol.replace(/\/+$/, '')
}

export const siteUrl = normaliseUrl(
  process.env.NEXT_PUBLIC_APP_URL,
  'https://ekthau.com'
)

export const site = {
  name: 'Ekthau',
  nameLocal: 'एकठाउँ',
  legalName: 'Ekthau',
  url: siteUrl,
  locale: 'en_US',
  tagline: 'Event photo sharing by QR code',
  description:
    'Ekthau turns every guest phone into an event camera. Print a QR code, guests scan and shoot in their browser, and every full-resolution photo lands in one shared gallery you can download in a single click.',
  shortDescription:
    'QR code photo sharing for weddings, birthdays and parties. Guests scan, snap and upload from any phone browser — no app to download.',
  keywords: [
    'event photo sharing',
    'wedding photo app',
    'QR code photo sharing',
    'guest photo collection',
    'digital disposable camera',
    'wedding photo sharing Nepal',
    'live event photo wall',
  ],
} as const

/** Absolute URL helper — required for canonicals, OG tags and JSON-LD. */
export function absoluteUrl(path = '/') {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/** Public marketing nav, also used to build the crawlable footer links. */
export const primaryNav = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#live-wall', label: 'Live wall' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
] as const

export const footerNav = [
  {
    heading: 'Product',
    links: [
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#live-wall', label: 'Live photo wall' },
      { href: '/#pricing', label: 'Pricing & storage' },
      { href: '/#faq', label: 'Common questions' },
    ],
  },
  {
    heading: 'Guests',
    links: [
      { href: '/join', label: 'Join an event' },
      { href: '/join', label: 'Scan a QR code' },
    ],
  },
  {
    heading: 'Hosts',
    links: [
      { href: '/signup', label: 'Create an event' },
      { href: '/login', label: 'Host sign in' },
      { href: '/dashboard', label: 'Host dashboard' },
    ],
  },
] as const
