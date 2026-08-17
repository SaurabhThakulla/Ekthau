'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export interface GuestSession {
  session_id: string
  event_id: string
  /** The public slug the guest joined through — the camera and gallery routes
   *  only know the slug, so it has to be part of the stored record. */
  event_slug: string
  event_name?: string
  display_name?: string
  expires_at: string
  session_token_hash: string
}

interface GuestContextValue {
  session: GuestSession | null
  /** False until localStorage has been read, so screens can show a spinner
   *  instead of briefly claiming the guest has not joined. */
  ready: boolean
  setSession: (session: GuestSession | null) => void
  getSessionForSlug: (slug: string) => GuestSession | null
  clearSession: (slug?: string) => void
}

const STORAGE_PREFIX = 'ekthau_guest_'

const GuestContext = createContext<GuestContextValue>({
  session: null,
  ready: false,
  setSession: () => {},
  getSessionForSlug: () => null,
  clearSession: () => {},
})

function readStoredSession(slug: string): GuestSession | null {
  if (typeof window === 'undefined' || !slug) return null
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${slug}`)
    if (!raw) return null

    const parsed = JSON.parse(raw) as GuestSession
    if (!parsed?.event_id || !parsed?.session_token_hash) return null

    if (parsed.expires_at && new Date(parsed.expires_at) < new Date()) {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${slug}`)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const GuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSessionState] = useState<GuestSession | null>(null)
  const [ready, setReady] = useState(false)

  /**
   * Restore the session for whichever event slug is in the URL. Without this
   * the in-memory session was lost on every reload, and the camera and gallery
   * screens permanently showed "please join the celebration first" even though
   * a valid session was sitting in localStorage.
   */
  useEffect(() => {
    const match = /^\/(?:e|join)\/([^/]+)/.exec(window.location.pathname)
    const slug = match ? decodeURIComponent(match[1]) : null
    if (slug) setSessionState(readStoredSession(slug))
    setReady(true)
  }, [])

  const setSession = useCallback((next: GuestSession | null) => {
    setSessionState(next)
    if (typeof window === 'undefined') return
    try {
      if (next?.event_slug) {
        window.localStorage.setItem(
          `${STORAGE_PREFIX}${next.event_slug}`,
          JSON.stringify(next)
        )
      }
    } catch {
      // Private-mode Safari throws on write; the in-memory session still works
      // for the current page view.
    }
  }, [])

  const getSessionForSlug = useCallback((slug: string) => readStoredSession(slug), [])

  const clearSession = useCallback((slug?: string) => {
    setSessionState(null)
    if (typeof window === 'undefined') return
    try {
      const key = slug ?? session?.event_slug
      if (key) window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
    } catch {
      // Nothing else to do — the state is already cleared.
    }
  }, [session?.event_slug])

  const value = useMemo(
    () => ({ session, ready, setSession, getSessionForSlug, clearSession }),
    [session, ready, setSession, getSessionForSlug, clearSession]
  )

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
}

export const useGuest = () => useContext(GuestContext)
