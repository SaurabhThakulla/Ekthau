'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export interface GuestSession {
  session_id: string
  event_id: string
  expires_at: string
  session_token_hash: string
}

interface GuestContextType {
  session: GuestSession | null
  setSession: (session: GuestSession | null) => void
  getEventSession: (eventId: string) => GuestSession | null
}

const GuestContext = createContext<GuestContextType>({
  session: null,
  setSession: () => {},
  getEventSession: () => null,
})

export const GuestProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSessionState] = useState<GuestSession | null>(null)

  const setSession = (newSession: GuestSession | null) => {
    if (typeof window !== 'undefined') {
      if (newSession) {
        localStorage.setItem(
          `ekthau_guest_${newSession.event_id}`,
          JSON.stringify(newSession)
        )
      }
    }
    setSessionState(newSession)
  }

  const getEventSession = (eventId: string): GuestSession | null => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(`ekthau_guest_${eventId}`)
      if (!item) return null
      const parsed = JSON.parse(item)
      if (new Date(parsed.expires_at) < new Date()) {
        localStorage.removeItem(`ekthau_guest_${eventId}`)
        return null
      }
      return parsed
    } catch {
      return null
    }
  }

  return (
    <GuestContext.Provider value={{ session, setSession, getEventSession }}>
      {children}
    </GuestContext.Provider>
  )
}

export const useGuest = () => useContext(GuestContext)
