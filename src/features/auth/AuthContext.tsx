'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, mockSession } from '@/lib/mockData'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  /** Set when the initial session lookup failed (offline, bad keys, outage). */
  error: string | null
  signOut: () => Promise<void>
  forceMockLogin?: () => void
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    if (MOCK_MODE) {
      setSession(mockSession as unknown as Session)
      setLoading(false)
      return
    }

    /**
     * The previous version had no rejection handler, so an unreachable Supabase
     * left `loading` true forever and the dashboard spun indefinitely. Failures
     * now resolve to a signed-out state with a message the UI can surface.
     */
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return
        if (sessionError) setError(sessionError.message)
        setSession(data.session)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(
          err instanceof Error
            ? err.message
            : 'Could not verify your session. Check your connection and try again.'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setError(null)
      setLoading(false)
    })

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (MOCK_MODE) {
      setSession(null)
      return
    }
    try {
      await supabase.auth.signOut()
    } catch {
      // Local state is cleared regardless so the user is not stuck signed in.
    }
    setSession(null)
  }, [])

  const forceMockLogin = useCallback(() => {
    setSession(mockSession as unknown as Session)
    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      error,
      signOut,
      forceMockLogin: MOCK_MODE ? forceMockLogin : undefined,
    }),
    [session, loading, error, signOut, forceMockLogin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
