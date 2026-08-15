// Client-side derivative generator: creates lightweight preview & thumbnail files
// Leaves the original raw file completely untouched for full-resolution storage and downloads.

import { UPLOAD_CONFIG } from './uploadConfig'

export interface DerivativesResult {
  thumbnailBlob: Blob | null
  previewBlob: Blob | null
  width: number | null
  height: number | null
}

export async function generateDerivatives(
  originalFile: File
): Promise<DerivativesResult> {
  // If it's a video, we don't generate image derivatives on the client
  if (!originalFile.type.startsWith('image/')) {
    return {
      thumbnailBlob: null,
      previewBlob: null,
      width: null,
      height: null,
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(originalFile)
    const img = new Image()

    img.onload = async () => {
      const origWidth = img.naturalWidth || img.width
      const origHeight = img.naturalHeight || img.height

      try {
        // 1. Generate Thumbnail (~420px for Live Wall and Grid)
        const thumbBlob = await resizeImageToBlob(
          img,
          origWidth,
          origHeight,
          UPLOAD_CONFIG.THUMBNAIL_MAX_DIMENSION,
          UPLOAD_CONFIG.THUMBNAIL_QUALITY
        )

        // 2. Generate Preview (~1600px for Lightbox Gallery)
        const previewBlob = await resizeImageToBlob(
          img,
          origWidth,
          origHeight,
          UPLOAD_CONFIG.PREVIEW_MAX_DIMENSION,
          UPLOAD_CONFIG.PREVIEW_QUALITY
        )

        URL.revokeObjectURL(url)
        resolve({
          thumbnailBlob: thumbBlob,
          previewBlob: previewBlob,
          width: origWidth,
          height: origHeight,
        })
      } catch (err) {
        console.warn('Failed to generate image derivatives:', err)
        URL.revokeObjectURL(url)
        resolve({
          thumbnailBlob: null,
          previewBlob: null,
          width: origWidth,
          height: origHeight,
        })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        thumbnailBlob: null,
        previewBlob: null,
        width: null,
        height: null,
      })
    }

    img.src = url
  })
}

function resizeImageToBlob(
  img: HTMLImageElement,
  origWidth: number,
  origHeight: number,
  maxDimension: number,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    let width = origWidth
    let height = origHeight

    if (width > height && width > maxDimension) {
      height = Math.round((height * maxDimension) / width)
      width = maxDimension
    } else if (height > maxDimension) {
      width = Math.round((width * maxDimension) / height)
      height = maxDimension
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      return resolve(null)
    }

    // High quality downscaling
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)

    canvas.toBlob(
      (blob) => {
        resolve(blob)
      },
      'image/webp',
      quality
    )
  })
}
