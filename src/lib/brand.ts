/**
 * Brand asset paths, declared once so the header, footer, favicon, web manifest
 * and social card all point at the same file.
 *
 * `logoMark` is the square lockup (camera + film strip + wordmark). It is used
 * as an app-icon style badge in the UI and as the favicon source.
 */
export const brand = {
  /**
   * Minimalist camera mark. Derived and optimized from the master logo by
   * `scripts/build-brand-assets.mjs` for UI badges, favicons, and touch icons.
   */
  logoMark: '/brand/ekthau-mark.png',
  logoMarkSize: 512,

  /** The master logo image. */
  logoFull: '/brand/ekthau-logo.png',
  logoFullSize: 1254,

  /**
   * The artwork carries its own dark backdrop, so on light surfaces it is framed
   * in a dark rounded badge for crisp, high-contrast display.
   */
  logoHasOpaqueBackground: true,
} as const

export const brandTagline = 'Capture · Develop · Share'
