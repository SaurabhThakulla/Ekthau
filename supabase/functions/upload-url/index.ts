// Supabase Edge Function: upload-url
// Manages Direct-to-R2 Presigned Single PUTs and S3-Compatible Resumable Multipart Uploads
// @ts-nocheck - Deno Edge Runtime Environment

import {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "npm:@aws-sdk/client-s3@3.540.0"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.540.0"
import { createClient } from "npm:@supabase/supabase-js@2.42.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
])

const MAX_IMAGE_SIZE = 25 * 1024 * 1024 // 25 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB

function getR2Client() {
  const accountId = Deno.env.get('R2_ACCOUNT_ID') || ''
  const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID') || ''
  const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY') || ''

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

Deno.serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const {
      action = 'single-put',
      event_id,
      filename,
      content_type,
      size_bytes,
      session_token_hash,
      // Multipart specific parameters
      upload_id,
      storage_path,
      part_number,
      parts,
    } = body

    if (!event_id || !session_token_hash) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: event_id, session_token_hash' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Verify Guest Session & Event Expiration
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sessionData, error: sessionError } = await supabase
      .from('guest_sessions')
      .select('id, expires_at, events ( id, status, expires_at )')
      .eq('event_id', event_id)
      .eq('session_token_hash', session_token_hash)
      .maybeSingle()

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or unauthorized guest session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new Date(sessionData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Guest session or event has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Validate MIME type & file sizes (for new uploads)
    if (content_type && !ALLOWED_MIME_TYPES.has(content_type)) {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: ${content_type}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (size_bytes) {
      const isVideo = content_type?.startsWith('video/')
      const maxAllowed = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
      if (size_bytes > maxAllowed) {
        return new Response(
          JSON.stringify({ error: `File exceeds maximum allowed size (${maxAllowed / 1024 / 1024} MB)` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const bucketName = Deno.env.get('R2_BUCKET_NAME') || 'ekthau-media'
    const S3 = getR2Client()

    // 3. ACTION ROUTER

    // A. Single Presigned PUT (Original + Optional Derivatives)
    if (action === 'single-put') {
      const fileExt = (filename || 'capture.jpg').split('.').pop() || 'jpg'
      const uniqueId = crypto.randomUUID()
      const originalPath = `events/${event_id}/media/${uniqueId}/original.${fileExt}`
      const thumbnailPath = `events/${event_id}/media/${uniqueId}/thumbnail.webp`
      const previewPath = `events/${event_id}/media/${uniqueId}/preview.webp`

      // 15-minute validity
      const originalCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: originalPath,
        ContentType: content_type || 'image/jpeg',
      })
      const originalSignedUrl = await getSignedUrl(S3, originalCommand, { expiresIn: 900 })

      // Signed URLs for derivatives if image
      let thumbnailSignedUrl = null
      let previewSignedUrl = null

      if (content_type?.startsWith('image/')) {
        const thumbCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: thumbnailPath,
          ContentType: 'image/webp',
        })
        thumbnailSignedUrl = await getSignedUrl(S3, thumbCommand, { expiresIn: 900 })

        const previewCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: previewPath,
          ContentType: 'image/webp',
        })
        previewSignedUrl = await getSignedUrl(S3, previewCommand, { expiresIn: 900 })
      }

      return new Response(
        JSON.stringify({
          mediaId: uniqueId,
          original: {
            signedUrl: originalSignedUrl,
            storagePath: originalPath,
          },
          thumbnail: thumbnailSignedUrl
            ? { signedUrl: thumbnailSignedUrl, storagePath: thumbnailPath }
            : null,
          preview: previewSignedUrl
            ? { signedUrl: previewSignedUrl, storagePath: previewPath }
            : null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // B. Initiate Resumable Multipart Upload
    if (action === 'initiate-multipart') {
      const fileExt = (filename || 'capture.mp4').split('.').pop() || 'mp4'
      const uniqueId = crypto.randomUUID()
      const originalPath = `events/${event_id}/media/${uniqueId}/original.${fileExt}`

      const createCommand = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: originalPath,
        ContentType: content_type || 'application/octet-stream',
      })
      const createResponse = await S3.send(createCommand)

      return new Response(
        JSON.stringify({
          mediaId: uniqueId,
          uploadId: createResponse.UploadId,
          storagePath: originalPath,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // C. Get Presigned URL for Specific Part
    if (action === 'get-part-url') {
      if (!upload_id || !storage_path || !part_number) {
        return new Response(
          JSON.stringify({ error: 'Missing upload_id, storage_path, or part_number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Ensure storage_path belongs to this event
      if (!storage_path.startsWith(`events/${event_id}/`)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized storage path for event' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const uploadPartCommand = new UploadPartCommand({
        Bucket: bucketName,
        Key: storage_path,
        UploadId: upload_id,
        PartNumber: Number(part_number),
      })
      // 15-minute lease per part
      const partSignedUrl = await getSignedUrl(S3, uploadPartCommand, { expiresIn: 900 })

      return new Response(
        JSON.stringify({ partSignedUrl, partNumber: Number(part_number) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // D. Complete Multipart Upload
    if (action === 'complete-multipart') {
      if (!upload_id || !storage_path || !Array.isArray(parts) || parts.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Missing upload_id, storage_path, or parts manifest' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!storage_path.startsWith(`events/${event_id}/`)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized storage path for event' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // S3 requires parts to be sorted in ascending order by PartNumber
      const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber)

      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: storage_path,
        UploadId: upload_id,
        MultipartUpload: {
          Parts: sortedParts,
        },
      })
      const completeResponse = await S3.send(completeCommand)

      return new Response(
        JSON.stringify({
          success: true,
          location: completeResponse.Location,
          storagePath: storage_path,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // E. Abort Multipart Upload (on cancellation or cleanup)
    if (action === 'abort-multipart') {
      if (upload_id && storage_path && storage_path.startsWith(`events/${event_id}/`)) {
        const abortCommand = new AbortMultipartUploadCommand({
          Bucket: bucketName,
          Key: storage_path,
          UploadId: upload_id,
        })
        await S3.send(abortCommand).catch(() => {})
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Upload URL execution error:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
