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
  ShieldCheck,
  Zap,
  Download,
  Sliders,
  CheckCircle2,
  Users,
  Image as ImageIcon,
  Images,
  Layers,
  Heart,
  Eye,
  Lock,
  WifiOff,
  Tv,
  ChevronRight,
  Star,
  Play,
  Check,
  Bot,
  Clock,
  HardDrive,
  Flame,
  Crown,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  Scan,
  Maximize2,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'

export default function LandingPage() {
  const { session } = useAuth()
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const pricingPlans = [
    {
      id: 'free',
      name: 'Starter',
      capacity: 'Up to 30 guests',
      price: 'Free',
      numericPrice: 0,
      description: 'Ideal for intimate family dinners, birthday brunches, or trying out Ekthau.',
      duration: '30 days online access',
      storage: '1 GB storage (~350 photos)',
      badge: 'Free Forever',
      badgeClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
      cardClass: 'border-border bg-card',
      buttonClass: 'border-border bg-background hover:bg-muted text-foreground',
      features: [
        'In-browser camera (zero app downloads)',
        'Printable table QR code pass (PNG)',
        'Shared live mobile gallery',
        'Single-click bulk ZIP download',
        'Standard upload speeds',
      ],
      cta: 'Start Free with 1GB',
      ctaHref: '/signup',
    },
    {
      id: '5gb',
      name: 'Mini Event',
      capacity: 'Up to 100 guests',
      price: 'Rs. 99',
      numericPrice: 99,
      description: 'Perfect for engagement parties, anniversary dinners, and private bashes.',
      duration: '60 days (2 months) storage',
      storage: '5 GB storage (~1,500 photos & clips)',
      badge: 'Mini Event',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      cardClass: 'border-border bg-card',
      buttonClass: 'border-border bg-background hover:bg-muted text-foreground',
      features: [
        'Everything in Starter',
        'Original HD quality photo preservation',
        'Short video uploads (up to 30s)',
        'Host moderation panel (approve/hide photos)',
        'Customized venue and event details',
      ],
      cta: 'Select 5GB Plan',
      ctaHref: '/signup?plan=5gb',
    },
    {
      id: '10gb',
      name: 'Celebration',
      capacity: 'Up to 250 guests',
      price: 'Rs. 499',
      numericPrice: 499,
      description: 'Built for reception parties, milestone birthdays, and family reunions.',
      duration: '90 days (3 months) storage',
      storage: '10 GB storage (~3,500 photos & videos)',
      badge: 'Celebration',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      cardClass: 'border-border bg-card',
      buttonClass: 'border-border bg-background hover:bg-muted text-foreground',
      features: [
        'Everything in Mini Event',
        'Extended video uploads (up to 60s)',
        'Live TV & projector slideshow presentation mode',
        'Priority mobile upload queue',
        'Custom welcome message for attendees',
      ],
      cta: 'Select 10GB Plan',
      ctaHref: '/signup?plan=10gb',
    },
    {
      id: '30gb',
      name: 'Grand Celebration',
      capacity: 'Up to 600 guests',
      price: 'Rs. 999',
      numericPrice: 999,
      badge: '🔥 Most Popular for Weddings',
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      cardClass: 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 via-card to-card shadow-xl ring-1 ring-amber-500/30',
      buttonClass: 'bg-foreground text-background hover:bg-foreground/90 shadow-md',
      features: [
        'Everything in Celebration',
        'Original 4K photo & video preservation',
        'Custom QR code design with couple monogram',
        'Interactive live projector wall with reactions',
        'Top contributor stats & photographer leaderboard',
        'Multi-host moderation access',
      ],
      cta: 'Get Grand Celebration Plan',
      ctaHref: '/signup?plan=30gb',
      featured: true,
    },
    {
      id: '100gb',
      name: 'Mega Festival',
      capacity: 'Up to 2,000 guests',
      price: 'Rs. 1,999',
      numericPrice: 1999,
      badge: '✨ AI Photo Scan Included',
      badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      cardClass: 'border-purple-500/40 bg-gradient-to-b from-purple-500/5 via-card to-card shadow-lg ring-1 ring-purple-500/20',
      buttonClass: 'border border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 font-bold',
      ai: true,
      features: [
        'Everything in Grand Celebration',
        '✨ AI Smart Photo Scan (guests snap a selfie to find all their photos)',
        '1 Full Year cloud archival guarantee',
        'Automatic duplicate and blur detection',
        'Multi-screen live sync across large venues',
        'Direct bulk sync to Google Drive',
      ],
      cta: 'Select 100GB with AI Scan',
      ctaHref: '/signup?plan=100gb',
    },
    {
      id: '250gb',
      name: 'Royal Wedding & Multi-Day',
      capacity: 'Unlimited guests',
      price: 'Rs. 4,999',
      numericPrice: 4999,
      badge: '👑 Ultimate Multi-Event Vault',
      badgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
      cardClass: 'border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 text-white shadow-2xl',
      buttonClass: 'bg-amber-400 text-zinc-950 hover:bg-amber-300 font-bold shadow-lg',
      ai: true,
      features: [
        'Everything in Mega Festival',
        'Multi-Day & Sub-Event folders (Haldi, Sangeet, Wedding, Reception)',
        '✨ Advanced AI Face Match + Auto-Highlights album',
        'Custom event domain & white-label signage',
        'Dedicated event setup concierge',
        '2 Years permanent download vault link',
      ],
      cta: 'Select Royal 250GB Vault',
      ctaHref: '/signup?plan=250gb',
    },
  ]

  const faqs = [
    {
      q: 'Do guests need to download an app or create an account?',
      a: 'No. Guests simply point their phone camera at the table QR code and the camera opens instantly in their native mobile browser (Safari, Chrome, etc.). No app installation, no passwords, zero friction.',
    },
    {
      q: 'What happens if the venue Wi-Fi or mobile data is slow or intermittent?',
      a: 'Ekthau is engineered specifically for real-world event halls in Nepal. Photos save locally to the guest’s phone first and queue in the background. If cell reception drops, the upload pauses safely and resumes automatically when connection returns.',
    },
    {
      q: 'Are photos compressed or reduced in quality?',
      a: 'Original photos and videos are stored in 100% full uncompressed quality (10–25MB raw files, 4K videos). Lightweight previews are generated in the background so the live wall stays instant, while the full originals are preserved for your final ZIP download.',
    },
    {
      q: 'How does the Live Wall projector mode work?',
      a: 'As the host, you can open the Live Slideshow URL on any laptop connected to a projector, TV, or LED wall. As guests take photos around the room, new approved moments fade onto the big screen in real time.',
    },
    {
      q: 'Can I review and moderate photos before they appear on the big screen?',
      a: 'Yes. You can enable Host Moderation in your settings with one click. Photos will only appear on the public wall once you (or a designated co-host) tap "Approve" in your private dashboard.',
    },
    {
      q: 'How does the ✨ AI Photo Scan work?',
      a: 'On our 100GB and 250GB plans, guests can tap "Find My Photos" and snap a 1-second selfie. Our AI facial recognition instantly scans the entire event archive and generates a private album of every photo and video they appear in.',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-amber-500 selection:text-black font-sans antialiased">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-black flex items-center justify-center font-black shadow-md shadow-amber-500/20 transition-transform group-hover:scale-95">
              <Camera className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight leading-none text-foreground flex items-center gap-1.5">
                Ekthau
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  एकठाउँ
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                The Digital Disposable Camera
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#experience" className="hover:text-foreground transition-colors">
              The Experience
            </a>
            <a href="#live-wall" className="hover:text-foreground transition-colors">
              Live Wall
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setJoinModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <QrCode className="h-3.5 w-3.5 text-amber-500" />
              <span>Join Event</span>
            </button>

            {session ? (
              <Button asChild size="sm" className="rounded-xl font-bold text-xs h-9 px-4 bg-foreground text-background hover:bg-foreground/90 shadow-sm">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="rounded-xl font-semibold text-xs h-9 px-3.5 hidden sm:inline-flex">
                  <Link href="/login">Host Sign In</Link>
                </Button>
                <Button asChild size="sm" className="rounded-xl font-bold text-xs h-9 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20">
                  <Link href="/signup">Create Event</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION WITH EXPANDED LUXURY WIDTH */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
          {/* Subtle Ambient Warm Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-rose-500/5 to-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            {/* Header Copy */}
            <div className="max-w-4xl mx-auto text-center space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wider uppercase shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                Digital Disposable Camera for Real-World Events
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[1.05] text-balance">
                Your celebration, through{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600">
                  everyone’s eyes.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance">
                Give your guests a disposable camera in their phone browser. Place QR stands on tables, let guests snap raw candid moments, and watch memories stream live onto venue screens.
              </p>

              {/* Distinct Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-13 px-9 rounded-xl font-bold text-base bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-black/5 transition-all active:scale-98"
                >
                  <Link href="/signup">
                    Get Your Event Camera
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-7 rounded-xl font-bold text-base text-foreground bg-secondary/80 hover:bg-secondary border border-border transition-all active:scale-98"
                >
                  <QrCode className="h-4 w-4 text-amber-500" />
                  <span>Scan or Enter Code</span>
                </button>
              </div>

              {/* Trust statement */}
              <p className="text-xs sm:text-sm text-muted-foreground pt-3 font-medium flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                No app downloads required • 100% original raw quality • 1 GB free on every event
              </p>
            </div>

            {/* HERO VISUAL: EXPANDED DUAL SHOWCASE */}
            <div className="mt-14 sm:mt-20 w-full">
              <div className="grid md:grid-cols-12 gap-6 items-stretch">
                {/* Visual Left: Tabletop QR Stand */}
                <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-border/80 bg-zinc-950 shadow-2xl group min-h-[340px] md:min-h-[460px]">
                  <Image
                    src="/images/table-qr-stand.jpg"
                    alt="Elegant wedding table QR stand"
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  {/* Badge Overlay */}
                  <div className="absolute top-5 left-5 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white text-xs font-bold flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-amber-400" />
                    Table QR Pass
                  </div>

                  <div className="absolute bottom-5 inset-x-5 text-white space-y-1">
                    <p className="text-base font-bold">1. Placed on every guest table</p>
                    <p className="text-xs sm:text-sm text-zinc-300">Guests scan with their default phone camera to start snapping instantly</p>
                  </div>
                </div>

                {/* Visual Right: Phone Camera POV in Action */}
                <div className="md:col-span-7 relative rounded-3xl overflow-hidden border border-border/80 bg-zinc-950 shadow-2xl group min-h-[340px] md:min-h-[460px]">
                  <Image
                    src="/images/phone-camera-snap.jpg"
                    alt="Guest holding phone taking photos at wedding"
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Top live indicator */}
                  <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                    <div className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white text-xs font-bold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      In-Browser Camera • Shutter &lt; 50ms
                    </div>

                    <div className="hidden sm:flex bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-amber-300 text-xs font-bold">
                      100% Uncompressed Raw
                    </div>
                  </div>

                  <div className="absolute bottom-5 inset-x-5 text-white space-y-1">
                    <p className="text-base font-bold">2. Guests capture candid memories</p>
                    <p className="text-xs sm:text-sm text-zinc-300">Fast shutter, background upload queue, works even in patchy venue Wi-Fi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRODUCT PROOF METRICS BAR */}
        <section className="border-y border-border py-10 bg-muted/30">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">0 Apps</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Opens directly in Safari / Chrome</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">&lt; 50ms</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Instant shutter response</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">100% Raw</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Full original resolution preserved</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">1-Click ZIP</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Bulk download full event archive</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS (3-STEP EDITORIAL TIMELINE) */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Simple 3-Step Setup
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
                Zero friction. Maximum memories.
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                No more WhatsApp spam or broken Google Drive folders. Ekthau makes collecting event photography effortless.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 01 */}
              <div className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono font-black text-2xl">
                  01
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Create & Print QR Stands</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up your event in 30 seconds. Download customized high-res printable QR cards ready to display on dinner tables, cocktail bars, or entry signage.
                </p>
              </div>

              {/* Step 02 */}
              <div className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-mono font-black text-2xl">
                  02
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Guests Scan & Shoot</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Guests scan the QR code with their regular smartphone camera. The camera opens instantly in their browser. They snap candid photos without downloading any app.
                </p>
              </div>

              {/* Step 03 */}
              <div className="p-8 rounded-3xl border border-border bg-card shadow-xs space-y-5 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono font-black text-2xl">
                  03
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Stream Live & Download</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Moments stream in real-time to venue projector screens and guest mobile feeds. Once the party ends, download all full-resolution photos in 1 click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. IMMERSIVE LIVE WALL SHOWCASE (PROJECTOR MODE) */}
        <section id="live-wall" className="py-24 md:py-32 bg-zinc-950 text-white">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold tracking-wider uppercase">
                  <Tv className="h-3.5 w-3.5 text-amber-400" />
                  Venue Projector & TV Slideshow
                </div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  The event keeps moving. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
                    So does the live gallery.
                  </span>
                </h2>
                <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
                  Connect any laptop to a venue projector, big-screen TV, or LED wall. As guests snap photos from their tables, candid memories automatically fade onto the main screen in real time.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start">
                <Button asChild className="rounded-xl font-bold text-sm h-12 px-6 bg-white text-zinc-950 hover:bg-zinc-100 shadow-md">
                  <Link href="/signup">
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Launch Live Wall Demo
                  </Link>
                </Button>
              </div>
            </div>

            {/* Massive Ballroom Visual Image Showcase */}
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 aspect-[16/9] min-h-[400px] md:min-h-[600px] group">
              <Image
                src="/images/projector-live-wall.jpg"
                alt="Grand wedding celebration with massive live photo wall screen"
                fill
                priority
                className="object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

              {/* Status bar badge overlay */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-2.5 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-white text-xs sm:text-sm font-bold shadow-lg">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>NOW STREAMING LIVE • TABLE CANDIDS & REACTIONS</span>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-amber-300 text-xs sm:text-sm font-bold shadow-lg">
                  <Sliders className="h-4 w-4" />
                  <span>Host Moderation Active</span>
                </div>
              </div>

              {/* Bottom live stats */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-zinc-400 text-xs">Connected Guests</p>
                    <p className="text-white font-black text-base">214 Tables Active</p>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div>
                    <p className="text-zinc-400 text-xs">Photos Projected</p>
                    <p className="text-emerald-400 font-black text-base">1,248 Saved Live</p>
                  </div>
                </div>

                <p className="text-zinc-300 text-xs sm:text-sm">
                  ✨ Automatically rotates slides with smooth crossfades every 6 seconds
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. THE 4-PILLAR PRODUCT EXPERIENCE (WIDE GRID) */}
        <section id="experience" className="py-24 md:py-32">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                The Product Experience
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                Designed for real parties. Loved by everyone.
              </h2>
            </div>

            {/* 2x2 Feature Grid with Rich Imagery */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
              {/* Feature 1: No App Friction */}
              <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 space-y-6 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Zero App Downloads</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Guests point their phone at the table QR code and the camera opens instantly in their native mobile browser. No App Store downloads, no passwords, no signup friction.
                  </p>
                </div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border">
                  <Image
                    src="/images/table-qr-stand.jpg"
                    alt="Table QR stand"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Feature 2: ✨ AI Smart Photo Scan */}
              <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/5 via-card to-card p-8 sm:p-10 space-y-6 shadow-md flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    ✨ AI Smart Photo Scan
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300">
                      100GB+
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Guests take a 1-second selfie to find all the photos and videos they appear in across thousands of event uploads. No more endless scrolling.
                  </p>
                </div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-purple-500/20">
                  <Image
                    src="/images/ai-face-album.jpg"
                    alt="AI Face Scan Album Search"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Feature 3: Venue Resilience */}
              <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 space-y-4 shadow-xs">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <WifiOff className="h-6 w-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Engineered for Weak Signals</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Crowded party hall with patchy 3G/4G? Photos queue locally in the phone’s browser storage first. If reception drops, uploads pause safely and resume automatically as soon as connection is restored.
                </p>
              </div>

              {/* Feature 4: Full Uncompressed Originals */}
              <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 space-y-4 shadow-xs">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <HardDrive className="h-6 w-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">100% Original Raw Quality</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Unlike WhatsApp or social media that brutally compress your media, Ekthau preserves raw 10–25MB files and 4K videos. You receive crisp, print-ready photos for your wedding album.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PRICING SECTION (EXPANDED WIDE GRID) */}
        <section id="pricing" className="py-24 md:py-32 bg-muted/30 border-t border-border">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Transparent Pricing & Plans
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
                Simple plans based on your celebration size.
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Start with <strong className="text-foreground">1 GB completely free</strong>. Upgrade whenever you need more guest capacity, longer storage duration, or ✨ AI Face Search.
              </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-8 sm:p-9 flex flex-col justify-between transition-all ${plan.cardClass}`}
                >
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                      {plan.badge && (
                        <span className={`px-3 py-1 text-xs rounded-full font-bold border ${plan.badgeClass}`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price & Capacity */}
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight">
                          {plan.price}
                        </span>
                        {plan.numericPrice > 0 && (
                          <span className="text-sm font-medium text-muted-foreground">/ event</span>
                        )}
                      </div>
                      <p className="text-sm font-bold mt-1.5">{plan.capacity}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Storage info pill */}
                    <div className="p-3 rounded-xl bg-muted/60 border border-border/80 text-xs text-muted-foreground space-y-0.5">
                      <p className="font-semibold text-foreground">{plan.duration}</p>
                      <p>{plan.storage}</p>
                    </div>

                    {/* Features checklist */}
                    <div className="pt-2 space-y-3 text-xs sm:text-sm">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-muted-foreground">
                          <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span className={feat.includes('AI') ? 'font-bold text-foreground' : ''}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan Button */}
                  <div className="pt-8">
                    <Button
                      asChild
                      className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${plan.buttonClass}`}
                      variant={plan.featured ? 'default' : 'outline'}
                    >
                      <Link href={plan.ctaHref}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="py-24 md:py-32 border-t border-border">
          <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 space-y-12">
            <div className="space-y-3 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-border bg-card p-6 cursor-pointer transition-colors hover:border-amber-500/30"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-bold text-base sm:text-lg text-foreground">{faq.q}</h4>
                      <span className="font-bold text-amber-500 text-xl">
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed pt-3 border-t border-border">
                        {faq.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 9. FINAL EMOTIONAL CALL TO ACTION */}
        <section className="py-24 md:py-32 bg-zinc-950 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-zinc-950 to-zinc-950 pointer-events-none" />

          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8 relative z-10">
            <div className="max-w-4xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Capture the Full Story
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Don&apos;t let the hired photographer be the only one capturing the night.
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Give everyone at your celebration a shared disposable camera. Create your event space in 30 seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto h-13 px-9 rounded-xl text-base font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20">
                <Link href="/signup">
                  Create Your Event Space
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <button
                onClick={() => setJoinModalOpen(true)}
                className="text-sm font-semibold text-zinc-400 hover:text-white underline underline-offset-4 transition-colors py-2 px-3"
              >
                I&apos;m a guest with an event code →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 10. FOOTER */}
      <footer className="border-t border-border py-14 bg-background text-xs sm:text-sm text-muted-foreground">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="h-7 w-7 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black">
              <Camera className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
            <span>Ekthau (एकठाउँ) • The Digital Disposable Camera</span>
          </div>

          <div className="flex items-center gap-8">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link href="/join" className="hover:text-foreground transition-colors">
              Join Event
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Host Sign In
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Ekthau. Built for moments that shouldn&apos;t be lost.</p>
        </div>
      </footer>

      {/* Global Join Event Modal */}
      <JoinEventModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </div>
  )
}
