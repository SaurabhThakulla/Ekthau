/**
 * Resolves a stored object key to a browsable URL. This logic previously lived
 * in both the gallery grid and the moderation page with slightly different
 * behaviour; it now lives here so both agree.
 */
const PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN

export function getMediaUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null

  // Already a full URL (seed data, external covers).
  if (/^https?:\/\//i.test(storagePath)) return storagePath

  if (PUBLIC_DOMAIN) {
    const domain = PUBLIC_DOMAIN.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
    return `https://${domain}/${storagePath.replace(/^\/+/, '')}`
  }

  // No storage domain configured — the caller renders a placeholder instead of
  // pointing an <img> at a path that is guaranteed to 404.
  return null
}

export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(exponent === 0 ? 0 : fractionDigits)} ${units[exponent]}`
}
