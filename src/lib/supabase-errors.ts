import type { PostgrestError } from '@supabase/supabase-js'

/**
 * PostgREST error codes that mean "the database schema this app expects is not
 * deployed" rather than "the request failed". Reporting these as connection
 * problems sends people to check their Wi-Fi when the real fix is running the
 * migrations in `supabase/migrations`.
 */
const SCHEMA_MISSING_CODES = new Set([
  'PGRST202', // function not found in schema cache
  'PGRST205', // table not found in schema cache
  '42P01', // undefined_table
  '42883', // undefined_function
])

/** PostgREST returns this when `.single()` matched no rows. */
const NO_ROWS_CODE = 'PGRST116'

export function isSchemaMissing(error: PostgrestError | null | undefined): boolean {
  if (!error) return false
  return (
    SCHEMA_MISSING_CODES.has(error.code) ||
    /schema cache|does not exist/i.test(error.message)
  )
}

export function isNoRows(error: PostgrestError | null | undefined): boolean {
  if (!error) return false
  return error.code === NO_ROWS_CODE
}

/** The RPCs signal a missing or closed event by raising with these words. */
export function isEventMissing(error: PostgrestError | null | undefined): boolean {
  if (!error) return false
  return /event not found|expired/i.test(error.message)
}

/**
 * Turns a Postgrest error into something a host or guest can act on, without
 * leaking raw database text into the interface.
 */
export function describeSupabaseError(
  error: PostgrestError | null | undefined,
  fallback: string
): string {
  if (!error) return fallback

  if (isSchemaMissing(error)) {
    return 'This Ekthau instance is not finished setting up — its database tables are missing. If you are the site owner, apply the migrations in supabase/migrations.'
  }
  if (/jwt|not authorized|permission denied|rls/i.test(error.message)) {
    return 'You do not have permission to view this. Try signing in again.'
  }
  if (/fetch|network|failed to fetch/i.test(error.message)) {
    return 'We could not reach the server. Check your connection and try again.'
  }
  return error.message || fallback
}
