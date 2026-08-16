import type { Metadata } from 'next'
import { DM_Serif_Display, Plus_Jakarta_Sans, Space_Mono } from 'next/font/google'
import '@/index.css'
import Providers from '@/components/Providers'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Ekthau (एकठाउँ) — Digital Disposable Camera for Celebrations',
  description:
    'Turn every guest into a candid event photographer. No apps to download. Place QR table cards, capture raw uncompressed moments, and stream live memories onto venue screens.',
  openGraph: {
    title: 'Ekthau (एकठाउँ) — Digital Disposable Camera for Celebrations',
    description:
      'The best photos of your celebration won’t come from the hired photographer. They’ll come from Table 6. Zero apps required.',
    url: 'https://ekthau.com',
    siteName: 'Ekthau',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ekthau (एकठाउँ) — Digital Disposable Camera for Celebrations',
    description:
      'The best photos of your celebration won’t come from the hired photographer. They’ll come from Table 6. Zero apps required.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${dmSerif.variable} ${plusJakarta.variable} ${spaceMono.variable} font-sans min-h-screen bg-[#121316] text-[#F7F4EE] antialiased selection:bg-[#C84B28] selection:text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
