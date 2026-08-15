// Supabase Edge Function: upload-url
// Generates presigned upload URLs for Cloudflare R2 / S3 storage
// @ts-nocheck - Deno Edge Runtime Environment

import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.540.0"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.540.0"
import { createClient } from "npm:@supabase/supabase-js@2.42.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event_id, filename, content_type, session_token_hash } = await req.json()

    if (!event_id || !filename || !content_type || !session_token_hash) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: event_id, filename, content_type, session_token_hash' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Verify Guest Session against Event in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sessionData, error: sessionError } = await supabase
      .from('guest_sessions')
      .select('id, expires_at')
      .eq('event_id', event_id)
      .eq('session_token_hash', session_token_hash)
      .maybeSingle()

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing guest session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new Date(sessionData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Event or guest session has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Initialize Cloudflare R2 / S3 Client
    const accountId = Deno.env.get('R2_ACCOUNT_ID') || ''
    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID') || ''
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY') || ''
    const bucketName = Deno.env.get('R2_BUCKET_NAME') || 'ekthau-media'

    const S3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    // 3. Generate unique storage key path
    const fileExt = filename.split('.').pop() || 'jpg'
    const uniqueId = crypto.randomUUID()
    const storagePath = `events/${event_id}/media/${uniqueId}/original.${fileExt}`

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: storagePath,
      ContentType: content_type,
    })

    // URL valid for 15 minutes (900 seconds)
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 900 })

    return new Response(
      JSON.stringify({
        signedUrl,
        storagePath,
        mediaId: uniqueId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Upload URL generation error:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
