import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

import { MOCK_MODE, mockSession } from '@/lib/mockData'

interface AuthContextType {
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
  forceMockLogin?: () => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (MOCK_MODE) {
      setSession(mockSession as any)
      setUser(mockSession.user as any)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signOut = async () => {
    if (MOCK_MODE) {
      setSession(null)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  const forceMockLogin = () => {
    setSession(mockSession as any)
    setUser(mockSession.user as any)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ session, user, signOut, forceMockLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
