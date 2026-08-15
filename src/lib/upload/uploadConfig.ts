// Configuration settings for Ekthau's resilient upload engine

export const UPLOAD_CONFIG = {
  // File size validation limits
  MAX_IMAGE_SIZE_BYTES: 25 * 1024 * 1024, // 25 MB
  MAX_VIDEO_SIZE_BYTES: 100 * 1024 * 1024, // 100 MB

  // Allowed MIME types
  ALLOWED_IMAGE_MIMES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ],
  ALLOWED_VIDEO_MIMES: [
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ],

  // Multipart threshold and chunk sizing (S3 requires min 5MB per part, except the last)
  MULTIPART_THRESHOLD_BYTES: 10 * 1024 * 1024, // 10 MB
  MULTIPART_CHUNK_SIZE_BYTES: 6 * 1024 * 1024, // 6 MB chunk size

  // Concurrency rules
  MAX_CONCURRENT_UPLOADS_FAST: 2,
  MAX_CONCURRENT_UPLOADS_SLOW: 1,

  // Retry settings
  MAX_RETRIES: 4,
  BASE_RETRY_DELAY_MS: 1000, // 1s
  MAX_RETRY_DELAY_MS: 15000, // 15s

  // Derivatives specifications
  THUMBNAIL_MAX_DIMENSION: 420,
  THUMBNAIL_QUALITY: 0.75,
  PREVIEW_MAX_DIMENSION: 1600,
  PREVIEW_QUALITY: 0.85,

  // Storage keys
  INDEXED_DB_STORE_KEY: 'ekthau_upload_queue_v2',
} as const

// Helper to determine if a file should use multipart upload
export function shouldUseMultipart(fileSize: number): boolean {
  return fileSize >= UPLOAD_CONFIG.MULTIPART_THRESHOLD_BYTES
}

// Calculate exponential backoff delay with random jitter to avoid thundering herds
export function getBackoffDelay(attempt: number): number {
  const exponential = Math.min(
    UPLOAD_CONFIG.MAX_RETRY_DELAY_MS,
    UPLOAD_CONFIG.BASE_RETRY_DELAY_MS * Math.pow(2, attempt)
  )
  const jitter = Math.random() * 0.4 + 0.8 // 80% to 120% jitter
  return Math.round(exponential * jitter)
}
