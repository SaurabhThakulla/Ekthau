// IndexedDB storage manager for queue persistence across page reloads, browser crashes, and offline periods

import { get, set, del } from 'idb-keyval'
import { UPLOAD_CONFIG } from './uploadConfig'

export interface SerializedPart {
  partNumber: number
  eTag: string
}

export interface SerializedQueueItem {
  id: string
  eventId: string
  filename: string
  mimeType: string
  sizeBytes: number
  type: 'photo' | 'video'
  createdAt: string
  status:
    | 'queued'
    | 'uploading'
    | 'paused'
    | 'retrying'
    | 'uploaded'
    | 'registering'
    | 'completed'
    | 'failed'
  progress: number // 0 to 100
  attemptCount: number
  errorMessage?: string
  buffer: ArrayBuffer // Raw untouched original file bytes
  contentHash?: string
  mediaId?: string
  storagePath?: string
  thumbnailPath?: string
  previewPath?: string
  // Multipart state
  isMultipart: boolean
  uploadId?: string
  completedParts?: SerializedPart[]
  totalParts?: number
}

const STORE_KEY = UPLOAD_CONFIG.INDEXED_DB_STORE_KEY

export async function saveQueueItemToStorage(
  item: SerializedQueueItem
): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const existing = (await get<SerializedQueueItem[]>(STORE_KEY)) || []
    const index = existing.findIndex((e) => e.id === item.id)
    if (index >= 0) {
      existing[index] = item
    } else {
      existing.push(item)
    }
    await set(STORE_KEY, existing)
  } catch (err) {
    console.warn('IndexedDB save failed:', err)
  }
}

export async function getAllStoredQueueItems(): Promise<SerializedQueueItem[]> {
  if (typeof window === 'undefined') return []
  try {
    return (await get<SerializedQueueItem[]>(STORE_KEY)) || []
  } catch (err) {
    console.warn('IndexedDB read failed:', err)
    return []
  }
}

export async function removeQueueItemFromStorage(id: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const existing = (await get<SerializedQueueItem[]>(STORE_KEY)) || []
    const filtered = existing.filter((e) => e.id !== id)
    await set(STORE_KEY, filtered)
  } catch (err) {
    console.warn('IndexedDB delete failed:', err)
  }
}

export async function clearAllStoredQueueItems(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    await del(STORE_KEY)
  } catch (err) {
    console.warn('IndexedDB clear failed:', err)
  }
}
