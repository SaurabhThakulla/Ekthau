// Resumable S3-Compatible Multipart Uploader for Cloudflare R2
// Breaks large files (>= 10MB) into 6MB parts and uploads them with individual chunk retry.

import { UPLOAD_CONFIG, getBackoffDelay } from './uploadConfig'
import type { SerializedPart } from './uploadStorage'

interface MultipartUploadParams {
  file: File
  eventId: string
  sessionTokenHash: string
  edgeFunctionUrl: string
  anonKey: string
  existingUploadId?: string
  existingStoragePath?: string
  existingParts?: SerializedPart[]
  onProgress?: (progressPercent: number) => void
  isCancelled?: () => boolean
}

export interface MultipartUploadResult {
  mediaId: string
  storagePath: string
}

export async function executeMultipartUpload({
  file,
  eventId,
  sessionTokenHash,
  edgeFunctionUrl,
  anonKey,
  existingUploadId,
  existingStoragePath,
  existingParts = [],
  onProgress,
  isCancelled,
}: MultipartUploadParams): Promise<MultipartUploadResult> {
  const chunkSize = UPLOAD_CONFIG.MULTIPART_CHUNK_SIZE_BYTES
  const totalParts = Math.ceil(file.size / chunkSize)

  let uploadId = existingUploadId
  let storagePath = existingStoragePath
  let mediaId = storagePath ? storagePath.split('/')[3] : ''

  // 1. Initiate Multipart Upload if not already initiated
  if (!uploadId || !storagePath) {
    if (isCancelled?.()) throw new Error('Upload cancelled')

    const initRes = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        action: 'initiate-multipart',
        event_id: eventId,
        filename: file.name,
        content_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        session_token_hash: sessionTokenHash,
      }),
    })

    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({}))
      throw new Error(err.error || `Failed to initiate multipart upload (${initRes.status})`)
    }

    const initData = await initRes.json()
    uploadId = initData.uploadId
    storagePath = initData.storagePath
    mediaId = initData.mediaId
  }

  // 2. Upload Each Part
  const completedPartsMap = new Map<number, string>()
  existingParts.forEach((p) => completedPartsMap.set(p.partNumber, p.eTag))

  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    if (isCancelled?.()) throw new Error('Upload cancelled')

    // If part already uploaded previously, skip
    if (completedPartsMap.has(partNumber)) {
      const progress = Math.round((completedPartsMap.size / totalParts) * 100)
      onProgress?.(progress)
      continue
    }

    const start = (partNumber - 1) * chunkSize
    const end = Math.min(file.size, start + chunkSize)
    const chunk = file.slice(start, end)

    // Retry loop for individual part
    let partSuccess = false
    let lastError: any = null

    for (let attempt = 0; attempt < UPLOAD_CONFIG.MAX_RETRIES; attempt++) {
      if (isCancelled?.()) throw new Error('Upload cancelled')

      try {
        // A. Request Presigned URL for this part
        const partUrlRes = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            action: 'get-part-url',
            event_id: eventId,
            session_token_hash: sessionTokenHash,
            upload_id: uploadId,
            storage_path: storagePath,
            part_number: partNumber,
          }),
        })

        if (!partUrlRes.ok) {
          throw new Error(`Failed to get part ${partNumber} presigned URL`)
        }

        const { partSignedUrl } = await partUrlRes.json()

        // B. Upload Part to Cloudflare R2
        const uploadRes = await fetch(partSignedUrl, {
          method: 'PUT',
          body: chunk,
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        })

        if (!uploadRes.ok) {
          throw new Error(`Part ${partNumber} upload returned ${uploadRes.status}`)
        }

        // S3 returns ETag header in response (e.g. '"d41d8cd98f00b204e9800998ecf8427e"')
        const rawEtag = uploadRes.headers.get('ETag') || uploadRes.headers.get('etag')
        const eTag = rawEtag ? rawEtag.replace(/"/g, '') : `part-${partNumber}`

        completedPartsMap.set(partNumber, eTag)
        partSuccess = true

        const progress = Math.round((completedPartsMap.size / totalParts) * 100)
        onProgress?.(progress)
        break
      } catch (err: any) {
        lastError = err
        const delay = getBackoffDelay(attempt)
        await new Promise((r) => setTimeout(r, delay))
      }
    }

    if (!partSuccess) {
      throw lastError || new Error(`Failed to upload part ${partNumber} after retries`)
    }
  }

  // 3. Complete Multipart Upload
  if (isCancelled?.()) throw new Error('Upload cancelled')

  const partsManifest = Array.from(completedPartsMap.entries())
    .map(([partNumber, eTag]) => ({
      PartNumber: partNumber,
      ETag: `"${eTag.replace(/"/g, '')}"`,
    }))
    .sort((a, b) => a.PartNumber - b.PartNumber)

  const completeRes = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      action: 'complete-multipart',
      event_id: eventId,
      session_token_hash: sessionTokenHash,
      upload_id: uploadId,
      storage_path: storagePath,
      parts: partsManifest,
    }),
  })

  if (!completeRes.ok) {
    const err = await completeRes.json().catch(() => ({}))
    throw new Error(err.error || `Failed to complete multipart upload (${completeRes.status})`)
  }

  return {
    mediaId,
    storagePath: storagePath!,
  }
}
