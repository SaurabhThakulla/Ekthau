import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Host dashboards, per-guest camera screens and join links are either
        // private or unique per event — there is nothing there to index.
        disallow: ['/dashboard', '/dashboard/', '/e/', '/join/', '/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    // No `host` directive: it is a non-standard Yandex extension that expects a
    // bare hostname, and emitting a full URL there is simply invalid.
  }
}
