import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/index.css'
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Ekthau — The Digital Disposable Camera for Events',
  description:
    'Give your event guests a shared camera in their browser. Scan a QR code, snap candid photos & videos, and watch memories stream live to the event gallery. Zero app downloads required.',
  openGraph: {
    title: 'Ekthau — The Digital Disposable Camera for Events',
    description:
      'Your celebration, through everyone’s eyes. Turn guests into candid photographers with zero app downloads.',
    url: 'https://ekthau.com',
    siteName: 'Ekthau',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ekthau — The Digital Disposable Camera for Events',
    description:
      'Your celebration, through everyone’s eyes. Turn guests into candid photographers with zero app downloads.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
