import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'

import { MOCK_MODE, mockEvents } from '@/lib/mockData'

export default function CreateEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    event_type: 'Wedding',
    event_date: '',
    location: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    if (MOCK_MODE) {
      setTimeout(() => {
        navigate(`/dashboard/events/${mockEvents[0].id}`)
      }, 500)
      return
    }

    // Generate unguessable slug
    const slugBytes = new Uint8Array(8)
    crypto.getRandomValues(slugBytes)
    const public_slug = Array.from(slugBytes).map(b => b.toString(16).padStart(2, '0')).join('')

    // Expires in 30 days by default for MVP
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data, error: insertError } = await supabase
      .from('events')
      .insert({
        owner_id: user.id,
        name: formData.name,
        event_type: formData.event_type,
        event_date: formData.event_date,
        location: formData.location,
        public_slug,
        expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Insert default settings
    await supabase.from('event_settings').insert({
      event_id: data.id
    })

    navigate(`/dashboard/events/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new private space for your guests to share photos and videos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card border rounded-lg p-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Event Name</Label>
          <Input 
            id="name" 
            placeholder="e.g. Sita & Ramesh Wedding"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <select 
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.event_type}
              onChange={(e) => setFormData({...formData, event_type: e.target.value})}
              disabled={loading}
            >
              <option value="Wedding">Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Engagement">Engagement</option>
              <option value="Corporate">Corporate</option>
              <option value="College">College</option>
              <option value="Party">Party</option>
              <option value="Family">Family</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Event Date</Label>
            <Input 
              id="date" 
              type="date"
              required
              value={formData.event_date}
              onChange={(e) => setFormData({...formData, event_date: e.target.value})}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (Optional)</Label>
          <Input 
            id="location" 
            placeholder="e.g. Yak & Yeti, Kathmandu"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            disabled={loading}
          />
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Event
          </Button>
        </div>
      </form>
    </div>
  )
}
