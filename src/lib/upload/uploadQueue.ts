// Central Upload Queue Manager for Ekthau
// Provides offline/online resilience, adaptive concurrency, progress tracking, and idempotent DB registration.

import { UPLOAD_CONFIG, shouldUseMultipart, getBackoffDelay } from './uploadConfig'
import { generateDerivatives } from './derivatives'
import {
  saveQueueItemToStorage,
  getAllStoredQueueItems,
  removeQueueItemFromStorage,
  SerializedQueueItem,
} from './uploadStorage'
import { executeSingleUpload } from './singleUpload'
import { executeMultipartUpload } from './multipartUpload'
import { generateContentHash } from '../media'
import { supabase } from '../supabase'
import { MOCK_MODE } from '../mockData'

export type UploadItemStatus =
  | 'queued'
  | 'uploading'
  | 'paused'
  | 'retrying'
  | 'uploaded'
  | 'registering'
  | 'completed'
  | 'failed'

export interface UploadQueueItem {
  id: string
  eventId: string
  file: File
  type: 'photo' | 'video'
  status: UploadItemStatus
  progress: number
  attemptCount: number
  errorMessage?: string
  mediaId?: string
  storagePath?: string
  thumbnailPath?: string
  previewPath?: string
  isMultipart: boolean
  uploadId?: string
  createdAt: string
}

type QueueListener = (items: UploadQueueItem[]) => void

