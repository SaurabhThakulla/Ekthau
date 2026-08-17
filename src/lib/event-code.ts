/**
 * Normalises whatever a guest pastes — a bare code, a full join URL, a QR
 * payload — into the event slug. Shared by the landing form, the join page and
 * the QR scanner so all three accept exactly the same inputs.
 */
export function extractEventSlug(input: string): string | null {
  const raw = (input ?? '').trim()
  if (!raw) return null

  let value = raw

  // Full or partial URL: take the segment after /join/ or /e/.
  const urlMatch = /\/(?:join|e)\/([^/?#\s]+)/i.exec(value)
  if (urlMatch) {
    value = urlMatch[1]
  } else if (/^https?:\/\//i.test(value)) {
    // A URL that does not contain a recognised path is not an event code.
    try {
      const segments = new URL(value).pathname.split('/').filter(Boolean)
      value = segments[segments.length - 1] ?? ''
    } catch {
      return null
    }
  }

  value = decodeURIComponent(value.split('?')[0].split('#')[0]).trim()

  // Slugs are generated as hex, but hosts may use readable codes. Allow
  // letters, digits, hyphen and underscore; reject anything else so a stray
  // paste cannot be pushed into the URL.
  if (!/^[A-Za-z0-9_-]{3,64}$/.test(value)) return null

  return value
}
