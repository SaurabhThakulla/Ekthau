'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CalendarPicker from '@/components/ui/calendar-picker'
import CustomSelect, { SelectOption } from '@/components/ui/custom-select'
import {
  Loader2,
  Sparkles,
  Bot,
  Check,
  HardDrive,
  Clock,
  ArrowRight,
  MapPin,
  PartyPopper,
  Heart,
  Cake,
  Building,
  GraduationCap,
  Sparkle,
  Calendar,
  Layers,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { MOCK_MODE, mockEvents } from '@/lib/mockData'

const EVENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Wedding', label: 'Wedding & Reception', icon: <Heart className="h-4 w-4" />, description: 'Ceremony, reception, multi-day celebrations' },
  { value: 'Birthday', label: 'Birthday Party', icon: <Cake className="h-4 w-4" />, description: 'Milestone birthdays, kids bashes, brunches' },
  { value: 'Engagement', label: 'Engagement & Ring Ceremony', icon: <Sparkles className="h-4 w-4" />, description: 'Rooftop toasting, ring exchange' },
  { value: 'Anniversary', label: 'Anniversary Celebration', icon: <PartyPopper className="h-4 w-4" />, description: 'Golden jubilee, private family dinners' },
  { value: 'Corporate', label: 'Corporate Gala / Summit', icon: <Building className="h-4 w-4" />, description: 'Annual retreats, networking mixers' },
  { value: 'College', label: 'College / Alumni Fest', icon: <GraduationCap className="h-4 w-4" />, description: 'Graduation ceremonies, reunions' },
  { value: 'Festival', label: 'Festival Celebration', icon: <Sparkle className="h-4 w-4" />, description: 'Dashain, Tihar, Holi gatherings' },
  { value: 'Other', label: 'Other Gathering', icon: <Layers className="h-4 w-4" />, description: 'Private parties and meetups' },
]

