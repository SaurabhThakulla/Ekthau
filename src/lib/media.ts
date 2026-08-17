/**
 * SHA-256 of the file bytes, used as the idempotency key when registering an
 * upload so a retried request cannot create a duplicate media row.
 *
 * A `compressImage()` helper also lived here but was never imported — Ekthau
 * deliberately uploads the untouched original, and the gallery derivatives are
 * generated in `upload/derivatives.ts`. It was removed rather than left as dead
 * code that contradicts the product promise.
 */
export async function generateContentHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}
