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
        sizes: `${brand.logoMarkSize}x${brand.logoMarkSize}`,
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: brand.logoMark,
        sizes: `${brand.logoMarkSize}x${brand.logoMarkSize}`,
        type: 'image/png',
        // Lets Android crop the mark into its own icon shapes.
        purpose: 'maskable',
      },
    ],
  }
}
