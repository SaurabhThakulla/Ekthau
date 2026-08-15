'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useGuest } from '@/features/guest/GuestContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

async function generateSessionHash() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const token = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')
  return token
}

export default function JoinEventPage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const { getEventSession, setSession } = useGuest()

  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [eventInfo, setEventInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    async function loadEvent() {
      if (!slug) return

      try {
        let data: any

        if (MOCK_MODE) {
          data =
            mockEvents.find((e) => e.public_slug === slug) || mockEvents[0]
        } else {
          const { data: rpcData, error } = await supabase.rpc(
            'get_public_event_info',
            { p_slug: slug }
          )
          if (error) throw error
          data = rpcData
        }

        setEventInfo(data)

        // Check if we already have a valid session for this event
        const existingSession = getEventSession(data.id)
        if (existingSession) {
          setSession(existingSession)
          router.replace(`/e/${slug}/camera`)
          return
        }
      } catch (err: any) {
        setError(err?.message || 'Event not found')
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [slug, getEventSession, router, setSession])

  const handleJoin = async (isAnonymous: boolean) => {
    if (!eventInfo || !slug) return
    setJoining(true)
    setError(null)

    try {
      const sessionTokenHash = await generateSessionHash()
      const deviceId =
        (typeof window !== 'undefined' &&
          localStorage.getItem('ekthau_device_id')) ||
        crypto.randomUUID()
      if (typeof window !== 'undefined') {
        localStorage.setItem('ekthau_device_id', deviceId)
      }

      const finalName = isAnonymous ? 'Guest' : displayName || 'Guest'

      if (MOCK_MODE) {
        setSession({
          session_id: 'mock-session-123',
          event_id: eventInfo.id,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          session_token_hash: sessionTokenHash,
        })
        router.replace(`/e/${slug}/camera`)
        return
      }

      const { data, error } = await supabase.rpc('join_event', {
        p_slug: slug,
        p_display_name: finalName,
        p_device_id: deviceId,
        p_session_token_hash: sessionTokenHash,
      })

      if (error) throw error

      setSession({
        session_id: data.session_id,
        event_id: data.event_id,
        expires_at: data.expires_at,
        session_token_hash: sessionTokenHash,
      })

      router.replace(`/e/${slug}/camera`)
    } catch (err: any) {
      setError(err?.message || 'Failed to join event')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !eventInfo) {
    return (
      <div className="flex h-screen items-center justify-center p-4 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Oops</h1>
          <p className="text-muted-foreground">
            {error || 'Event not found or has expired.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center p-6 bg-gray-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm mt-8 space-y-8">
        <div className="text-center space-y-3">
          {eventInfo.cover_image_path ? (
            <div className="w-full h-48 rounded-2xl bg-gray-200 overflow-hidden mb-6">
              <img
                src={eventInfo.cover_image_path}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
              <span className="text-3xl font-bold text-primary">
                {eventInfo.name?.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{eventInfo.name}</h1>
          <p className="text-muted-foreground">
            {new Date(eventInfo.event_date).toLocaleDateString()}{' '}
            {eventInfo.location && `• ${eventInfo.location}`}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                What should we call you?
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            <Button
              className="w-full h-12 text-base font-semibold rounded-xl"
              onClick={() => handleJoin(false)}
              disabled={
                joining || (!displayName.trim() && !eventInfo.allow_anonymous)
              }
            >
              {joining && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Continue
            </Button>

            {eventInfo.allow_anonymous && (
              <Button
                variant="ghost"
                className="w-full h-12 text-base font-medium"
                onClick={() => handleJoin(true)}
                disabled={joining}
              >
                Continue as guest
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
