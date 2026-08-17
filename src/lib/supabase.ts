import { createClient } from '@supabase/supabase-js'

/**
 * Browser Supabase client. Only `NEXT_PUBLIC_*` values are read here — anything
 * else would be stripped from the client bundle and silently resolve to
 * undefined.
 *
 * A previous `createAdminClient()` helper lived in this file and read the
 * service-role key. It was never called, and shipping a service-role code path
 * in a module that client components import is a foot-gun, so it was removed.
 * Privileged work belongs in the Supabase edge functions under `supabase/`.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Not fatal: the app falls back to MOCK_MODE so the UI is still explorable.
  console.warn(
    'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect to a real project.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
