import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar, MapPin, Plus } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'

import { MOCK_MODE, mockEvents } from '@/lib/mockData'

interface Event {
  id: string
  name: string
  event_date: string
  location: string
  status: string
}

export default function Overview() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      if (!user) return
      
      if (MOCK_MODE) {
        setEvents(mockEvents)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('events')
        .select('id, name, event_date, location, status')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    }
    loadEvents()
  }, [user])

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Events</h1>
      </div>

      {events.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 text-center flex flex-col items-center">
          <h3 className="text-lg font-semibold">No events yet</h3>
          <p className="text-muted-foreground mt-2 mb-6 text-sm">
            Create your first event to start collecting photos and videos.
          </p>
          <Button asChild>
            <Link to="/dashboard/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} to={`/dashboard/events/${event.id}`}>
              <div className="border rounded-lg p-5 hover:border-primary transition-colors hover:shadow-sm bg-card group cursor-pointer h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{event.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${event.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800'}`}>
                    {event.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
