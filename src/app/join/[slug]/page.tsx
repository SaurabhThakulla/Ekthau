'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useGuest } from '@/features/guest/GuestContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, QrCode, Sparkles } from 'lucide-react'
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
            mockEvents.find((e) => e.public_slug.toLowerCase() === slug.toLowerCase()) ||
            mockEvents[0]
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
        setError(err?.message || 'Event not found or has expired.')
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
      <div className="flex flex-col h-screen items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Opening event space...</p>
      </div>
    )
  }

  if (error || !eventInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center bg-background">
        <div className="w-full max-w-sm space-y-5 bg-card border p-8 rounded-3xl shadow-lg">
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <QrCode className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Event Not Found</h1>
            <p className="text-sm text-muted-foreground">{error || 'This event link is invalid or has expired.'}</p>
          </div>
          <Button asChild className="w-full rounded-xl font-semibold">
            <Link href="/join">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Enter Code or Scan QR
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center p-6 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          {eventInfo.cover_image_path ? (
            <div className="w-full h-44 rounded-3xl bg-muted overflow-hidden shadow-md">
              <img
                src={eventInfo.cover_image_path}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl mx-auto flex items-center justify-center shadow-sm">
              <span className="text-3xl font-black">{eventInfo.name?.charAt(0)}</span>
            </div>
          )}

          <div className="space-y-1 pt-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{eventInfo.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {new Date(eventInfo.event_date).toLocaleDateString()} {eventInfo.location && `• ${eventInfo.location}`}
            </p>
          </div>
        </div>

        <div className="bg-card p-6 sm:p-7 rounded-3xl shadow-xl border space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                What should we call you?
              </Label>
              <Input
                id="name"
                placeholder="e.g. Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
                className="h-12 text-base rounded-2xl bg-background"
              />
            </div>

            <Button
              className="w-full h-12 text-base font-bold rounded-2xl shadow-md shadow-primary/20 hover:shadow-lg transition-all"
              onClick={() => handleJoin(false)}
              disabled={
                joining || (!displayName.trim() && !eventInfo.allow_anonymous)
              }
            >
              {joining && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Join Live Stream
            </Button>

            {eventInfo.allow_anonymous && (
              <Button
                variant="ghost"
                className="w-full h-11 text-sm font-semibold rounded-2xl"
                onClick={() => handleJoin(true)}
                disabled={joining}
              >
                Join as Anonymous Guest
              </Button>
            )}
          </div>
        </div>

        {/* Change event link */}
        <div className="text-center">
          <Link href="/join" className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4">
            Looking for a different event?
          </Link>
        </div>
      </div>
    </div>
  )
}
