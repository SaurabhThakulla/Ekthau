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
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { mockEvents } from '@/lib/mockData'

export default function LandingPage() {
  const { session } = useAuth()
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const sampleMoments = [
    {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
      guest: 'Suman K.',
      table: 'Table 4',
      caption: 'First toast to the couple!',
      time: 'Just now',
    },
    {
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
      guest: 'Anjali P.',
      table: 'Family Row',
      caption: 'Pure joy on the stage ✨',
      time: '2m ago',
    },
    {
      url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=1200&auto=format&fit=crop',
      guest: 'Rohan D.',
      table: 'Dance Floor',
      caption: 'The energy right now is insane',
      time: '4m ago',
    },
    {
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop',
      guest: 'Pooja T.',
      table: 'Lounge',
      caption: 'Reunion after 6 years',
      time: '7m ago',
    },
  ]

  const pricingPlans = [
    {
      id: 'free',
      name: 'Starter',
      capacity: 'Up to 30 guests',
      price: 'Free',
      numericPrice: 0,
      description: 'Ideal for intimate family dinners, small birthday lunches, or trying out Ekthau.',
      duration: '30 days online access',
      storage: '1 GB storage (~350 photos)',
      featured: false,
      ai: false,
      features: [
        'Browser-based camera (zero app download)',
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
      description: 'Perfect for engagement parties, birthday bashes, and private dinners.',
      duration: '60 days (2 months) storage',
      storage: '5 GB storage (~1,500 photos & clips)',
      featured: false,
      ai: false,
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
      description: 'Built for wedding receptions, milestone anniversaries, and reunions.',
      duration: '90 days (3 months) storage',
      storage: '10 GB storage (~3,500 photos & videos)',
      featured: false,
      ai: false,
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
      badge: 'Recommended for Weddings',
      description: 'The standard choice for full-scale weddings and large party gatherings.',
      duration: '180 days (6 months) storage',
      storage: '30 GB storage (~10,000 photos & 4K clips)',
      featured: true,
      ai: false,
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
    },
    {
      id: '100gb',
      name: 'Mega Festival',
      capacity: 'Up to 2,000 guests',
      price: 'Rs. 1,999',
      numericPrice: 1999,
      badge: '✨ AI Face Search Included',
      description: 'For college festivals, multi-day concerts, and large conventions.',
      duration: '1 Full Year (365 days) storage',
      storage: '100 GB storage (~35,000 photos & videos)',
      featured: false,
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
      description: 'For traditional multi-day weddings with Haldi, Sangeet, Wedding, and Reception.',
      duration: '2 Years Permanent Archival',
      storage: '250 GB storage (~90,000 photos & 4K media)',
      featured: false,
      ai: true,
      features: [
        'Everything in Mega Festival',
        'Multi-Day & Sub-Event folders (Haldi, Sangeet, Wedding, Reception)',
        '✨ Advanced AI Face Match + Auto-Highlights album',
        'Custom event domain & white-label signage',
        'Dedicated event setup concierge',
        'Permanent download vault link',
      ],
      cta: 'Select Royal 250GB Vault',
      ctaHref: '/signup?plan=250gb',
    },
  ]

  const faqs = [
    {
      q: 'Do guests need to download an app or create an account?',
      a: 'No. Guests simply point their phone camera at the table QR code and the camera opens instantly in their native mobile browser (Safari, Chrome, etc.). No app installation, no passwords, no App Store friction.',
    },
    {
      q: 'What happens if the venue Wi-Fi or mobile data is slow or intermittent?',
      a: 'Ekthau is engineered specifically for real-world event venues. When a guest takes a photo, it is saved instantly on their device and queues in the background. If cell reception drops, the upload pauses safely and resumes automatically as soon as connection is restored. Guests never have to wait or stare at an upload bar.',
    },
    {
      q: 'Are photos compressed or reduced in quality?',
      a: 'The original photos and videos are stored in 100% full original resolution (10–25MB raw JPEGs, 4K videos). Ekthau simultaneously generates lightweight web previews in the background so the live wall stays fast, while preserving the full-fidelity originals for your final download archive.',
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
      q: 'How do I get the photos after the event ends?',
      a: 'You can download the entire full-resolution archive as a single ZIP file at any time from your host dashboard. Depending on your plan, photos remain safely preserved for up to 2 years.',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background font-sans antialiased">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4 max-w-7xl">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center font-black transition-transform group-hover:scale-95">
              <Camera className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none text-foreground">
                Ekthau
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                एकठाउँ • Disposable Camera
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Join with Code</span>
            </button>

            {session ? (
              <Button asChild size="sm" className="rounded-lg font-semibold text-xs h-9 px-3.5">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="rounded-lg font-medium text-xs h-9 px-3 hidden sm:inline-flex">
                  <Link href="/login">Host Sign In</Link>
                </Button>
                <Button asChild size="sm" className="rounded-lg font-semibold text-xs h-9 px-4 bg-foreground text-background hover:bg-foreground/90">
                  <Link href="/signup">Create Event</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative pt-12 pb-16 md:pt-24 md:pb-28 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            {/* Header Content */}
            <div className="max-w-3xl mx-auto text-center space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-foreground text-xs font-semibold tracking-wider uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                The Digital Disposable Camera for Events
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.08] text-balance">
                Your celebration, through everyone&apos;s eyes.
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
                Give your guests a disposable camera right in their phone browser. Scan a table QR code, snap raw candid moments, and watch memories stream into a shared gallery in real time.
              </p>

              {/* Distinct Hero CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 shadow-md transition-all active:scale-98"
                >
                  <Link href="/signup">
                    Get Your Event Camera
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <button
                  onClick={() => setJoinModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-semibold text-sm text-foreground bg-secondary/80 hover:bg-secondary border border-border transition-all active:scale-98"
                >
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <span>Scan or Enter Code</span>
                </button>
              </div>

              {/* Trust statement */}
              <p className="text-xs text-muted-foreground pt-4 font-medium">
                No app installation required • 100% original photo quality • 1 GB free on every celebration
              </p>
            </div>

            {/* HERO VISUAL: EDITORIAL PRODUCT SHOWCASE */}
            <div className="mt-14 sm:mt-20 max-w-5xl mx-auto">
              <div className="relative rounded-3xl p-3 sm:p-4 bg-muted/50 border border-border/80 shadow-2xl">
                {/* Main Visual Frame */}
                <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-[16/10] sm:aspect-[21/10] flex items-center justify-center">
                  <Image
                    src="/images/live-wall.jpg"
                    alt="Live wedding celebration photo wall"
                    fill
                    priority
                    className="object-cover brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                  {/* Overlaid UI Elements */}
                  <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between z-10 pointer-events-none">
                    {/* Top status bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white text-xs font-semibold">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live Event Wall • Sita & Ramesh Wedding
                      </div>

                      <div className="hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-300">
                        <Users className="h-3.5 w-3.5 text-blue-400" />
                        <span>142 Guests Connected</span>
                      </div>
                    </div>

                    {/* Bottom strip of candid incoming photos */}
                    <div className="space-y-3">
                      <div className="hidden md:flex items-center justify-between text-white text-xs font-medium">
                        <span>Latest Guest Captures</span>
                        <span className="text-zinc-400">Streaming live from Table QR passes</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {sampleMoments.map((moment, i) => (
                          <div
                            key={i}
                            className="relative h-24 sm:h-32 rounded-xl overflow-hidden border border-white/15 shadow-md bg-black/40 group"
                          >
                            <Image
                              src={moment.url}
                              alt={moment.caption}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 inset-x-2 text-[11px] text-white flex items-center justify-between">
                              <span className="font-semibold truncate">{moment.guest}</span>
                              <span className="text-[10px] text-zinc-300 font-mono">{moment.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRODUCT PROOF BAR */}
        <section className="border-y border-border py-8 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">0 Apps</p>
                <p className="text-xs text-muted-foreground mt-0.5">Works directly in mobile browser</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">&lt; 50ms</p>
                <p className="text-xs text-muted-foreground mt-0.5">Instant camera shutter speed</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">100% Raw</p>
                <p className="text-xs text-muted-foreground mt-0.5">Original quality preserved</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">1-Click ZIP</p>
                <p className="text-xs text-muted-foreground mt-0.5">Bulk download all event media</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS (3-STEP EDITORIAL TIMELINE) */}
        <section id="how-it-works" className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-16">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                Simple by design. No friction.
              </h2>
              <p className="text-muted-foreground text-base">
                Chasing guests on WhatsApp or sharing clunky Google Drive folders never works. Ekthau makes capturing and sharing effortless in 3 steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {/* Step 01 */}
              <div className="space-y-4 border-t border-border pt-6">
                <span className="text-4xl font-black text-muted-foreground/40 font-mono">01</span>
                <h3 className="text-xl font-bold tracking-tight">Create your event space</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up your celebration in 30 seconds. Ekthau generates your event page along with high-resolution printable QR table cards ready to stand on dinner tables or bar counters.
                </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-4 border-t border-border pt-6">
                <span className="text-4xl font-black text-muted-foreground/40 font-mono">02</span>
                <h3 className="text-xl font-bold tracking-tight">Guests scan & snap</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Guests point their default smartphone camera at the table QR code. The camera opens instantly in their browser. They snap candid photos without signing up or installing an app.
                </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-4 border-t border-border pt-6">
                <span className="text-4xl font-black text-muted-foreground/40 font-mono">03</span>
                <h3 className="text-xl font-bold tracking-tight">Relive every moment live</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Photos stream live into a shared gallery and on venue projector screens. Once the event ends, download the entire full-resolution archive in a single click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PRODUCT EXPERIENCE SPOTLIGHT (SPLIT FEATURE) */}
        <section id="experience" className="py-20 md:py-28 bg-muted/25 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Image & Mockup */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-5 shadow-lg space-y-4">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-zinc-950">
                    <Image
                      src="/images/auth-hero.jpg"
                      alt="Guests snapping candid photos"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white font-medium border border-white/10">
                      In-Browser Camera • No App Needed
                    </div>
                  </div>

                  {/* Upload State pill indicator */}
                  <div className="p-3.5 rounded-2xl bg-muted border border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">12 photos captured</p>
                        <p className="text-[11px] text-muted-foreground">Uploading in background</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-muted-foreground">100% saved</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Copy & Value */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Guest Experience
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                    A disposable camera everyone already has in their pocket.
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Most people don&apos;t want to download a dedicated app just for a 4-hour wedding. Ekthau removes all barrier to entry by using the browser guests already trust.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5">
                    <div className="h-8 w-8 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Zero App Downloads</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        Works on any iPhone or Android camera. Guests scan and shoot in seconds.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-8 w-8 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
                      <WifiOff className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Made for Real-World Venues</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        Crowded wedding hall with weak signal? Photos save locally on the device first, pausing and resuming automatically without losing moments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="h-8 w-8 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
                      <Sliders className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Host Moderation Controls</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        You decide what goes on the big screen. Approve or hide photos with a single tap from your host dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setJoinModalOpen(true)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-foreground hover:opacity-80 underline underline-offset-4"
                  >
                    <span>Test the Guest Experience Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. LIVE WALL SECTION */}
        <section id="live-wall" className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
              <div className="max-w-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  The Live Wall
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                  The event keeps moving. So does the gallery.
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Connect your laptop to any venue projector or TV screen. As guests take photos around the room, candid moments appear live on the big screen.
                </p>
              </div>

              <Button asChild variant="outline" className="rounded-xl font-semibold self-start border-border hover:bg-muted">
                <Link href="/signup">
                  <Tv className="mr-2 h-4 w-4 text-muted-foreground" />
                  Launch Projector Mode
                </Link>
              </Button>
            </div>

            {/* Live Wall Visual Demo */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sampleMoments.map((moment, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs group flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    <Image
                      src={moment.url}
                      alt={moment.caption}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-semibold text-foreground italic">&ldquo;{moment.caption}&rdquo;</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                      <span className="font-bold text-foreground">{moment.guest}</span>
                      <span>{moment.table}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. ORIGINAL QUALITY & PRESERVATION */}
        <section className="py-16 md:py-24 bg-zinc-950 text-white">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  Full Resolution Storage
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  Keep the moment. Keep the original quality.
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                  Unlike WhatsApp or social media that heavily compress your media, Ekthau preserves the raw 10–25MB files and 4K videos. You get crisp, print-ready photos for your wedding album.
                </p>
              </div>

              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                    <span>Original Raw Capture</span>
                    <span className="text-emerald-400 font-bold">100% Uncompressed</span>
                  </div>
                  <p className="text-xs text-zinc-300">Saved for your full-resolution final ZIP archive</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                    <span>Live Web Previews</span>
                    <span className="text-blue-400 font-bold">Instant Stream</span>
                  </div>
                  <p className="text-xs text-zinc-300">Optimized derivatives keep the live wall fast on mobile</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. OCCASIONS / USE CASES */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-12">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Occasions
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                Crafted for every meaningful gathering.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Weddings & Receptions',
                  desc: 'Catch every perspective from every table that the official photographer couldn’t reach.',
                  tag: 'Most Popular',
                },
                {
                  title: 'Milestone Birthdays',
                  desc: 'Collect hilarious selfies, group laughs, and candid moments into one shared digital album.',
                  tag: 'Parties',
                },
                {
                  title: 'College & Alumni Fests',
                  desc: 'Stream crowd energy, stage performances, and reunions directly onto venue screens.',
                  tag: 'Festivals',
                },
                {
                  title: 'Corporate Summits & Galas',
                  desc: 'Display attendee engagement and real-time event moments on mainstage displays.',
                  tag: 'Corporate',
                },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                    {item.tag}
                  </span>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. PRICING SECTION (EVENT-CENTRIC WITH DISTINCT BUTTONS) */}
        <section id="pricing" className="py-20 md:py-28 bg-muted/20 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Pricing & Event Plans
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                Simple plans based on your celebration size.
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Start with <strong className="text-foreground">1 GB completely free</strong>. Upgrade whenever you need more guest capacity, longer storage duration, or ✨ AI Face Search.
              </p>
            </div>

            {/* Pricing Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all bg-card border ${
                    plan.featured
                      ? 'border-foreground shadow-xl ring-1 ring-foreground/20'
                      : 'border-border shadow-xs hover:border-border/80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold tracking-tight">{plan.name}</h3>
                      {plan.badge && (
                        <span className="px-2.5 py-0.5 text-[11px] rounded-full font-bold bg-foreground/10 text-foreground border border-border">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price & Capacity */}
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                          {plan.price}
                        </span>
                        {plan.numericPrice > 0 && (
                          <span className="text-xs font-medium text-muted-foreground">/ event</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-foreground mt-1">{plan.capacity}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Storage info pill */}
                    <div className="p-2.5 rounded-xl bg-muted border border-border/80 text-[11px] text-muted-foreground space-y-0.5">
                      <p className="font-semibold text-foreground">{plan.duration}</p>
                      <p>{plan.storage}</p>
                    </div>

                    {/* Features checklist */}
                    <div className="pt-2 space-y-2.5 text-xs">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-foreground shrink-0 mt-0.5" />
                          <span className={feat.includes('AI') ? 'font-bold text-foreground' : ''}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan Button */}
                  <div className="pt-6">
                    <Button
                      asChild
                      className={`w-full h-11 rounded-xl text-xs font-bold transition-all ${
                        plan.featured
                          ? 'bg-foreground text-background hover:bg-foreground/90 shadow-sm'
                          : plan.ai
                          ? 'border border-purple-500/40 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10'
                          : 'border border-border bg-background hover:bg-muted text-foreground'
                      }`}
                      variant={plan.featured ? 'default' : 'outline'}
                    >
                      <Link href={plan.ctaHref}>
                        {plan.cta}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="py-20 md:py-28 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-12">
            <div className="space-y-3 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-border bg-card p-5 cursor-pointer transition-colors hover:border-border/80"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-bold text-sm sm:text-base text-foreground">{faq.q}</h4>
                      <span className="font-bold text-muted-foreground text-base">
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border">
                        {faq.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 11. FINAL EMOTIONAL CALL TO ACTION */}
        <section className="py-20 md:py-28 bg-zinc-950 text-white text-center">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Don&apos;t let the hired photographer be the only one capturing the night.
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Give everyone at your celebration a shared disposable camera. Create your event space in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl text-base font-bold bg-white text-black hover:bg-white/90 shadow-lg">
                <Link href="/signup">
                  Start Your Event in 30s
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <button
                onClick={() => setJoinModalOpen(true)}
                className="text-xs font-semibold text-zinc-400 hover:text-white underline underline-offset-4 transition-colors py-2 px-3"
              >
                I&apos;m a guest with an event code →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 12. FOOTER */}
      <footer className="border-t border-border py-12 bg-background text-xs text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="h-6 w-6 rounded-lg bg-foreground text-background flex items-center justify-center font-black">
              <Camera className="h-3 w-3" />
            </div>
            <span>Ekthau • The Digital Disposable Camera</span>
          </div>

          <div className="flex items-center gap-6">
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
