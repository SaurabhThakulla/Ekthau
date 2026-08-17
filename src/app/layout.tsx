import type { Metadata, Viewport } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import '@/index.css'
import Providers from '@/components/Providers'
import { absoluteUrl, site, siteUrl } from '@/lib/site'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    // Every child page gets a unique, branded title without repeating itself.
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [...site.keywords],
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: site.locale,
    url: siteUrl,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.shortDescription,
  },
  icons: {
    // The favicon existed in /public but nothing referenced it, so browsers
    // asked for /favicon.ico and got a 404 on every page load.
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg' }],
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Not capped at 1, so pinch-to-zoom keeps working for low-vision users.
  maximumScale: 5,
  themeColor: '#0B132B',
  colorScheme: 'light',
}

/** Site-wide organisation identity, referenced by page-level JSON-LD. */
const organisationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': absoluteUrl('/#organization'),
  name: site.name,
  alternateName: site.nameLocal,
  url: siteUrl,
  description: site.shortDescription,
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl('/favicon.svg'),
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': absoluteUrl('/#website'),
  url: siteUrl,
  name: site.name,
  description: site.shortDescription,
  inLanguage: 'en',
  publisher: { '@id': absoluteUrl('/#organization') },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {/* First stop for keyboard users — lets them bypass the header nav. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>

        <Providers>{children}</Providers>

        <script
          type="application/ld+json"
          // Static, developer-authored JSON with no user input in it.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organisationSchema, websiteSchema]),
          }}
        />
      </body>
    </html>
  )
}