class UploadQueueManager {
  private items: UploadQueueItem[] = []
  private listeners: Set<QueueListener> = new Set()
  private activeUploadsCount = 0
  private isOnline = typeof window !== 'undefined' ? navigator.onLine : true
  private processingLoopActive = false
  private currentSession: { eventId: string; sessionTokenHash: string } | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
      this.initFromStorage()
    }
  }

  public setSession(eventId: string, sessionTokenHash: string) {
    this.currentSession = { eventId, sessionTokenHash }
    this.processQueue()
  }

  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener)
    listener([...this.items])
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const snapshot = [...this.items]
    this.listeners.forEach((listener) => listener(snapshot))
  }

  private handleOnline = () => {
    this.isOnline = true
    // Unpause any paused items and resume loop
    this.items = this.items.map((item) =>
      item.status === 'paused' ? { ...item, status: 'queued' } : item
    )
    this.notify()
    this.processQueue()
  }

  private handleOffline = () => {
    this.isOnline = false
    // Mark actively uploading items as paused
    this.items = this.items.map((item) =>
      item.status === 'uploading' || item.status === 'retrying'
        ? { ...item, status: 'paused', errorMessage: 'Waiting for network connection' }
        : item
    )
    this.notify()
  }

  // Hydrate persistent state from IndexedDB
  private async initFromStorage() {
    try {
      const stored = await getAllStoredQueueItems()
      if (stored && stored.length > 0) {
        const restored: UploadQueueItem[] = stored.map((s) => ({
          id: s.id,
          eventId: s.eventId,
          file: new File([s.buffer], s.filename, { type: s.mimeType }),
          type: s.type,
          status: s.status === 'uploading' ? 'queued' : s.status,
          progress: s.progress || 0,
          attemptCount: s.attemptCount || 0,
          errorMessage: s.errorMessage,
          mediaId: s.mediaId,
          storagePath: s.storagePath,
          thumbnailPath: s.thumbnailPath,
          previewPath: s.previewPath,
          isMultipart: s.isMultipart,
          uploadId: s.uploadId,
          createdAt: s.createdAt,
        }))

        this.items = restored
        this.notify()
        this.processQueue()
      }
    } catch (err) {
      console.warn('Failed to restore upload queue from storage', err)
    }
  }

  // Determine max concurrent uploads based on network condition
  private getMaxConcurrency(): number {
    if (typeof window !== 'undefined' && (navigator as any).connection) {
      const conn = (navigator as any).connection
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData) {
        return UPLOAD_CONFIG.MAX_CONCURRENT_UPLOADS_SLOW
      }
    }
    return UPLOAD_CONFIG.MAX_CONCURRENT_UPLOADS_FAST
  }

  // Add captured or selected file to queue
  public async addFile(file: File, type: 'photo' | 'video', eventId: string): Promise<string> {
    const id = crypto.randomUUID()
    const isMultipart = shouldUseMultipart(file.size)

    const item: UploadQueueItem = {
      id,
      eventId,
      file,
      type,
      status: this.isOnline ? 'queued' : 'paused',
      progress: 0,
      attemptCount: 0,
      isMultipart,
      createdAt: new Date().toISOString(),
    }

    this.items = [item, ...this.items]
    this.notify()

    // Persist buffer to IndexedDB immediately
    if (typeof window !== 'undefined') {
      try {
        const buffer = await file.arrayBuffer()
        await saveQueueItemToStorage({
          id,
          eventId,
          filename: file.name,
          mimeType: file.type || (type === 'video' ? 'video/mp4' : 'image/jpeg'),
          sizeBytes: file.size,
          type,
          createdAt: item.createdAt,
          status: item.status,
          progress: 0,
          attemptCount: 0,
          buffer,
          isMultipart,
        })
      } catch (err) {
        console.warn('Failed to persist file in IndexedDB:', err)
      }
    }

    this.processQueue()
    return id
  }

  public retryFailed(id: string) {
    this.items = this.items.map((i) =>
      i.id === id ? { ...i, status: 'queued', progress: 0, attemptCount: 0, errorMessage: undefined } : i
    )
    this.notify()
    this.processQueue()
  }

  public retryAllFailed() {
    this.items = this.items.map((i) =>
      i.status === 'failed'
        ? { ...i, status: 'queued', progress: 0, attemptCount: 0, errorMessage: undefined }
        : i
    )
    this.notify()
    this.processQueue()
  }

  public async removeItem(id: string) {
    this.items = this.items.filter((i) => i.id !== id)
    await removeQueueItemFromStorage(id)
    this.notify()
  }

  // Queue Processing Worker Loop
  private async processQueue() {
    if (!this.isOnline || !this.currentSession || this.processingLoopActive) return
    this.processingLoopActive = true

    try {
      const maxConcurrency = this.getMaxConcurrency()

      while (this.activeUploadsCount < maxConcurrency) {
        const nextItem = this.items.find((i) => i.status === 'queued')
        if (!nextItem) break

        this.activeUploadsCount++
        this.uploadItem(nextItem).finally(() => {
          this.activeUploadsCount--
          this.processQueue()
        })
      }
    } finally {
      this.processingLoopActive = false
    }
  }

  private async uploadItem(item: UploadQueueItem) {
    if (!this.currentSession || !this.isOnline) {
      item.status = 'paused'
      this.notify()
      return
    }

    const { eventId, sessionTokenHash } = this.currentSession

    // 1. Set status to uploading
    this.updateItem(item.id, { status: 'uploading', progress: 5 })

    try {
      if (MOCK_MODE) {
        // Mock Mode Upload simulation
        for (let p = 10; p <= 100; p += 20) {
          await new Promise((r) => setTimeout(r, 150))
          this.updateItem(item.id, { progress: p })
        }
        this.updateItem(item.id, { status: 'completed', progress: 100 })
        await removeQueueItemFromStorage(item.id)
        return
      }

      // 2. Generate Content Hash
      const contentHash = await generateContentHash(item.file)

      // 3. Generate Derivatives (without modifying original)
      let derivatives = { thumbnailBlob: null as Blob | null, previewBlob: null as Blob | null, width: null as number | null, height: null as number | null }
      if (item.type === 'photo') {
        derivatives = await generateDerivatives(item.file)
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/upload-url`

      let uploadResult: { mediaId: string; storagePath: string; thumbnailPath?: string; previewPath?: string }

      // 4. Perform Single PUT (<10MB) or Resumable Multipart (>=10MB)
      if (!item.isMultipart) {
        uploadResult = await executeSingleUpload({
          originalFile: item.file,
          thumbnailBlob: derivatives.thumbnailBlob,
          previewBlob: derivatives.previewBlob,
          eventId,
          sessionTokenHash,
          edgeFunctionUrl,
          anonKey,
          onProgress: (percent) => {
            this.updateItem(item.id, { progress: Math.min(90, Math.max(5, percent)) })
          },
        })
      } else {
        uploadResult = await executeMultipartUpload({
          file: item.file,
          eventId,
          sessionTokenHash,
          edgeFunctionUrl,
          anonKey,
          existingUploadId: item.uploadId,
          existingStoragePath: item.storagePath,
          onProgress: (percent) => {
            this.updateItem(item.id, { progress: Math.min(90, Math.max(5, percent)) })
          },
        })
      }

      // 5. Update Status to Registering in DB
      this.updateItem(item.id, {
        status: 'registering',
        progress: 95,
        mediaId: uploadResult.mediaId,
        storagePath: uploadResult.storagePath,
        thumbnailPath: uploadResult.thumbnailPath,
        previewPath: uploadResult.previewPath,
      })

      // 6. Register Media via Idempotent RPC (with retry loop for DB connection hiccups)
      let registered = false
      let regError = null

      for (let attempt = 0; attempt < UPLOAD_CONFIG.MAX_RETRIES; attempt++) {
        try {
          const { error: rpcError } = await supabase.rpc('record_uploaded_media', {
            p_event_id: eventId,
            p_session_token_hash: sessionTokenHash,
            p_storage_path: uploadResult.storagePath,
            p_mime_type: item.file.type || (item.type === 'video' ? 'video/mp4' : 'image/jpeg'),
            p_size_bytes: item.file.size,
            p_width: derivatives.width || null,
            p_height: derivatives.height || null,
            p_content_hash: contentHash,
            p_media_id: uploadResult.mediaId,
            p_thumbnail_path: uploadResult.thumbnailPath || null,
            p_preview_path: uploadResult.previewPath || null,
          })

          if (!rpcError) {
            registered = true
            break
          }
          regError = rpcError
        } catch (e: any) {
          regError = e
        }
        await new Promise((r) => setTimeout(r, getBackoffDelay(attempt)))
      }

      if (!registered) {
        throw new Error(regError?.message || 'Database registration failed after upload')
      }

      // 7. Mark Completed & Remove from IndexedDB safely
      this.updateItem(item.id, { status: 'completed', progress: 100 })
      await removeQueueItemFromStorage(item.id)
    } catch (err: any) {
      console.error(`Upload error for item ${item.id}:`, err)
      const attempt = (item.attemptCount || 0) + 1
      const isTransient = this.isOnline && attempt < UPLOAD_CONFIG.MAX_RETRIES

      this.updateItem(item.id, {
        status: isTransient ? 'retrying' : 'failed',
        attemptCount: attempt,
        errorMessage: err?.message || 'Upload failed',
      })

      if (isTransient) {
        setTimeout(() => {
          this.updateItem(item.id, { status: 'queued' })
          this.processQueue()
        }, getBackoffDelay(attempt))
      }
    }
  }

  private updateItem(id: string, updates: Partial<UploadQueueItem>) {
    this.items = this.items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    this.notify()
  }

  public getStats() {
    const total = this.items.length
    const pending = this.items.filter((i) => i.status === 'queued' || i.status === 'uploading' || i.status === 'registering').length
    const completed = this.items.filter((i) => i.status === 'completed').length
    const failed = this.items.filter((i) => i.status === 'failed').length
    const paused = this.items.filter((i) => i.status === 'paused').length

    return { total, pending, completed, failed, paused, isOnline: this.isOnline }
  }
}

// Global Singleton
export const uploadQueueManager = new UploadQueueManager()