const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    storage: '1 GB',
    price: 'Free',
    duration: '2 Days Backup',
    guestLimit: 30,
    storageBytes: 1073741824,
    days: 2,
    ai: false,
    description: 'Up to 30 guests',
  },
  {
    id: '5gb',
    name: 'Mini Event',
    storage: '5 GB',
    price: 'Rs. 99',
    duration: '1 Month (30 Days)',
    guestLimit: 100,
    storageBytes: 5368709120,
    days: 30,
    ai: false,
    description: 'Up to 100 guests',
  },
  {
    id: '10gb',
    name: 'Celebration',
    storage: '10 GB',
    price: 'Rs. 499',
    duration: '1 Month (30 Days)',
    guestLimit: 250,
    storageBytes: 10737418240,
    days: 30,
    ai: false,
    description: 'Up to 250 guests',
  },
  {
    id: '30gb',
    name: 'Grand Celebration',
    storage: '30 GB',
    price: 'Rs. 999',
    duration: '1 Month (30 Days)',
    guestLimit: 600,
    storageBytes: 32212254720,
    days: 30,
    ai: false,
    popular: true,
    description: 'Up to 600 guests',
  },
  {
    id: '100gb',
    name: 'Mega Festival',
    storage: '100 GB',
    price: 'Rs. 1,999',
    duration: '90 Days (3 Months)',
    guestLimit: 2000,
    storageBytes: 107374182400,
    days: 90,
    ai: true,
    description: 'Up to 2,000 guests',
  },
  {
    id: '250gb',
    name: 'Royal Multi-Day',
    storage: '250 GB',
    price: 'Rs. 4,999',
    duration: '1 Year (365 Days)',
    guestLimit: 10000,
    storageBytes: 268435456000,
    days: 365,
    ai: true,
    description: 'Unlimited guests',
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
          event_date: formData.event_date || new Date().toISOString().split('T')[0],
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F4EE]">
          Create New Event
        </h1>
        <p className="text-xs sm:text-sm text-[#A0A5AC]">
          Set up an in-browser live camera space for your guests to snap and share photos.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 bg-[#15171A] border border-[#262A30] rounded-2xl p-5 sm:p-7 shadow-xl"
      >
        {error && (
          <div className="p-3.5 text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-xl font-mono">
            {error}
          </div>
        )}

        {/* 1. Basic Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#262A30] pb-2.5">
            <span className="font-mono text-xs font-bold text-[#D49B35] uppercase tracking-wider">
              1. Event Information
            </span>
          </div>

          {/* Event Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-[#A0A5AC]">
              Event Name <span className="text-[#C84B28]">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Sita & Ramesh Wedding Celebration"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              className="h-12 rounded-xl bg-[#1A1C20] border-[#2E333A] text-sm text-[#F7F4EE] placeholder:text-[#5C6B5E] focus-visible:ring-[#D49B35]/30 focus-visible:border-[#D49B35]"
            />
          </div>

          {/* Event Type & Event Date in 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Custom Select for Event Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-mono uppercase tracking-wider text-[#A0A5AC]">
                Event Type
              </Label>
              <CustomSelect
                id="type"
                value={formData.event_type}
                onChange={(val) => setFormData({ ...formData, event_type: val })}
                options={EVENT_TYPE_OPTIONS}
                disabled={loading}
              />
            </div>

            {/* Custom Interactive Calendar Picker for Event Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-mono uppercase tracking-wider text-[#A0A5AC]">
                Event Date <span className="text-[#C84B28]">*</span>
              </Label>
              <CalendarPicker
                id="date"
                required
                value={formData.event_date}
                onChange={(val) => setFormData({ ...formData, event_date: val })}
                disabled={loading}
                placeholder="Select celebration date..."
              />
            </div>
          </div>

          {/* Venue / Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-mono uppercase tracking-wider text-[#A0A5AC]">
              Venue / Location (Optional)
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78877A]" />
              <Input
                id="location"
                placeholder="e.g. Yak & Yeti Grand Ballroom, Kathmandu"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={loading}
                className="pl-10 h-12 rounded-xl bg-[#1A1C20] border-[#2E333A] text-sm text-[#F7F4EE] placeholder:text-[#5C6B5E] focus-visible:ring-[#D49B35]/30 focus-visible:border-[#D49B35]"
              />
            </div>
          </div>
        </div>

        {/* 2. Choose Storage & Retention Plan */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[#262A30] pb-2.5">
            <span className="font-mono text-xs font-bold text-[#D49B35] uppercase tracking-wider">
              2. Choose Storage Plan
            </span>
            <span className="text-[11px] font-mono text-[#78877A]">
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
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                    isSelected
                      ? 'border-[#D49B35] bg-[#1A1C20] shadow-md ring-1 ring-[#D49B35]/20'
                      : 'border-[#262A30] hover:border-[#4B5563] bg-[#121316]'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-[#D49B35] text-[#121316] font-mono text-[9px] font-bold uppercase tracking-wider rounded-xs">
                      Popular
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-[#F7F4EE]">{plan.name}</span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#D49B35] bg-[#D49B35] text-[#121316]'
                          : 'border-[#4B5563]'
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-bold text-lg text-[#F7F4EE]">{plan.price}</span>
                      <span className="text-xs font-mono text-[#D49B35] ml-1">
                        ({plan.storage})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A0A5AC] mt-0.5">{plan.description}</p>
                  </div>

                  <div className="space-y-1 text-[10px] font-mono text-[#78877A] border-t border-[#262A30] pt-2">
                    <div className="flex items-center gap-1.5 text-[#E5DEC9]">
                      <Clock className="h-3 w-3 text-[#D49B35]" />
                      <span>{plan.duration} online access</span>
                    </div>
                    {plan.ai && (
                      <div className="flex items-center gap-1.5 font-semibold text-[#D49B35]">
                        <Bot className="h-3 w-3" />
                        <span>✨ AI Selfie Scan (Coming Soon)</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#262A30]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={loading}
            className="rounded-xl h-11 px-5 font-mono text-xs text-[#A0A5AC] hover:text-[#F7F4EE] hover:bg-[#1A1C20]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl h-11 px-7 font-mono text-xs uppercase tracking-wider font-bold bg-[#C84B28] hover:bg-[#9E3416] text-white shadow-md transition-all active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Event...
              </>
            ) : (
              <>
                Launch Event Space
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
