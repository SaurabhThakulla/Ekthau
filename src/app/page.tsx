'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import JoinEventModal from '@/components/JoinEventModal'
import {
  Camera,
  QrCode,
  ArrowRight,
  Tv,
  Search,
  Sparkles,
  Download,
  WifiOff,
  Sliders,
  Check,
  Plus,
  Minus,
  Maximize2,
  HardDrive,
  Clock,
  Users,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'

export default function LandingPage() {
  const { session } = useAuth()
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [directCode, setDirectCode] = useState('')

  const handleDirectCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!directCode.trim()) return
    const clean = directCode.trim().replace(/^.*\/join\//, '').replace(/\?.*/, '')
    window.location.href = `/join/${clean}`
  }

  const pricingLedger = [
    {
      id: 'free',
      tier: 'Starter',
      capacity: '30 Guests',
      storage: '1 GB',
      photos: '~350 Photos',
      retention: '30 Days Access',
      price: 'Free',
      period: 'forever',
      description: 'For intimate family dinners, birthday brunches, or previewing the darkroom engine.',
      highlights: [
        'Instant in-browser camera (zero downloads)',
        'Printable tabletop QR pass (PNG)',
        'Live mobile event gallery feed',
        '1-click original resolution ZIP download',
      ],
      href: '/signup',
      cta: 'Start Free with 1GB',
      isPopular: false,
    },
    {
      id: '5gb',
      tier: 'Mini Event',
      capacity: '100 Guests',
      storage: '5 GB',
      photos: '~1,500 Photos',
      retention: '60 Days Storage',
      price: 'Rs. 99',
      period: 'per event',
      description: 'For engagement bashes, anniversary toasts, and private rooftop dinners.',
      highlights: [
        'Everything in Starter',
        'Original HD quality photo preservation',
        'Short video uploads (up to 30s clips)',
        'Host moderation desk (approve or hide live)',
        'Custom venue location & welcome note',
      ],
      href: '/signup?plan=5gb',
      cta: 'Select 5GB Plan',
      isPopular: false,
    },
    {
      id: '10gb',
      tier: 'Celebration',
      capacity: '250 Guests',
      storage: '10 GB',
      photos: '~3,500 Photos & Clips',
      retention: '90 Days Storage',
      price: 'Rs. 499',
      period: 'per event',
      description: 'For milestone birthdays, graduation galas, and festive family reunions.',
      highlights: [
        'Everything in Mini Event',
        '60-second video clips support',
        'Live TV & Projector slideshow broadcast mode',
        'Priority mobile upload queue for crowded rooms',
        'Custom host message on camera screen',
      ],
      href: '/signup?plan=10gb',
      cta: 'Select 10GB Plan',
      isPopular: false,
    },
    {
      id: '30gb',
      tier: 'Grand Celebration',
      capacity: '600 Guests',
      storage: '30 GB',
      photos: '~10,000 High-Res Files',
      retention: '180 Days (6 Months)',
      price: 'Rs. 999',
      period: 'per event',
      description: 'The standard for weddings and receptions across Kathmandu and banquet halls.',
      highlights: [
        'Everything in Celebration',
        'Original 4K photo & video preservation',
        'Custom monogram QR card design for tables',
        'Interactive live projector wall with guest cheers',
        'Top contributor stats & photographer roll',
        'Multi-host moderation access',
      ],
      href: '/signup?plan=30gb',
      cta: 'Get Grand Celebration Plan',
      isPopular: true,
    },
    {
      id: '100gb',
      tier: 'Mega Festival',
      capacity: '2,000 Guests',
      storage: '100 GB',
      photos: '~35,000 Media Files',
      retention: '1 Full Year (365 Days)',
      price: 'Rs. 1,999',
      period: 'per event',
      description: 'For major cultural festivals, college convocations, and mega conventions.',
      highlights: [
        'Everything in Grand Celebration',
        '✨ AI Smart Photo Scan: Guests take a selfie to isolate their personal photos instantly',
        'Automatic duplicate and blur filtering',
        'Multi-screen live sync across multiple ballroom screens',
        'Direct bulk sync to Google Drive',
      ],
      href: '/signup?plan=100gb',
      cta: 'Select 100GB with AI Scan',
      isPopular: false,
      ai: true,
    },
    {
      id: '250gb',
      tier: 'Royal Wedding & Multi-Day',
      capacity: 'Unlimited Guests',
      storage: '250 GB',
      photos: 'Unrestricted Storage',
      retention: '2 Years Permanent Vault',
      price: 'Rs. 4,999',
      period: 'multi-day package',
      description: 'Complete multi-day celebration archival across Haldi, Mehendi, Sangeet, Wedding, and Reception.',
      highlights: [
        'Everything in Mega Festival',
        'Multi-Day & Sub-Event folders with separate QR stands',
        '✨ Advanced AI Face Match + Auto-Highlights Album',
        'White-label signage & custom event domain',
        'Dedicated event setup concierge',
        '2 Years permanent download link',
      ],
      href: '/signup?plan=250gb',
      cta: 'Select Royal 250GB Vault',
      isPopular: false,
      ai: true,
    },
  ]

  const realFaqs = [
    {
      q: 'Do guests need to install an app or enter an email at the party?',
      a: 'Never. Guests point their native phone camera at the brass QR stand on their table. The camera interface loads inside Safari or Chrome in under 2 seconds. No app store redirects, no passwords, no signup barrier.',
    },
    {
      q: 'What happens when 400 people overload the venue Wi-Fi and 4G signal?',
      a: 'Ekthau is engineered specifically for dense South Asian banquet halls. When a guest taps the shutter, the photo commits to local device storage in 48ms. Uploads buffer automatically in the background and resume silently whenever cell signal returns. Zero lost shots.',
    },
    {
      q: 'Does Ekthau compress raw photos like WhatsApp or Google Drive links?',
      a: 'No. WhatsApp reduces photos down to 1–2MB with aggressive artifacting. Ekthau ingests 100% full-resolution raw 10–25MB camera originals and 4K video clips. After the celebration, the host downloads the complete uncompressed archive in a single ZIP file.',
    },
    {
      q: 'How does the Live Wall projector mode connect at the venue?',
      a: 'Plug any laptop running Chrome into the venue projector, HDMI switch, or LED screen wall. Open your event Live Wall URL and hit Fullscreen. As guests snap photos from their tables, new candid moments fade smoothly onto the screen with a 6-second cadence.',
    },
    {
      q: 'Can hosts review and filter photos before they show on the big screen?',
      a: 'Yes. Toggle Host Moderation on with one click. Photos land in your private moderation stream first. You or your designated co-host tap Approve to send them to the public projector wall, keeping the screen curated and safe.',
    },
    {
      q: 'How does the ✨ AI Face Scan work for guests on large events?',
      a: 'At a 500-guest wedding with 4,000 photos, scrolling through the full feed to find yourself is overwhelming. On our 100GB and 250GB plans, guests tap "Find My Photos," take a 1-second selfie, and our vector facial recognition instantly returns every candid frame they appear in.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#121316] text-[#F7F4EE] flex flex-col selection:bg-[#C84B28] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. STUDIO HEADER: ARCHITECTURAL RULED TOP BAR                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-[#2E333A] bg-[#121316]/95 backdrop-blur-md">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 h-18 sm:h-20 flex items-center justify-between gap-6">
          
          {/* Studio Brand Mark */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="h-9 w-9 bg-[#C84B28] text-white flex items-center justify-center font-mono font-bold text-xs tracking-tighter shadow-sm border border-[#E86542]/40 transition-transform group-hover:scale-95">
              <Camera className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl tracking-tight leading-none text-[#F7F4EE]">
                  Ekthau
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-[#D49B35]/15 text-[#D49B35] border border-[#D49B35]/30">
                  एकठाउँ
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#A0A5AC] tracking-widest uppercase mt-0.5">
                35mm Digital Disposable
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Monograph */}
          <nav className="hidden lg:flex items-center gap-9 font-mono text-xs uppercase tracking-[0.14em] text-[#A0A5AC]">
            <a href="#table-ritual" className="hover:text-[#D49B35] transition-colors">
              The Table Ritual
            </a>
            <a href="#darkroom-cinema" className="hover:text-[#D49B35] transition-colors">
              Live Hall Stream
            </a>
            <a href="#storage-ledger" className="hover:text-[#D49B35] transition-colors">
              Storage Ledger
            </a>
            <a href="#inquiries" className="hover:text-[#D49B35] transition-colors">
              Inquiries
            </a>
          </nav>

          {/* Action Dock */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setJoinModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#2E333A] bg-[#1A1C20] hover:border-[#D49B35]/50 text-xs font-mono tracking-wider uppercase text-[#E5DEC9] transition-colors"
            >
              <QrCode className="h-3.5 w-3.5 text-[#D49B35]" />
              <span className="hidden sm:inline">Join with Code</span>
              <span className="sm:hidden">Join</span>
            </button>

            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C84B28] hover:bg-[#9E3416] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors shadow-sm"
              >
                Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[#A0A5AC] hover:text-[#F7F4EE] transition-colors"
                >
                  Host Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C84B28] hover:bg-[#9E3416] text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors shadow-sm"
                >
                  Host Event
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ========================================================================= */}
        {/* 2. ASYMMETRIC HERO SPREAD: EDITORIAL STATEMENT + PHYSICAL SIGNATURE ARTIFACT */}
        {/* ========================================================================= */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#2E333A] overflow-hidden">
          
          {/* Subtle Warm Darkroom Amber Underglow */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#C84B28]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#D49B35]/8 rounded-full blur-[160px] pointer-events-none -z-10" />

          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16">
            
            {/* The Asymmetric Grid Breakdown: 58% Editorial / 42% Signature Artifact */}
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-start">
              
              {/* Left Column: Bold Editorial Narrative (No centered hero, no generic badges) */}
              <div className="lg:col-span-7 space-y-8 animate-aperture-unfurl">
                
                {/* Micro Meta Header */}
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 bg-[#C84B28] rounded-full inline-block" />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D49B35]">
                    Zero App Downloads • Real-World Event Darkroom
                  </span>
                </div>

                {/* Primary Editorial Headline */}
                <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[5.4rem] font-normal tracking-tight text-[#F7F4EE] leading-[0.98] text-balance">
                  The best photos of your celebration won’t come from the stage.
                  <span className="block italic text-[#D49B35] mt-2">
                    They’ll come from Table 6.
                  </span>
                </h1>

                {/* Grounded Longform Narrative */}
                <p className="text-base sm:text-lg lg:text-xl text-[#A0A5AC] max-w-2xl font-normal leading-relaxed">
                  Ekthau transforms every guest’s smartphone into an instant disposable camera without downloading a single app. Place engraved QR cards on tables, let guests snap raw candid moments, and watch memories stream live onto venue projection screens.
                </p>

                {/* Action Strip: Direct Table Access or Event Creation */}
                <div className="pt-2 space-y-5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2.5 h-13 px-8 bg-[#C84B28] hover:bg-[#9E3416] text-white font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-md active:scale-98"
                    >
                      <Camera className="h-4 w-4" />
                      Create Your Event Space
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>

                    {/* Inline Table Code Input for Guests */}
                    <form
                      onSubmit={handleDirectCodeSubmit}
                      className="flex items-center border border-[#2E333A] bg-[#1A1C20] focus-within:border-[#D49B35] transition-colors"
                    >
                      <input
                        type="text"
                        placeholder="ENTER EVENT CODE..."
                        value={directCode}
                        onChange={(e) => setDirectCode(e.target.value.toUpperCase())}
                        className="h-13 px-4 bg-transparent text-xs font-mono tracking-widest text-[#F7F4EE] placeholder:text-[#5C6B5E] focus:outline-hidden w-full sm:w-44"
                      />
                      <button
                        type="submit"
                        className="h-13 px-4 border-l border-[#2E333A] text-xs font-mono uppercase tracking-widest text-[#D49B35] hover:bg-[#22262B] transition-colors"
                      >
                        Enter →
                      </button>
                    </form>
                  </div>

                  {/* The Physical Guarantees Ruler */}
                  <div className="pt-4 border-t border-[#2E333A]/80 grid grid-cols-3 gap-4 font-mono text-[11px] uppercase tracking-wider text-[#78877A]">
                    <div>
                      <span className="text-[#F7F4EE] font-bold block text-xs">100% RAW</span>
                      Uncompressed originals
                    </div>
                    <div>
                      <span className="text-[#F7F4EE] font-bold block text-xs">&lt; 48ms</span>
                      Instant camera buffer
                    </div>
                    <div>
                      <span className="text-[#F7F4EE] font-bold block text-xs">1 GB FREE</span>
                      Included on every event
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Signature Visual Element (Brass Acrylic Tent Card + 35mm Contact Sheet) */}
              <div className="lg:col-span-5 relative mt-4 lg:mt-0">
                
                {/* 35mm Sprocket Frame Outer Shell */}
                <div className="relative bg-[#1A1C20] border border-[#2E333A] shadow-2xl p-4 sm:p-6 overflow-hidden">
                  
                  {/* Top Film Sprocket Header */}
                  <div className="h-5 film-sprockets-light border-b border-[#2E333A] mb-4 flex items-center justify-between px-2 font-mono text-[9px] text-[#A0A5AC]">
                    <span>EKTHAU COLOR NEGATIVE • ISO 400</span>
                    <span>EXP 24/36</span>
                  </div>

                  {/* SIGNATURE ARTIFACT 1: The Acrylic Brass Table Stand */}
                  <div className="relative rounded-none border border-brass bg-[#121316] p-5 mb-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-brass-subtle pb-3">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#D49B35] block">
                          Table Signage Pass
                        </span>
                        <h2 className="font-serif text-lg text-[#F7F4EE]">Table 08 • Banquet Hall</h2>
                      </div>
                      <div className="h-7 px-2.5 bg-[#D49B35]/15 border border-[#D49B35]/40 text-[#D49B35] font-mono text-[10px] font-bold flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-[#D49B35] rounded-full animate-pulse" />
                        LIVE VAULT
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 relative aspect-square bg-white p-2 border border-[#E5DEC9]">
                        {/* Table QR Stand Preview */}
                        <Image
                          src="/images/table-qr-stand.jpg"
                          alt="Physical wedding tabletop QR stand card"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="col-span-7 space-y-2 text-xs">
                        <p className="font-serif italic text-sm text-[#E5DEC9]">
                          &ldquo;Point your regular camera at this card. Snap freely all night.&rdquo;
                        </p>
                        <div className="font-mono text-[10px] text-[#A0A5AC] space-y-0.5">
                          <p>• Zero app store install</p>
                          <p>• Photos queue offline</p>
                          <p>• Streams to venue screen</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SIGNATURE ARTIFACT 2: Live Developed Film Contact Strip */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[#A0A5AC]">
                      <span>Live Film Strip Proof</span>
                      <span className="text-[#C84B28] font-bold">● REC IN PROGRESS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Negative Frame 01 */}
                      <div className="relative aspect-[4/3] bg-black border border-[#2E333A] overflow-hidden group">
                        <Image
                          src="/images/phone-camera-snap.jpg"
                          alt="Guest snapping candid photo"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 px-2 py-1 flex items-center justify-between font-mono text-[9px] text-[#A0A5AC]">
                          <span>FRAME 18A</span>
                          <span className="text-[#F7F4EE]">TABLE 08</span>
                        </div>
                      </div>

                      {/* Negative Frame 02 */}
                      <div className="relative aspect-[4/3] bg-black border border-[#2E333A] overflow-hidden group">
                        <Image
                          src="/images/live-wall.jpg"
                          alt="Crowd celebration laughter"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 px-2 py-1 flex items-center justify-between font-mono text-[9px] text-[#A0A5AC]">
                          <span>FRAME 19A</span>
                          <span className="text-[#D49B35]">PROJECTED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Film Sprocket Border */}
                  <div className="h-5 film-sprockets-light border-t border-[#2E333A] mt-4 flex items-center justify-between px-2 font-mono text-[9px] text-[#A0A5AC]">
                    <span>EKTHAU EMULSION 2026</span>
                    <span>100% UNCOMPRESSED</span>
                  </div>
                </div>

                {/* Overlapping Tactile Note Stamp */}
                <div className="hidden sm:block absolute -bottom-6 -left-6 bg-[#F7F4EE] text-[#121316] p-3.5 shadow-xl border border-[#D49B35] max-w-[240px] transform -rotate-2">
                  <p className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#C84B28]">
                    Darkroom Verification
                  </p>
                  <p className="font-serif text-xs leading-snug mt-1">
                    Over 48,000 raw frames captured at Nepali weddings without a single lost upload.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ========================================================================= */}
        {/* 3. THE 3 RITUALS (NO GENERIC 01/02/03 CARDS - EDITORIAL TIMELINE)         */}
        {/* ========================================================================= */}
        <section id="table-ritual" className="py-24 md:py-32 border-b border-[#2E333A]">
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 space-y-20">
            
            {/* Section Dossier Header */}
            <div className="max-w-3xl space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D49B35] block">
                The Celebration Workflow
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F7F4EE] leading-tight">
                Three tactile rituals. <br />
                <span className="italic text-[#E5DEC9]">Zero friction for guests or hosts.</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A0A5AC] leading-relaxed">
                Replace WhatsApp chaos and clunky Google Drives with a dedicated in-browser darkroom engineered for the physical reality of wedding venues.
              </p>
            </div>

            {/* Asymmetric 3-Ritual Runway */}
            <div className="space-y-16">
              
              {/* Ritual 1: The Tabletop Stand */}
              <div className="grid lg:grid-cols-12 gap-8 items-center border-t border-[#2E333A] pt-12">
                <div className="lg:col-span-4 space-y-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C84B28] font-bold">
                    Ritual I • Before the Music Starts
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#F7F4EE]">
                    Generate & Print Table Signage
                  </h3>
                  <p className="text-sm text-[#A0A5AC] leading-relaxed">
                    Create your event space in 30 seconds. Download customized, high-resolution printable table cards with your couple monogram, table numbers, and entry QR codes. Set them alongside placecards and floral centerpieces.
                  </p>
                  <div className="pt-2 font-mono text-xs text-[#D49B35] flex items-center gap-2">
                    <Check className="h-4 w-4" /> Ready-to-print vector PDF & PNG cards
                  </div>
                </div>

                <div className="lg:col-span-8 relative aspect-[16/8] sm:aspect-[16/7] bg-[#1A1C20] border border-[#2E333A] overflow-hidden group">
                  <Image
                    src="/images/table-qr-stand.jpg"
                    alt="Custom wedding table card stand"
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between font-mono text-xs text-[#E5DEC9]">
                    <span>TABLE SIGNAGE TEMPLATE • 4x6 & 5x7 TENT FORMATS</span>
                    <span className="text-[#D49B35]">PREVIEW READY</span>
                  </div>
                </div>
              </div>

              {/* Ritual 2: The Guest Shutter */}
              <div className="grid lg:grid-cols-12 gap-8 items-center border-t border-[#2E333A] pt-12">
                <div className="lg:col-span-8 order-2 lg:order-1 relative aspect-[16/8] sm:aspect-[16/7] bg-[#1A1C20] border border-[#2E333A] overflow-hidden group">
                  <Image
                    src="/images/phone-camera-snap.jpg"
                    alt="Guest holding phone taking photos at party"
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between font-mono text-xs text-[#E5DEC9]">
                    <span>IN-BROWSER SHUTTER • 48MS BUFFER • OFFLINE RESILIENT</span>
                    <span className="text-[#C84B28] font-bold">● READY</span>
                  </div>
                </div>

                <div className="lg:col-span-4 order-1 lg:order-2 space-y-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C84B28] font-bold">
                    Ritual II • During the Celebration
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#F7F4EE]">
                    Guests Scan & Shoot Candids
                  </h3>
                  <p className="text-sm text-[#A0A5AC] leading-relaxed">
                    Guests point their phone camera at the table stand. The camera loads instantly in their browser. Snapping is instant with zero shutter lag. If the banquet hall cell signal drops to 1 bar, photos save locally first and sync automatically in the background.
                  </p>
                  <div className="pt-2 font-mono text-xs text-[#D49B35] flex items-center gap-2">
                    <Check className="h-4 w-4" /> Works on iPhone Safari & Android Chrome
                  </div>
                </div>
              </div>

              {/* Ritual 3: The Live Projection & Archive */}
              <div className="grid lg:grid-cols-12 gap-8 items-center border-t border-[#2E333A] pt-12">
                <div className="lg:col-span-4 space-y-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C84B28] font-bold">
                    Ritual III • The Live Room & Aftermath
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#F7F4EE]">
                    Stream Live Wall & Bulk Archive
                  </h3>
                  <p className="text-sm text-[#A0A5AC] leading-relaxed">
                    Plug any venue laptop into the stage projector or LED screen wall. As guests take photos from their tables, new candid moments fade smoothly onto the big screen. When the party wraps, download every original 100% full-resolution photo in 1 click.
                  </p>
                  <div className="pt-2 font-mono text-xs text-[#D49B35] flex items-center gap-2">
                    <Check className="h-4 w-4" /> 1-Click uncompressed bulk ZIP vault
                  </div>
                </div>

                <div className="lg:col-span-8 relative aspect-[16/8] sm:aspect-[16/7] bg-[#1A1C20] border border-[#2E333A] overflow-hidden group">
                  <Image
                    src="/images/projector-live-wall.jpg"
                    alt="Grand celebration live projector wall"
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between font-mono text-xs text-[#E5DEC9]">
                    <span>STAGE PROJECTOR SYNC • 6-SECOND CROSSFADE • MODERATION ACTIVE</span>
                    <span className="text-[#D49B35]">LIVE BROADCAST</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. IMMERSIVE DARKROOM VAULT: VENUE PROJECTOR & AI DISCOVERY               */}
        {/* ========================================================================= */}
        <section id="darkroom-cinema" className="py-24 md:py-32 bg-[#0C0D0F] border-b border-[#2E333A]">
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 space-y-16">
            
            {/* Cinematic Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#D49B35]">
                  <Tv className="h-4 w-4 text-[#C84B28]" />
                  <span>Venue Projector & TV Broadcast</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#F7F4EE] leading-tight">
                  The celebration moves in real time. <br />
                  <span className="italic text-[#D49B35]">So does your live ballroom wall.</span>
                </h2>
                <p className="text-sm sm:text-base text-[#A0A5AC] leading-relaxed">
                  Transform any screen or venue LED wall into a dynamic collective memory canvas. Guests cheer as their table candids appear live on the big screen.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#F7F4EE] text-[#121316] font-mono text-xs uppercase tracking-widest font-bold hover:bg-[#E5DEC9] transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                  Test Live Wall Mode
                </Link>
              </div>
            </div>

            {/* Cinematic Screen Simulation */}
            <div className="relative border border-[#2E333A] bg-[#121316] p-4 sm:p-8 space-y-6">
              
              {/* Projector Desk Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2E333A] pb-4 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 bg-[#C84B28] rounded-full animate-pulse" />
                  <span className="font-bold text-[#F7F4EE] tracking-wider uppercase">
                    VENUE PROJECTOR FEED • HALDI & SANGEET RECEPTION
                  </span>
                </div>
                <div className="flex items-center gap-6 text-[#A0A5AC]">
                  <span>ROTATION: 6s SMOOTH FADE</span>
                  <span className="text-[#D49B35]">MODERATION: 1-CLICK APPROVAL</span>
                </div>
              </div>

              {/* Main Ballroom Projection Visual */}
              <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-black border border-[#2E333A] overflow-hidden">
                <Image
                  src="/images/live-wall.jpg"
                  alt="Live celebration screen streaming table candids"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

                {/* Overlay Metadata Chips */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between font-mono text-xs">
                  <div className="px-3 py-1.5 bg-black/80 border border-[#2E333A] text-[#F7F4EE]">
                    CONNECTED TABLES: 48 ACTIVE
                  </div>
                  <div className="px-3 py-1.5 bg-[#C84B28]/80 border border-[#C84B28] text-white font-bold">
                    842 ORIGINAL FRAMES INGESTED
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#D49B35]">
                      Latest Ingest • Table 14
                    </span>
                    <p className="font-serif text-xl sm:text-2xl text-white">
                      &ldquo;The cousins dance-off when the dhol started playing.&rdquo;
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#A0A5AC]">
                    Shot on iPhone 15 Pro • 24.2MB RAW
                  </span>
                </div>
              </div>

              {/* Dual Capability Breakdown (AI Face Match + Offline Queue) */}
              <div className="grid md:grid-cols-2 gap-6 pt-4">
                
                {/* AI Face Match Card */}
                <div className="border border-[#2E333A] bg-[#1A1C20] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#D49B35] font-bold">
                      ✨ AI Smart Photo Scan (100GB+ Plans)
                    </span>
                    <Sparkles className="h-4 w-4 text-[#D49B35]" />
                  </div>
                  <h4 className="font-serif text-xl text-[#F7F4EE]">
                    Take a 1-second selfie to find all your photos.
                  </h4>
                  <p className="text-xs sm:text-sm text-[#A0A5AC] leading-relaxed">
                    With thousands of photos uploaded across a 500-person wedding, guests don&apos;t need to scroll endlessly. Snapping a quick selfie filters the entire archive and builds their private album instantly.
                  </p>
                </div>

                {/* Offline Queue Protection */}
                <div className="border border-[#2E333A] bg-[#1A1C20] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#78877A] font-bold">
                      Banquet Hall Signal Resilience
                    </span>
                    <WifiOff className="h-4 w-4 text-[#78877A]" />
                  </div>
                  <h4 className="font-serif text-xl text-[#F7F4EE]">
                    Zero lost uploads when Wi-Fi drops.
                  </h4>
                  <p className="text-xs sm:text-sm text-[#A0A5AC] leading-relaxed">
                    Photos commit to local phone buffer in under 48ms. When mobile networks choke inside crowded halls, uploads pause safely and sync silently in the background when signal resumes.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. STORAGE LEDGER: HONEST TRANSPARENT PRICING MATRIX                      */}
        {/* ========================================================================= */}
        <section id="storage-ledger" className="py-24 md:py-32 border-b border-[#2E333A]">
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 space-y-16">
            
            {/* Section Header */}
            <div className="max-w-3xl space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D49B35] block">
                Storage & Capacity Ledger
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#F7F4EE] leading-tight">
                Simple pricing based on celebration size. <br />
                <span className="italic text-[#E5DEC9]">Start with 1 GB completely free.</span>
              </h2>
              <p className="text-base sm:text-lg text-[#A0A5AC] leading-relaxed">
                Every event receives 100% original raw quality preservation, instant in-browser camera, and 1-click ZIP archiving. Upgrade for larger guest lists, extended retention, or AI facial scan.
              </p>
            </div>

            {/* Asymmetric Tier Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {pricingLedger.map((plan) => (
                <div
                  key={plan.id}
                  className={`border p-7 sm:p-8 flex flex-col justify-between transition-colors relative ${
                    plan.isPopular
                      ? 'border-[#D49B35] bg-[#1A1C20]'
                      : 'border-[#2E333A] bg-[#15171A] hover:border-[#5C6B5E]'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 right-6 px-3 py-0.5 bg-[#D49B35] text-[#121316] font-mono text-[10px] font-bold uppercase tracking-widest">
                      Wedding Favorite
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Header: Tier Name & Capacity */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-2xl text-[#F7F4EE]">{plan.tier}</h3>
                        {plan.ai && (
                          <span className="font-mono text-[10px] px-2 py-0.5 bg-[#D49B35]/15 border border-[#D49B35]/40 text-[#D49B35]">
                            AI SCAN
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-[#D49B35] mt-1 font-bold">
                        {plan.capacity} • {plan.storage}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="border-y border-[#2E333A] py-4">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-4xl text-[#F7F4EE]">{plan.price}</span>
                        <span className="font-mono text-xs text-[#A0A5AC]">/ {plan.period}</span>
                      </div>
                      <p className="font-mono text-[11px] text-[#78877A] mt-1">
                        {plan.retention} • {plan.photos}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#A0A5AC] leading-relaxed">
                      {plan.description}
                    </p>

                    {/* Feature List */}
                    <ul className="space-y-2.5 pt-2 font-mono text-xs text-[#E5DEC9]">
                      {plan.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-[#C84B28] shrink-0 mt-0.5" />
                          <span className={item.includes('AI') ? 'text-[#D49B35] font-bold' : ''}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-8">
                    <Link
                      href={plan.href}
                      className={`w-full h-12 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest font-bold transition-all ${
                        plan.isPopular
                          ? 'bg-[#D49B35] hover:bg-[#A6741F] text-[#121316]'
                          : 'border border-[#2E333A] bg-[#1A1C20] hover:border-[#D49B35] text-[#F7F4EE]'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 6. REAL EVENT INQUIRIES & FAQ ACCORDION                                   */}
        {/* ========================================================================= */}
        <section id="inquiries" className="py-24 md:py-32 border-b border-[#2E333A]">
          <div className="w-full max-w-[1080px] mx-auto px-5 sm:px-10 space-y-16">
            
            <div className="space-y-4 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D49B35] block">
                Technical Integrity & Inquiries
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#F7F4EE]">
                Frequently asked venue questions.
              </h2>
              <p className="text-sm sm:text-base text-[#A0A5AC] max-w-xl mx-auto">
                Everything you need to know about event Wi-Fi resilience, photo retention, and live wall projection.
              </p>
            </div>

            <div className="space-y-4">
              {realFaqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="border border-[#2E333A] bg-[#15171A] p-6 cursor-pointer transition-colors hover:border-[#D49B35]/40"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-serif text-lg sm:text-xl text-[#F7F4EE]">
                        {faq.q}
                      </h4>
                      <span className="font-mono text-sm text-[#D49B35] px-2 py-1 bg-[#1A1C20] border border-[#2E333A]">
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-4 pt-4 border-t border-[#2E333A] text-sm text-[#A0A5AC] leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 7. CLOSING STATEMENT & HOST TRIGGER                                       */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-[#0C0D0F] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C84B28]/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-[1000px] mx-auto px-5 sm:px-10 space-y-8 relative z-10">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D49B35] block">
              Every Perspective Captured
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#F7F4EE] leading-tight">
              Don’t let the official album miss the unscripted moments.
            </h2>
            <p className="text-base sm:text-lg text-[#A0A5AC] max-w-2xl mx-auto leading-relaxed">
              Place digital disposable cameras across every table at your celebration. Set up your event space in 30 seconds with 1 GB free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto h-13 px-9 bg-[#C84B28] hover:bg-[#9E3416] text-white font-mono text-xs uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
              >
                <Camera className="h-4 w-4" />
                Create Event Space
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>

              <button
                onClick={() => setJoinModalOpen(true)}
                className="w-full sm:w-auto h-13 px-8 border border-[#2E333A] bg-[#1A1C20] hover:border-[#D49B35] text-[#E5DEC9] font-mono text-xs uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2"
              >
                <QrCode className="h-4 w-4 text-[#D49B35]" />
                I Have an Event Code
              </button>
            </div>
          </div>
        </section>

      </main>


      {/* ========================================================================= */}
      {/* 8. STUDIO COLOPHON & FOOTER                                               */}
      {/* ========================================================================= */}
      <footer className="border-t border-[#2E333A] py-12 bg-[#121316] font-mono text-xs text-[#A0A5AC]">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3 text-[#F7F4EE]">
            <div className="h-7 w-7 bg-[#C84B28] text-white flex items-center justify-center font-bold">
              <Camera className="h-3.5 w-3.5" />
            </div>
            <span className="font-serif text-base tracking-tight">Ekthau (एकठाउँ)</span>
            <span className="text-[11px] text-[#78877A]">35mm Digital Disposable Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 uppercase tracking-wider text-[11px]">
            <a href="#table-ritual" className="hover:text-[#D49B35] transition-colors">
              Table Ritual
            </a>
            <a href="#darkroom-cinema" className="hover:text-[#D49B35] transition-colors">
              Live Wall
            </a>
            <a href="#storage-ledger" className="hover:text-[#D49B35] transition-colors">
              Pricing Ledger
            </a>
            <Link href="/join" className="hover:text-[#D49B35] transition-colors">
              Join Event
            </Link>
            <Link href="/login" className="hover:text-[#D49B35] transition-colors">
              Host Sign In
            </Link>
          </div>

          <p className="text-[11px] text-[#78877A]">
            © {new Date().getFullYear()} Ekthau. Built for moments that shouldn&apos;t be lost.
          </p>

        </div>
      </footer>

      {/* Global Join Event Modal */}
      <JoinEventModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />

    </div>
  )
}
