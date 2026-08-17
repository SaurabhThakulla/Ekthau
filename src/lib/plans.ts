/**
 * Pricing plans. Previously this list existed twice — once on the landing page
 * and once in the create-event form — with values that had already drifted
 * (guest counts and retention differed). One definition now feeds the pricing
 * table, the create-event picker and the pricing JSON-LD.
 */

export interface Plan {
  /** Stable id, also the value used in the `?plan=` query string. */
  id: string
  name: string
  /** Human label for the audience this plan is aimed at. */
  summary: string
  priceLabel: string
  /** Numeric price in NPR — used for structured data. 0 for the free tier. */
  priceValue: number
  period: string
  storageLabel: string
  storageBytes: number
  guestLabel: string
  guestLimit: number
  retentionLabel: string
  retentionDays: number
  features: string[]
  popular?: boolean
  /** Marks features that are announced but not shipped yet. */
  aiPreview?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Starter',
    summary: 'Intimate dinners and birthday brunches.',
    priceLabel: 'Free',
    priceValue: 0,
    period: 'forever',
    storageLabel: '1 GB',
    storageBytes: 1_073_741_824,
    guestLabel: 'Up to 10 guests',
    guestLimit: 10,
    retentionLabel: '2 days',
    retentionDays: 2,
    features: [
      'In-browser camera, no downloads',
      'Printable table QR card',
      'Live gallery for guests',
      'One-click ZIP download',
    ],
  },
  {
    id: '5gb',
    name: 'Mini Event',
    summary: 'Engagements and anniversary parties.',
    priceLabel: 'Rs. 99',
    priceValue: 99,
    period: 'per event',
    storageLabel: '5 GB',
    storageBytes: 5_368_709_120,
    guestLabel: 'Up to 25 guests',
    guestLimit: 25,
    retentionLabel: '30 days',
    retentionDays: 30,
    features: [
      'Original quality kept, never compressed',
      'Short video clips up to 30s',
      'Host moderation panel',
      'Custom venue details',
    ],
  },
  {
    id: '10gb',
    name: 'Celebration',
    summary: 'Milestone birthdays and family reunions.',
    priceLabel: 'Rs. 499',
    priceValue: 499,
    period: 'per event',
    storageLabel: '10 GB',
    storageBytes: 10_737_418_240,
    guestLabel: 'Up to 50 guests',
    guestLimit: 50,
    retentionLabel: '30 days',
    retentionDays: 30,
    features: [
      'Video clips up to 60s',
      'Live TV and projector slideshow',
      'Priority upload queue',
      'Host welcome banner',
    ],
  },
  {
    id: '30gb',
    name: 'Grand Celebration',
    summary: 'The usual choice for Nepali weddings and receptions.',
    priceLabel: 'Rs. 999',
    priceValue: 999,
    period: 'per event',
    storageLabel: '30 GB',
    storageBytes: 32_212_254_720,
    guestLabel: 'Up to 100 guests',
    guestLimit: 100,
    retentionLabel: '30 days',
    retentionDays: 30,
    popular: true,
    features: [
      'Full-resolution photos and video',
      'Custom monogram QR stands',
      'Interactive live photo wall',
      'Top contributor leaderboard',
    ],
  },
  {
    id: '100gb',
    name: 'Mega Festival',
    summary: 'Conventions, college fests and multi-hall events.',
    priceLabel: 'Rs. 1,999',
    priceValue: 1999,
    period: 'per event',
    storageLabel: '100 GB',
    storageBytes: 107_374_182_400,
    guestLabel: 'Up to 200 guests',
    guestLimit: 200,
    retentionLabel: '90 days',
    retentionDays: 90,
    aiPreview: true,
    features: [
      'Multi-screen live wall sync',
      'Automatic duplicate filtering',
      'Google Drive backup',
      'Selfie photo finder (in development)',
    ],
  },
  {
    id: '250gb',
    name: 'Royal Multi-Day',
    summary: 'Full multi-day package — Haldi, Sangeet, Wedding, Reception.',
    priceLabel: 'Rs. 4,999',
    priceValue: 4999,
    period: 'multi-day',
    storageLabel: '250 GB',
    storageBytes: 268_435_456_000,
    guestLabel: 'Unlimited guests',
    guestLimit: 10_000,
    retentionLabel: '1 year',
    retentionDays: 365,
    aiPreview: true,
    features: [
      'Sub-event folders with separate QR stands',
      'White-label signage and custom domain',
      'Dedicated setup concierge',
      'Face match and auto-highlights (in development)',
    ],
  },
]

export const DEFAULT_PLAN_ID = 'free'

export function getPlan(id: string | null | undefined): Plan {
  if (!id) return PLANS[0]
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0]
}

export function isValidPlanId(id: string | null | undefined): boolean {
  return !!id && PLANS.some((plan) => plan.id === id)
}
