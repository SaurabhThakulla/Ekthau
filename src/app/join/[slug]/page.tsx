'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useGuest } from '@/features/guest/GuestContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, QrCode, Sparkles, AlertCircle } from 'lucide-react'
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
  const rawSlug = params?.slug as string
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim() : ''
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
        let data: any = null

        // 1. Try Supabase RPC if not in pure mock mode
        if (!MOCK_MODE) {
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
              'get_public_event_info',
              { p_slug: slug }
            )
            if (!rpcError && rpcData) {
              data = rpcData
            }
          } catch (e) {
            console.warn('RPC get_public_event_info error, trying table query:', e)
          }

          // 2. If RPC failed or returned nothing, try direct query
          if (!data) {
            try {
              const { data: tableData, error: tableError } = await supabase
                .from('events')
                .select('id, name, event_date, location, cover_image_path, public_slug')
                .eq('public_slug', slug)
                .maybeSingle()

              if (!tableError && tableData) {
                data = {
                  ...tableData,
                  allow_anonymous: true,
                }
              }
            } catch (e) {
              console.warn('Table query error:', e)
            }
          }
        }

        // 3. Match against mockEvents or dynamic fallback
        if (!data) {
          const matchedMock = mockEvents.find(
            (e) =>
              e.public_slug.toLowerCase() === slug.toLowerCase() ||
              e.id === slug
          )
          if (matchedMock) {
            data = matchedMock
          } else if (MOCK_MODE || slug.length > 0) {
            // Dynamic fallback event for testing
            data = {
              id: 'evt_' + slug,
              name: slug
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()),
              event_date: new Date().toISOString().split('T')[0],
              location: 'Live Event Space',
              public_slug: slug,
              allow_anonymous: true,
              cover_image_path: null,
            }
          }
        }

        if (!data) {
          throw new Error('Event not found or has expired.')
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

      // Default fallback guest session
      const fallbackSession = {
        session_id: 'session_' + crypto.randomUUID(),
        event_id: eventInfo.id,
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        session_token_hash: sessionTokenHash,
      }

      if (!MOCK_MODE) {
        try {
          const { data, error: rpcError } = await supabase.rpc('join_event', {
            p_slug: slug,
            p_display_name: finalName,
            p_device_id: deviceId,
            p_session_token_hash: sessionTokenHash,
          })

          if (!rpcError && data) {
            setSession({
              session_id: data.session_id,
              event_id: data.event_id,
              expires_at: data.expires_at,
              session_token_hash: sessionTokenHash,
            })
            router.replace(`/e/${slug}/camera`)
            return
          }
        } catch (e) {
          console.warn('join_event RPC error, proceeding with client session:', e)
        }
      }

      // If in mock mode or RPC fallback
      setSession(fallbackSession)
      router.replace(`/e/${slug}/camera`)
    } catch (err: any) {
      console.error('Join error:', err)
      setError(err?.message || 'Failed to join event')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-3 bg-background">
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
