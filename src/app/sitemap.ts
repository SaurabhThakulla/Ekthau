import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

/**
 * Only publicly indexable, canonical URLs belong here. Event-specific routes
 * (`/join/[slug]`, `/e/[slug]/*`) are intentionally excluded — they are private
 * per-event links and are disallowed in robots.txt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: absoluteUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/join'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/signup'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/login'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
