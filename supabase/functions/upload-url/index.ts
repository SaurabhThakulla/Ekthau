// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3"
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { event_id, filename, content_type, session_token_hash } = await req.json()

    if (!event_id || !filename || !content_type || !session_token_hash) {
      throw new Error('Missing required fields')
    }

    // Verify the guest session against the event
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sessionData, error: sessionError } = await supabase
      .from('guest_sessions')
      .select('id, expires_at')
      .eq('event_id', event_id)
      .eq('session_token_hash', session_token_hash)
      .single()

    if (sessionError || !sessionData) {
      throw new Error('Invalid guest session')
    }

    if (new Date(sessionData.expires_at) < new Date()) {
      throw new Error('Event or session has expired')
    }

    // Initialize R2 client
    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${Deno.env.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID') || '',
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY') || '',
      },
    })

    // Generate unique storage path
    const fileExt = filename.split('.').pop()
    const uniqueId = crypto.randomUUID()
    const storage_path = `events/${event_id}/media/${uniqueId}/original.${fileExt}`

    const bucketName = Deno.env.get('R2_BUCKET_NAME')

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: storage_path,
      ContentType: content_type,
    })

    // URL expires in 15 minutes
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 900 })

    return new Response(
      JSON.stringify({ 
        signedUrl, 
        storagePath: storage_path, 
        mediaId: uniqueId 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
