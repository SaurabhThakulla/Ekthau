/**
 * Derives the hostname allowed for remote images from the configured storage
 * domain. The previous config allowed `hostname: '**'`, which turned the Next
 * image optimiser into an open proxy for any URL on the internet.
 */
const r2Domain = (process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '')
  .replace(/^https?:\/\//i, '')
  .replace(/\/+$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // Seed and demo cover images.
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // The project's own object storage, when configured.
      ...(r2Domain ? [{ protocol: 'https', hostname: r2Domain }] : []),
    ],
    formats: ['image/avif', 'image/webp'],
    // Matches the `sizes` breakpoints actually used in the layouts.
    deviceSizes: [400, 640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [96, 128, 180, 220, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Stops the site being framed by another origin (clickjacking).
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            // The guest camera needs `camera`; nothing here needs the rest.
            value: 'camera=(self), microphone=(), geolocation=(), payment=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        // Private screens must never be cached by an intermediary.
        source: '/dashboard/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/e/:path*',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
    ]
  },
}

export default nextConfig
