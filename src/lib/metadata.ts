import type { Metadata } from 'next'
import { site } from '@/lib/site'

/**
 * Builds a page's metadata block.
 *
 * Next merges `openGraph` and `twitter` by replacing the whole object rather
 * than merging their keys, so a page that set only `title` silently dropped
 * `og:type` and downgraded the Twitter card from `summary_large_image` to
 * `summary`. Routing every page through here keeps those defaults attached.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  socialDescription,
  noindex,
}: {
  title: string
  description: string
  /** Absolute path, used for both the canonical and `og:url`. */
  path: string
  /** Defaults to `title` when the share headline should read differently. */
  socialTitle?: string
  socialDescription?: string
  /** Private screens: keep them out of the index but still followable. */
  noindex?: boolean
}): Metadata {
  const shareTitle = socialTitle ?? title
  const shareDescription = socialDescription ?? description

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: site.locale,
      url: path,
      title: shareTitle,
      description: shareDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDescription,
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}
