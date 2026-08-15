// Single Presigned PUT Uploader for files < 10MB
// Uploads original raw file + lightweight thumbnail & preview derivatives directly to Cloudflare R2

import { getBackoffDelay, UPLOAD_CONFIG } from './uploadConfig'

interface SingleUploadParams {
  originalFile: File
  thumbnailBlob: Blob | null
  previewBlob: Blob | null
  eventId: string
  sessionTokenHash: string
  edgeFunctionUrl: string
  anonKey: string
  onProgress?: (percent: number) => void
  isCancelled?: () => boolean
}

export interface SingleUploadResult {
  mediaId: string
  storagePath: string
  thumbnailPath?: string
  previewPath?: string
}

export async function executeSingleUpload({
  originalFile,
  thumbnailBlob,
  previewBlob,
  eventId,
  sessionTokenHash,
  edgeFunctionUrl,
  anonKey,
  onProgress,
  isCancelled,
}: SingleUploadParams): Promise<SingleUploadResult> {
  if (isCancelled?.()) throw new Error('Upload cancelled')

  // 1. Request Signed URLs for original and derivatives from Edge Function
  const signedUrlRes = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      action: 'single-put',
      event_id: eventId,
      filename: originalFile.name,
      content_type: originalFile.type || 'image/jpeg',
      size_bytes: originalFile.size,
      session_token_hash: sessionTokenHash,
    }),
  })

  if (!signedUrlRes.ok) {
    const err = await signedUrlRes.json().catch(() => ({}))
    throw new Error(err.error || `Failed to get upload authorization (${signedUrlRes.status})`)
  }

  const { mediaId, original, thumbnail, preview } = await signedUrlRes.json()

  // 2. Upload Original with Retry Loop
  let originalUploaded = false
  let lastError: any = null

  for (let attempt = 0; attempt < UPLOAD_CONFIG.MAX_RETRIES; attempt++) {
    if (isCancelled?.()) throw new Error('Upload cancelled')

    try {
      const uploadRes = await fetch(original.signedUrl, {
        method: 'PUT',
        body: originalFile,
        headers: {
          'Content-Type': originalFile.type || 'application/octet-stream',
        },
      })

      if (!uploadRes.ok) {
        throw new Error(`Original upload returned HTTP ${uploadRes.status}`)
      }

      originalUploaded = true
      onProgress?.(80)
      break
    } catch (err: any) {
      lastError = err
      const delay = getBackoffDelay(attempt)
      await new Promise((r) => setTimeout(r, delay))
    }
  }

  if (!originalUploaded) {
    throw lastError || new Error('Failed to upload original file to storage')
  }

  // 3. Upload Derivatives in Background (Best Effort)
  const derivativePromises: Promise<any>[] = []

  if (thumbnail && thumbnailBlob) {
    derivativePromises.push(
      fetch(thumbnail.signedUrl, {
        method: 'PUT',
        body: thumbnailBlob,
        headers: { 'Content-Type': 'image/webp' },
      }).catch((e) => console.warn('Thumbnail upload skipped:', e))
    )
  }

  if (preview && previewBlob) {
    derivativePromises.push(
      fetch(preview.signedUrl, {
        method: 'PUT',
        body: previewBlob,
        headers: { 'Content-Type': 'image/webp' },
      }).catch((e) => console.warn('Preview upload skipped:', e))
    )
  }

  await Promise.allSettled(derivativePromises)
  onProgress?.(100)

  return {
    mediaId,
    storagePath: original.storagePath,
    thumbnailPath: thumbnail?.storagePath,
    previewPath: preview?.storagePath,
  }
}
