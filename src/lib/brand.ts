/**
 * Brand asset paths, declared once so the header, footer, favicon, web manifest
 * and social card all point at the same file.
 *
 * `logoMark` is the square lockup (camera + film strip + wordmark). It is used
 * as an app-icon style badge in the UI and as the favicon source.
 */
export const brand = {
  /** Square logo, served from /public/brand. */
  logoMark: '/brand/ekthau-logo.png',
  /** Intrinsic pixel size of the square artwork. */
  logoMarkSize: 1256,
  /**
   * The supplied artwork has an opaque dark backdrop, so on light surfaces it is
   * rendered inside a dark rounded badge — which reads as deliberate rather than
   * as a grey square floating on lavender. Set this to false once a
   * transparent-background version replaces the file.
   */
  logoHasOpaqueBackground: true,
} as const

export const brandTagline = 'Capture · Develop · Share'
