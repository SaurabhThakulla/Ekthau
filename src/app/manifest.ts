import type { MetadataRoute } from 'next'
import { brand } from '@/lib/brand'
import { site } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.shortDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1B1145',
    orientation: 'portrait',
    icons: [
      {
        src: brand.logoMark,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: brand.logoMark,
        sizes: '512x512',
        type: 'image/png',
        // Lets Android crop the square mark into its own icon shapes.
        purpose: 'maskable',
      },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
