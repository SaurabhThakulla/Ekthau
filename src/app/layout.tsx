import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/index.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ekthau - Effortless Event Photo Sharing',
  description:
    'Live event photo & video sharing platform. Scan QR, snap photos, upload instantly without installing any app.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
