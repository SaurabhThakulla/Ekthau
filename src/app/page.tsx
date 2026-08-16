'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import JoinEventModal from '@/components/JoinEventModal'
import {
  Camera,
  QrCode,
  ArrowRight,
  Tv,
  Sparkles,
  WifiOff,
  Check,
  Maximize2,
  HardDrive,
  Clock,
  Users,
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
      retention: '30 Days',
      price: 'Free',
      period: 'forever',
      description: 'For intimate dinners and birthday brunches.',
      highlights: [
        'In-browser camera (zero downloads)',
        'Printable table QR pass',
        'Live mobile event feed',
        '1-click ZIP download',
      ],
      href: '/signup',
      cta: 'Start Free',
      isPopular: false,
    },
    {
      id: '5gb',
      tier: 'Mini Event',
      capacity: '100 Guests',
      storage: '5 GB',
      retention: '60 Days',
      price: 'Rs. 99',
      period: 'event',
      description: 'For engagements and anniversary parties.',
      highlights: [
        'Original HD quality preservation',
        'Short video clips (30s)',
        'Host moderation panel',
        'Custom venue details',
      ],
      href: '/signup?plan=5gb',
      cta: 'Select 5GB',
      isPopular: false,
    },
    {
      id: '10gb',
      tier: 'Celebration',
      capacity: '250 Guests',
      storage: '10 GB',
      retention: '90 Days',
      price: 'Rs. 499',
      period: 'event',
      description: 'For milestone birthdays and family reunions.',
      highlights: [
        '60s video clip uploads',
        'Live TV & Projector slideshow',
        'Priority mobile upload queue',
        'Host welcome banner',
      ],
      href: '/signup?plan=10gb',
      cta: 'Select 10GB',
      isPopular: false,
    },
    {
      id: '30gb',
      tier: 'Grand Celebration',
      capacity: '600 Guests',
      storage: '30 GB',
      retention: '180 Days',
      price: 'Rs. 999',
      period: 'event',
      description: 'The favorite for Nepali weddings & receptions.',
      highlights: [
        'Original 4K photos & videos',
        'Custom monogram QR stands',
        'Interactive live projector wall',
        'Top contributor leaderboard',
      ],
      href: '/signup?plan=30gb',
      cta: 'Select 30GB',
      isPopular: true,
    },
    {
      id: '100gb',
      tier: 'Mega Festival',
      capacity: '2,000 Guests',
      storage: '100 GB',
      retention: '1 Year',
      price: 'Rs. 1,999',
      period: 'event',
      description: 'For conventions, college fests, and multi-hall events.',
      highlights: [
        '✨ AI Selfie Scan (Find all your photos)',
        'Multi-screen live projector sync',
        'Automatic duplicate filtering',
        'Google Drive cloud backup',
      ],
      href: '/signup?plan=100gb',
      cta: 'Select 100GB',
      isPopular: false,
      ai: true,
    },
    {
      id: '250gb',
      tier: 'Royal Multi-Day',
      capacity: 'Unlimited',
      storage: '250 GB',
      retention: '2 Years',
      price: 'Rs. 4,999',
      period: 'multi-day',
      description: 'Full multi-day package (Haldi, Sangeet, Wedding, Reception).',
      highlights: [
        'Sub-event folders & separate QR stands',
        '✨ Advanced AI Face Match + Auto-Highlights',
        'White-label signage & custom domain',
        'Dedicated setup concierge',
      ],
      href: '/signup?plan=250gb',
      cta: 'Select Royal',
      isPopular: false,
      ai: true,
    },
  ]

  const realFaqs = [
    {
      q: 'Do guests need to install an app?',
      a: 'No. Guests point their phone camera at the table QR code. The camera opens instantly in their native mobile browser (Safari/Chrome). No downloads, no passwords.',
    },
    {
      q: 'What if the venue Wi-Fi or 4G drops?',
      a: 'Photos save to the phone in 48ms. When reception drops, uploads queue locally and sync automatically as soon as connection returns.',
    },
    {
      q: 'Does Ekthau compress photo quality?',
      a: 'No. Original 10–25MB raw photos and 4K clips are preserved without social media compression. Download the full-resolution archive in 1-click ZIP.',
    },
    {
      q: 'How does the Live Wall projector mode work?',
      a: 'Open the Live Wall link on any laptop connected to a venue TV or projector. New approved guest photos cross-fade live on screen every 6 seconds.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#121316] text-[#F7F4EE] flex flex-col selection:bg-[#C84B28] selection:text-white font-sans antialiased">
      
      {/* ========================================================================= */}
      {/* 1. HEADER                                                                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-[#262A30] bg-[#121316]/95 backdrop-blur-md">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 bg-[#C84B28] text-white flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-95">
              <Camera className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-[#F7F4EE]">
                Ekthau
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#D49B35]/15 text-[#D49B35] border border-[#D49B35]/30">
                एकठाउँ
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#A0A5AC]">
            <a href="#how-it-works" className="hover:text-[#F7F4EE] transition-colors">
              How It Works
            </a>
            <a href="#live-wall" className="hover:text-[#F7F4EE] transition-colors">
              Live Wall
            </a>
            <a href="#pricing" className="hover:text-[#F7F4EE] transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#F7F4EE] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Dock */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setJoinModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#2E333A] bg-[#1A1C20] hover:border-[#D49B35]/50 text-xs font-mono text-[#E5DEC9] transition-colors"
            >
              <QrCode className="h-3.5 w-3.5 text-[#D49B35]" />
              <span>Join Code</span>
            </button>

            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C84B28] hover:bg-[#9E3416] text-white text-xs font-medium font-mono uppercase tracking-wider transition-colors"
              >
                Dashboard
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs text-[#A0A5AC] hover:text-[#F7F4EE] transition-colors"
                >
                  Host Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C84B28] hover:bg-[#9E3416] text-white text-xs font-medium font-mono uppercase tracking-wider transition-colors"
                >
                  Host Event
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ========================================================================= */}
        {/* 2. COMPACT ASYMMETRIC HERO                                                */}
        {/* ========================================================================= */}
        <section className="relative pt-10 pb-14 md:pt-16 md:pb-18 border-b border-[#262A30] overflow-hidden">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Left Column: Crisp Headline & Direct Action */}
              <div className="lg:col-span-7 space-y-5 animate-aperture-unfurl">
                
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D49B35]">
                  <span className="h-1.5 w-1.5 bg-[#C84B28] rounded-full inline-block" />
                  In-Browser Digital Disposable Camera
                </div>

                <h1 className="font-display text-3xl sm:text-4xl md:text-[2.65rem] font-bold tracking-tight text-[#F7F4EE] leading-[1.12] text-balance">
                  Every table is a candid camera.{' '}
                  <span className="text-[#D49B35] font-normal">
                    Zero apps to download.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#A0A5AC] max-w-xl leading-relaxed">
                  Place QR cards on dinner tables. Guests scan with their regular phone camera, snap raw candid moments, and watch memories stream live onto venue screens.
                </p>

                {/* Direct Action Row */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#C84B28] hover:bg-[#9E3416] text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Create Event Space
                    <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>

                  {/* Inline Code Input */}
                  <form
                    onSubmit={handleDirectCodeSubmit}
                    className="flex items-center border border-[#2E333A] bg-[#1A1C20] focus-within:border-[#D49B35] transition-colors"
                  >
                    <input
                      type="text"
                      placeholder="ENTER CODE..."
                      value={directCode}
                      onChange={(e) => setDirectCode(e.target.value.toUpperCase())}
                      className="h-11 px-3.5 bg-transparent text-xs font-mono tracking-widest text-[#F7F4EE] placeholder:text-[#5C6B5E] focus:outline-hidden w-full sm:w-36"
                    />
                    <button
                      type="submit"
                      className="h-11 px-3 border-l border-[#2E333A] text-xs font-mono uppercase text-[#D49B35] hover:bg-[#22262B] transition-colors font-bold"
                    >
                      Go →
                    </button>
                  </form>
                </div>

                {/* Proof Metrics */}
                <div className="pt-3 border-t border-[#262A30] grid grid-cols-3 gap-3 font-mono text-[11px] text-[#A0A5AC]">
                  <div>
                    <span className="text-[#F7F4EE] font-bold block text-xs">100% RAW</span>
                    Full quality files
                  </div>
                  <div>
                    <span className="text-[#F7F4EE] font-bold block text-xs">&lt; 48ms</span>
                    Instant buffer
                  </div>
                  <div>
                    <span className="text-[#F7F4EE] font-bold block text-xs">1 GB FREE</span>
                    Included per event
                  </div>
                </div>
              </div>

              {/* Right Column: Signature Artifact (Table Stand & Live Film Strip) */}
              <div className="lg:col-span-5 relative">
                <div className="bg-[#1A1C20] border border-[#2E333A] p-4 space-y-4 shadow-xl">
                  
                  {/* Table Stand Header */}
                  <div className="flex items-center justify-between border-b border-[#2E333A] pb-3">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#D49B35] block font-bold">
                        Table Signage Pass
                      </span>
                      <h2 className="font-display font-semibold text-sm text-[#F7F4EE]">Table 08 • Banquet Hall</h2>
                    </div>
                    <div className="px-2 py-0.5 bg-[#D49B35]/15 border border-[#D49B35]/30 text-[#D49B35] font-mono text-[10px] font-bold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-[#D49B35] rounded-full animate-pulse" />
                      LIVE
                    </div>
                  </div>

                  {/* QR Card & In-Browser View */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5 relative aspect-square bg-white border border-[#2E333A]">
                      <Image
                        src="/images/table-qr-stand.jpg"
                        alt="Tabletop QR stand pass"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="col-span-7 space-y-1.5 text-xs text-[#A0A5AC]">
                      <p className="text-white font-medium text-xs leading-snug">
                        Guests scan with their default phone camera to shoot instantly.
                      </p>
                      <p className="font-mono text-[10px] text-[#78877A]">
                        • Safari / Chrome native<br />
                        • Works on weak signals<br />
                        • Real-time screen sync
                      </p>
                    </div>
                  </div>

                  {/* Film Contact Proof */}
                  <div className="pt-2 border-t border-[#2E333A] space-y-2">
                    <div className="flex items-center justify-between font-mono text-[9px] uppercase text-[#A0A5AC]">
                      <span>Live Ingest Feed</span>
                      <span className="text-[#C84B28] font-bold">● REC ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative aspect-[4/3] bg-black border border-[#2E333A] overflow-hidden">
                        <Image
                          src="/images/phone-camera-snap.jpg"
                          alt="Guest snapping candid"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1.5 py-0.5 font-mono text-[8px] text-[#A0A5AC] flex justify-between">
                          <span>FRAME 18</span>
                          <span className="text-white">TABLE 08</span>
                        </div>
                      </div>

                      <div className="relative aspect-[4/3] bg-black border border-[#2E333A] overflow-hidden">
                        <Image
                          src="/images/live-wall.jpg"
                          alt="Crowd celebration laughter"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1.5 py-0.5 font-mono text-[8px] text-[#A0A5AC] flex justify-between">
                          <span>FRAME 19</span>
                          <span className="text-[#D49B35]">PROJECTED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 3. HOW IT WORKS (CLEAN 3-STEP BREAKDOWN)                                  */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-14 md:py-18 border-b border-[#262A30]">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
            
            <div className="max-w-xl space-y-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#D49B35]">
                How It Works
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EE]">
                Zero app downloads. 3 simple steps.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Step 1 */}
              <div className="border border-[#2E333A] bg-[#15171A] p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C84B28]">STEP 1</span>
                  <QrCode className="h-4 w-4 text-[#D49B35]" />
                </div>
                <h3 className="font-display font-semibold text-base text-[#F7F4EE]">
                  Print Table QR Cards
                </h3>
                <p className="text-xs sm:text-sm text-[#A0A5AC] leading-relaxed">
                  Download high-resolution printable table cards with your couple monogram and place them alongside centerpieces.
                </p>
              </div>

              {/* Step 2 */}
              <div className="border border-[#2E333A] bg-[#15171A] p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C84B28]">STEP 2</span>
                  <Camera className="h-4 w-4 text-[#D49B35]" />
                </div>
                <h3 className="font-display font-semibold text-base text-[#F7F4EE]">
                  Guests Scan & Shoot
                </h3>
                <p className="text-xs sm:text-sm text-[#A0A5AC] leading-relaxed">
                  Guests point their regular camera at the QR pass. Snapping is instant. If reception drops, photos buffer safely offline.
                </p>
              </div>

              {/* Step 3 */}
              <div className="border border-[#2E333A] bg-[#15171A] p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C84B28]">STEP 3</span>
                  <Tv className="h-4 w-4 text-[#D49B35]" />
                </div>
                <h3 className="font-display font-semibold text-base text-[#F7F4EE]">
                  Live Wall & 1-Click ZIP
                </h3>
                <p className="text-xs sm:text-sm text-[#A0A5AC] leading-relaxed">
                  Connect any laptop to the venue screen for a live slideshow. Download all 100% full-resolution raw photos in 1-click.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 4. LIVE SCREEN & AI DISCOVERY SHOWCASE                                    */}
        {/* ========================================================================= */}
        <section id="live-wall" className="py-14 md:py-18 bg-[#0C0D0F] border-b border-[#262A30]">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#D49B35]">
                  Venue Projection Mode
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EE]">
                  Stream guest candids live on venue screens.
                </h2>
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#2E333A] bg-[#1A1C20] hover:border-[#D49B35] text-xs font-mono uppercase text-[#F7F4EE] transition-colors self-start"
              >
                <Maximize2 className="h-3.5 w-3.5 text-[#D49B35]" />
                Launch Live Wall
              </Link>
            </div>

            {/* Projection Visual */}
            <div className="relative aspect-[16/8] sm:aspect-[21/8] bg-black border border-[#2E333A] overflow-hidden">
              <Image
                src="/images/projector-live-wall.jpg"
                alt="Venue live projector slideshow"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-[10px]">
                <span className="px-2 py-1 bg-black/80 border border-[#2E333A] text-white">
                  ● LIVE STREAM • 6S ROTATION
                </span>
                <span className="px-2 py-1 bg-[#D49B35]/20 border border-[#D49B35]/40 text-[#D49B35] font-bold">
                  MODERATION ACTIVE
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-[#E5DEC9]">
                <span>TABLE 14 • 24.2MB RAW ORIGINAL</span>
                <span className="text-[#A0A5AC] hidden sm:inline">Plug into HDMI / TV / LED Wall</span>
              </div>
            </div>

            {/* AI Scan + Offline Dual Feature */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-[#2E333A] bg-[#15171A] p-5 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#D49B35]">
                  <Sparkles className="h-3.5 w-3.5" />
                  ✨ AI Selfie Face Scan (100GB+ Plans)
                </div>
                <p className="text-xs sm:text-sm text-[#A0A5AC]">
                  Guests snap a 1-second selfie to find all the photos and videos they appear in across thousands of event uploads.
                </p>
              </div>

              <div className="border border-[#2E333A] bg-[#15171A] p-5 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#78877A]">
                  <WifiOff className="h-3.5 w-3.5" />
                  Crowded Hall Signal Resilience
                </div>
                <p className="text-xs sm:text-sm text-[#A0A5AC]">
                  Photos buffer to device storage in 48ms. When mobile networks choke inside packed halls, uploads sync automatically when signal returns.
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 5. PRICING MATRIX                                                         */}
        {/* ========================================================================= */}
        <section id="pricing" className="py-14 md:py-18 border-b border-[#262A30]">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
            
            <div className="max-w-xl space-y-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#D49B35]">
                Pricing & Capacity
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EE]">
                Simple plans. Start with 1 GB free.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pricingLedger.map((plan) => (
                <div
                  key={plan.id}
                  className={`border p-6 flex flex-col justify-between transition-colors relative ${
                    plan.isPopular
                      ? 'border-[#D49B35] bg-[#1A1C20]'
                      : 'border-[#2E333A] bg-[#15171A]'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#D49B35] text-[#121316] font-mono text-[9px] font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-lg text-[#F7F4EE]">{plan.tier}</h3>
                        {plan.ai && (
                          <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#D49B35]/15 border border-[#D49B35]/30 text-[#D49B35]">
                            AI SCAN
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-[#D49B35] font-semibold mt-0.5">
                        {plan.capacity} • {plan.storage}
                      </p>
                    </div>

                    <div className="border-y border-[#2E333A] py-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display font-bold text-2xl text-[#F7F4EE]">{plan.price}</span>
                        <span className="font-mono text-xs text-[#A0A5AC]">/ {plan.period}</span>
                      </div>
                      <p className="font-mono text-[10px] text-[#78877A] mt-0.5">
                        {plan.retention} retention
                      </p>
                    </div>

                    <p className="text-xs text-[#A0A5AC]">
                      {plan.description}
                    </p>

                    <ul className="space-y-2 pt-1 font-mono text-xs text-[#E5DEC9]">
                      {plan.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <Check className="h-3 w-3 text-[#C84B28] shrink-0 mt-0.5" />
                          <span className={item.includes('AI') ? 'text-[#D49B35] font-bold' : ''}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={plan.href}
                      className={`w-full h-10 flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                        plan.isPopular
                          ? 'bg-[#D49B35] hover:bg-[#A6741F] text-[#121316]'
                          : 'border border-[#2E333A] bg-[#1A1C20] hover:border-[#D49B35] text-[#F7F4EE]'
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* 6. CONCISE FAQ                                                            */}
        {/* ========================================================================= */}
        <section id="faq" className="py-14 md:py-18 border-b border-[#262A30]">
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
            
            <div className="text-center space-y-1">
              <span className="font-mono text-xs uppercase tracking-wider text-[#D49B35]">
                FAQ
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EE]">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-3">
              {realFaqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="border border-[#2E333A] bg-[#15171A] p-4.5 cursor-pointer transition-colors hover:border-[#D49B35]/40"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-display font-medium text-sm sm:text-base text-[#F7F4EE]">
                        {faq.q}
                      </h4>
                      <span className="font-mono text-xs text-[#D49B35] px-1.5 py-0.5 bg-[#1A1C20] border border-[#2E333A]">
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-3 pt-3 border-t border-[#2E333A] text-xs sm:text-sm text-[#A0A5AC] leading-relaxed">
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
        {/* 7. BOTTOM CTA                                                             */}
        {/* ========================================================================= */}
        <section className="py-16 md:py-20 bg-[#0C0D0F] text-center">
          <div className="w-full max-w-xl mx-auto px-4 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F7F4EE]">
              Start capturing every angle of your celebration.
            </h2>
            <p className="text-xs sm:text-sm text-[#A0A5AC]">
              Set up your event space in 30 seconds. Includes 1 GB free storage.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto h-11 px-7 bg-[#C84B28] hover:bg-[#9E3416] text-white font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Camera className="h-3.5 w-3.5" />
                Create Event Space
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => setJoinModalOpen(true)}
                className="w-full sm:w-auto h-11 px-6 border border-[#2E333A] bg-[#1A1C20] hover:border-[#D49B35] text-[#E5DEC9] font-mono text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
              >
                <QrCode className="h-3.5 w-3.5 text-[#D49B35]" />
                Join with Code
              </button>
            </div>
          </div>
        </section>

      </main>


      {/* ========================================================================= */}
      {/* 8. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="border-t border-[#262A30] py-8 bg-[#121316] font-mono text-[11px] text-[#A0A5AC]">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-[#F7F4EE]">
            <div className="h-6 w-6 bg-[#C84B28] text-white flex items-center justify-center font-bold text-[10px]">
              <Camera className="h-3 w-3" />
            </div>
            <span className="font-display font-semibold text-xs">Ekthau (एकठाउँ)</span>
          </div>

          <div className="flex items-center gap-5 uppercase text-[10px]">
            <a href="#how-it-works" className="hover:text-[#D49B35] transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#D49B35] transition-colors">
              Pricing
            </a>
            <Link href="/join" className="hover:text-[#D49B35] transition-colors">
              Join Event
            </Link>
            <Link href="/login" className="hover:text-[#D49B35] transition-colors">
              Host Sign In
            </Link>
          </div>

          <p className="text-[10px] text-[#78877A]">
            © {new Date().getFullYear()} Ekthau
          </p>

        </div>
      </footer>

      {/* Global Join Event Modal */}
      <JoinEventModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />

    </div>
  )
}
