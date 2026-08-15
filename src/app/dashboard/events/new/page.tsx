'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  Sparkles,
  Bot,
  Check,
  HardDrive,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    storage: '1 GB',
    price: 'Free',
    duration: '30 Days',
    guestLimit: 30,
    storageBytes: 1073741824,
    days: 30,
    ai: false,
  },
  {
    id: '5gb',
    name: 'Mini Event',
    storage: '5 GB',
    price: 'Rs. 99',
    duration: '60 Days',
    guestLimit: 100,
    storageBytes: 5368709120,
    days: 60,
    ai: false,
  },
  {
    id: '10gb',
    name: 'Celebration',
    storage: '10 GB',
    price: 'Rs. 499',
    duration: '90 Days (3 mo)',
    guestLimit: 250,
    storageBytes: 10737418240,
    days: 90,
    ai: false,
  },
  {
    id: '30gb',
    name: 'Grand Celebration',
    storage: '30 GB',
    price: 'Rs. 999',
    duration: '180 Days (6 mo)',
    guestLimit: 600,
    storageBytes: 32212254720,
    days: 180,
    ai: false,
    popular: true,
  },
  {
    id: '100gb',
    name: 'Mega Festival',
    storage: '100 GB',
    price: 'Rs. 1,999',
    duration: '1 Year (365 d)',
    guestLimit: 2000,
    storageBytes: 107374182400,
    days: 365,
    ai: true,
  },
  {
    id: '250gb',
    name: 'Royal Wedding & Multi-Day',
    storage: '250 GB',
    price: 'Rs. 4,999',
    duration: '2 Years',
    guestLimit: 10000,
    storageBytes: 268435456000,
    days: 730,
    ai: true,
  },
]

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('free')

  const [formData, setFormData] = useState({
    name: '',
    event_type: 'Wedding',
    event_date: '',
    location: '',
  })

  const currentPlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    if (MOCK_MODE) {
      setTimeout(() => {
        router.push(`/dashboard/events/${mockEvents[0].id}`)
      }, 500)
      return
    }

    // Generate unguessable slug
    const slugBytes = new Uint8Array(8)
    crypto.getRandomValues(slugBytes)
    const public_slug = Array.from(slugBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Set expiration based on plan
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + currentPlan.days)

    try {
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          owner_id: user.id,
          name: formData.name,
          event_type: formData.event_type,
          event_date: formData.event_date,
          location: formData.location,
          public_slug,
          plan: currentPlan.name,
          guest_limit: currentPlan.guestLimit,
          storage_limit_bytes: currentPlan.storageBytes,
          expires_at: expiresAt.toISOString(),
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
        event_id: data.id,
      })

      router.push(`/dashboard/events/${data.id}`)
    } catch (err: any) {
      setError(err?.message || 'Failed to create event')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Set up a private live gallery for your guests to share photos & videos.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-card border rounded-3xl p-6 sm:p-8 shadow-sm"
      >
        {error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl">
            {error}
          </div>
        )}

        {/* 1. Basic Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-base border-b pb-2">1. Event Information</h3>

          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              placeholder="e.g. Sita & Ramesh Wedding Celebration"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <select
                id="type"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.event_type}
                onChange={(e) =>
                  setFormData({ ...formData, event_type: e.target.value })
                }
                disabled={loading}
              >
                <option value="Wedding">Wedding & Reception</option>
                <option value="Birthday">Birthday Party</option>
                <option value="Engagement">Engagement & Ring Ceremony</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Corporate">Corporate Gala / Summit</option>
                <option value="College">College / Alumni Fest</option>
                <option value="Festival">Festival Celebration</option>
                <option value="Other">Other Gathering</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.event_date}
                onChange={(e) =>
                  setFormData({ ...formData, event_date: e.target.value })
                }
                disabled={loading}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Venue / Location (Optional)</Label>
            <Input
              id="location"
              placeholder="e.g. Yak & Yeti Grand Ballroom, Kathmandu"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              disabled={loading}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* 2. Choose Storage & Retention Plan */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-base">2. Choose Storage & Retention Plan</h3>
            <span className="text-xs text-primary font-semibold">
              Can be upgraded anytime
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{plan.name}</span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                    </span>
                  </div>

                  <div>
                    <span className="text-xl font-black">{plan.price}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({plan.storage})
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-muted-foreground border-t pt-2">
                    <div className="flex items-center gap-1 font-medium text-foreground">
                      <Clock className="h-3 w-3 text-primary" />
                      <span>{plan.duration} storage</span>
                    </div>
                    {plan.ai && (
                      <div className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                        <Bot className="h-3 w-3" />
                        <span>✨ AI Photo Scan</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={loading}
            className="rounded-xl h-11 px-5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl h-11 px-7 font-bold shadow-md shadow-primary/25"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Event...
              </>
            ) : (
              <>
                Launch Event Space
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
