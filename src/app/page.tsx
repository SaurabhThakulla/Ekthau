'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import JoinEventModal from '@/components/JoinEventModal'
import {
  Camera,
  QrCode,
  Sparkles,
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
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { mockEvents } from '@/lib/mockData'

export default function LandingPage() {
  const { session } = useAuth()
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'guest' | 'host'>('guest')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const samplePhotos = [
    {
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
      guest: 'Suman K.',
      time: 'Just now',
      tag: 'Candid',
    },
    {
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
      guest: 'Anjali P.',
      time: '2m ago',
      tag: 'Stage',
    },
    {
      url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop',
      guest: 'Rohan D.',
      time: '5m ago',
      tag: 'Dance Floor',
    },
    {
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop',
      guest: 'Pooja T.',
      time: '8m ago',
      tag: 'Dinner',
    },
  ]

  const pricingPlans = [
    {
      id: 'free',
      name: 'Starter',
      storage: '1 GB',
      approxPhotos: '~350 Photos',
      price: 'Free',
      numericPrice: 0,
      badge: 'Free Forever',
      badgeColor: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      duration: '30 Days Storage',
      durationDetail: 'Photos stored securely for 30 days after event creation',
      guestLimit: 'Up to 30 Guests',
      aiScan: false,
      popular: false,
      features: [
        '1 GB Cloud Storage (~350 photos)',
        '30 Days storage retention',
        'Up to 30 guests',
        'Standard in-browser camera',
        'Printable QR code pass (PNG)',
        'Real-time live mobile gallery',
        '1-Click bulk ZIP download',
      ],
      cta: 'Get Started Free',
      ctaHref: '/signup',
      highlight: false,
    },
    {
      id: '5gb',
      name: 'Mini Event',
      storage: '5 GB',
      approxPhotos: '~1,500 Photos & Clips',
      price: 'Rs. 99',
      numericPrice: 99,
      badge: 'Starter Plus',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      duration: '60 Days Storage',
      durationDetail: 'Photos stored for 2 full months (60 days)',
      guestLimit: 'Up to 100 Guests',
      aiScan: false,
      popular: false,
      features: [
        '5 GB Cloud Storage (~1,500 items)',
        '60 Days (2 months) storage retention',
        'Up to 100 guests',
        'Original HD quality photo uploads',
        'Short video clips (up to 30s)',
        'Host moderation panel',
        'Customized venue and event info',
        '1-Click full resolution archive',
      ],
      cta: 'Choose 5GB Plan',
      ctaHref: '/signup?plan=5gb',
      highlight: false,
    },
    {
      id: '10gb',
      name: 'Celebration',
      storage: '10 GB',
      approxPhotos: '~3,500 Photos & Videos',
      price: 'Rs. 499',
      numericPrice: 499,
      badge: 'Popular for Parties',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      duration: '90 Days Storage',
      durationDetail: 'Photos stored for 3 full months (90 days)',
      guestLimit: 'Up to 250 Guests',
      aiScan: false,
      popular: false,
      features: [
        '10 GB Cloud Storage (~3,500 items)',
        '90 Days (3 months) storage retention',
        'Up to 250 guests',
        'High-bitrate video clips (up to 60s)',
        'Live TV & projector slideshow mode',
        'Priority mobile upload processing',
        'Host pre-approval moderation',
        'Custom welcome banner for guests',
      ],
      cta: 'Choose 10GB Plan',
      ctaHref: '/signup?plan=10gb',
      highlight: false,
    },
    {
      id: '30gb',
      name: 'Grand Celebration',
      storage: '30 GB',
      approxPhotos: '~10,000 Photos & 4K Clips',
      price: 'Rs. 999',
      numericPrice: 999,
      badge: '🔥 Best Value for Weddings',
      badgeColor: 'bg-primary text-primary-foreground border-primary font-black',
      duration: '180 Days Storage',
      durationDetail: 'Photos stored for 6 full months (180 days)',
      guestLimit: 'Up to 600 Guests',
      aiScan: false,
      popular: true,
      features: [
        '30 GB Cloud Storage (~10,000 items)',
        '180 Days (6 months) storage retention',
        'Up to 600 guests',
        'Full 4K original quality uploads',
        'Custom QR code with couple monogram',
        'Live projector wall with reactions',
        'Top contributor stats & leaderboard',
        'Multi-device host moderation access',
        'Unlimited raw ZIP downloads',
      ],
      cta: 'Get Grand Celebration',
      ctaHref: '/signup?plan=30gb',
      highlight: true,
    },
    {
      id: '100gb',
      name: 'Mega Festival',
      storage: '100 GB',
      approxPhotos: '~35,000 Photos & 4K Videos',
      price: 'Rs. 1,999',
      numericPrice: 1999,
      badge: '✨ AI Photo Scan Included',
      badgeColor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 font-bold',
      duration: '1 Year (365 Days) Storage',
      durationDetail: 'Photos stored for 1 full year with zero expiration worries',
      guestLimit: 'Up to 2,000 Guests',
      aiScan: true,
      popular: false,
      features: [
        '100 GB Cloud Storage (~35,000 items)',
        '1 Year (365 days) cloud retention',
        'Up to 2,000 guests',
        '✨ AI Smart Photo Scan & Face Match',
        'Guests snap selfie to find all their photos',
        'Automatic duplicate & blur filter',
        'Multi-screen sync for big venues',
        'Direct auto-export to Google Drive',
        'VIP high-speed upload bandwidth',
      ],
      cta: 'Get 100GB with AI Scan',
      ctaHref: '/signup?plan=100gb',
      highlight: false,
    },
    {
      id: '250gb',
      name: 'Royal Wedding & Multi-Day',
      storage: '250 GB',
      approxPhotos: '~90,000 Photos & 4K Videos',
      price: 'Rs. 4,999',
      numericPrice: 4999,
      badge: '👑 Ultimate VIP & Multi-Event',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-extrabold',
      duration: '2 Years Storage (Permanent Archive)',
      durationDetail: 'Photos stored safely for 2 full years with permanent download vault',
      guestLimit: 'Unlimited Guests',
      aiScan: true,
      popular: false,
      features: [
        '250 GB Cloud Storage (~90,000 items)',
        '2 Years (730 days) permanent archival',
        'Unlimited guests & contributors',
        '✨ Advanced AI Face Match + Auto-Highlights',
        'Smart "Best Moments" album generator',
        'Multi-Day & Sub-Event folders (Haldi, Sangeet, Wedding, Reception)',
        'Custom domain & white-label QR stand',
        'Dedicated event concierge support',
        'Lifetime high-speed download link',
      ],
      cta: 'Get Royal 250GB Plan',
      ctaHref: '/signup?plan=250gb',
      highlight: false,
    },
  ]

  const faqs = [
    {
      q: 'How long are my event photos and videos stored?',
      a: 'Storage duration scales with your chosen plan: 30 days for Free (1GB), 60 days for 5GB, 90 days (3 months) for 10GB, 180 days (6 months) for 30GB, 1 full year for 100GB, and 2 full years for 250GB. You can download the entire full-resolution archive in 1-click at any time during your storage period.',
    },
    {
      q: 'How does the AI Photo Scan work in 100GB and 250GB plans?',
      a: 'With AI Photo Scan, guests can take a quick selfie to instantly scan the thousands of photos uploaded by everyone and pull up only the pictures and videos they appear in! It saves guests from scrolling through thousands of photos to find their memories.',
    },
    {
      q: 'Do guests need to install an app or pay anything?',
      a: 'Never! Guests simply point their smartphone camera at the table QR code and the camera opens instantly in their mobile web browser. Zero app downloads, zero account setup required.',
    },
    {
      q: 'Can I upgrade my storage during or after the event?',
      a: 'Yes! If you start on the Free or a smaller tier and need more storage or want to extend retention, you can upgrade with 1 click from your host dashboard without losing any photos or changing your event QR code.',
    },
    {
      q: 'Are the photos uploaded in original resolution?',
      a: 'Yes! Unlike chat apps that heavily compress your media, Ekthau preserves high-fidelity originals so you have crisp, print-ready photos and full-HD / 4K videos.',
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* 1. TOP STICKY NAVBAR */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4 max-w-7xl">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-2xl tracking-tighter hover:opacity-90 transition-opacity">
            <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
              <Camera className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-2">
              Ekthau
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors font-semibold text-primary">
              Pricing & Plans
            </a>
            <a href="#live-demo" className="hover:text-foreground transition-colors">
              Live Demo
            </a>
            <a href="#event-types" className="hover:text-foreground transition-colors">
              Events
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJoinModalOpen(true)}
              className="rounded-xl font-semibold border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 text-xs sm:text-sm h-10"
            >
              <QrCode className="h-4 w-4 sm:mr-1.5 text-primary" />
              <span className="hidden sm:inline">Join Event</span>
              <span className="sm:hidden">Join</span>
            </Button>

            {session ? (
              <Button asChild size="sm" className="rounded-xl font-bold shadow-md shadow-primary/20 text-xs sm:text-sm h-10">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="rounded-xl font-semibold text-xs sm:text-sm hidden sm:inline-flex">
                  <Link href="/login">Host Sign In</Link>
                </Button>
                <Button asChild size="sm" className="rounded-xl font-bold shadow-md shadow-primary/25 text-xs sm:text-sm h-10">
                  <Link href="/signup">Create Event</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Header Text */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Effortless Event Photo & Video Sharing
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              Capture every perspective of your celebration.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Place a QR code on tables. Guests scan, snap candid photos & videos, and watch memories stream live into a shared gallery — <strong className="text-foreground">zero apps to install</strong>.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto h-13 px-8 rounded-2xl text-base font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all">
                <Link href="/signup">
                  Create Your Free Event
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setJoinModalOpen(true)}
                className="w-full sm:w-auto h-13 px-7 rounded-2xl text-base font-bold border-2 hover:bg-muted/80 transition-all"
              >
                <QrCode className="mr-2 h-5 w-5 text-primary" />
                Join with Code or QR
              </Button>
            </div>

            {/* Social Proof Mini */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                1GB Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Real-time instant stream
              </span>
              <span className="flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-purple-500" />
                AI Photo Scan on Pro plans
              </span>
            </div>
          </div>

          {/* 3. HERO VISUAL / MOCKUP */}
          <div className="mt-14 sm:mt-20 relative max-w-5xl mx-auto">
            <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-border/80 via-border/30 to-border/10 border shadow-2xl backdrop-blur-xl">
              <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center">
                <Image
                  src="/images/live-wall.jpg"
                  alt="Live wedding photo slideshow wall"
                  fill
                  priority
                  className="object-cover brightness-75 hover:scale-105 transition-transform duration-10000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

                {/* Overlaid Floating Feature Cards */}
                <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between z-10 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white text-xs font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      Live Slideshow Mode • Sita & Ramesh Wedding
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-300 font-mono">
                      <Users className="h-3.5 w-3.5 text-blue-400" />
                      142 Guests Connected
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="hidden md:flex items-center justify-between text-white text-xs font-bold">
                      <span>Recent Guest Moments</span>
                      <span className="text-zinc-400 font-normal">Streaming in 4K original quality</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {samplePhotos.map((photo, i) => (
                        <div
                          key={i}
                          className="relative h-24 sm:h-32 rounded-2xl overflow-hidden border border-white/20 shadow-lg group backdrop-blur-md bg-black/40"
                        >
                          <Image
                            src={photo.url}
                            alt={photo.guest}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[11px] text-white">
                            <span className="font-bold truncate">{photo.guest}</span>
                            <span className="text-[10px] text-zinc-300">{photo.time}</span>
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

      {/* 4. PRICING & STORAGE PLANS SECTION (NEW SPECIFICATIONS) */}
      <section id="pricing" className="py-20 md:py-28 bg-muted/30 border-y relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-widest">
              <HardDrive className="h-3.5 w-3.5" />
              Transparent Storage & Event Plans
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Flexible Plans for Every Celebration
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Start with <strong className="text-foreground">1 GB completely free</strong>. Upgrade whenever you need more storage, longer cloud retention, or our ✨ AI Face Scan.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all bg-card border ${
                  plan.popular
                    ? 'border-primary shadow-2xl ring-2 ring-primary/20 scale-[1.02]'
                    : plan.aiScan
                    ? 'border-purple-500/40 shadow-lg hover:border-purple-500'
                    : 'shadow-sm hover:shadow-md hover:border-primary/40'
                }`}
              >
                {/* Popular / AI Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs rounded-full border ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>

                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {plan.storage}
                  </span>
                </div>

                {/* Plan Header */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>

                  {/* Price display */}
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    {plan.numericPrice > 0 && (
                      <span className="text-xs font-semibold text-muted-foreground">/ event</span>
                    )}
                  </div>

                  {/* Storage Retention & Details */}
                  <div className="p-3 rounded-2xl bg-muted/60 border space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{plan.duration}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {plan.durationDetail}
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div className="py-6 space-y-3 flex-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Included in this plan:
                  </span>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    {plan.features.map((feat, idx) => {
                      const isAi = feat.includes('AI') || feat.includes('✨')
                      return (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check
                            className={`h-4 w-4 shrink-0 mt-0.5 ${
                              isAi ? 'text-purple-500 font-bold' : 'text-emerald-500'
                            }`}
                          />
                          <span
                            className={
                              isAi ? 'font-bold text-purple-400 dark:text-purple-300' : 'text-foreground/90'
                            }
                          >
                            {feat}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <Button
                    asChild
                    className={`w-full h-12 rounded-2xl text-sm font-bold shadow-md ${
                      plan.popular
                        ? 'shadow-primary/30'
                        : plan.aiScan
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/20'
                        : ''
                    }`}
                    variant={plan.popular || plan.aiScan ? 'default' : 'outline'}
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

          {/* AI Feature Callout Banner */}
          <div className="mt-14 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/60 via-zinc-950 to-pink-950/40 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0">
                <Bot className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xl text-white">
                    ✨ AI Smart Photo Scan on 100GB & 250GB Plans
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  Guests snap a quick 1-second selfie to automatically locate every photo and video they appear in across thousands of uploads.
                </p>
              </div>
            </div>

            <Button asChild className="rounded-xl h-11 px-6 font-bold bg-purple-600 hover:bg-purple-700 text-white shrink-0 shadow-lg shadow-purple-600/30">
              <Link href="/signup?plan=100gb">
                Explore AI Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 Simple Steps) */}
      <section id="how-it-works" className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              How Ekthau Works
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Say goodbye to chasing guests on WhatsApp or sharing clunky Google Drive links.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
              <div className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="text-xl font-bold tracking-tight">Create & Print QR Code</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Set up your event in 30 seconds. Download elegant, customized printable QR table cards and signage ready for your venue.
                </p>
              </div>
              <div className="pt-4 border-t flex items-center gap-2 text-xs font-semibold text-primary">
                <QrCode className="h-4 w-4" />
                Instant Printable PNG
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
              <div className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="text-xl font-bold tracking-tight">Guests Scan & Snap</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Guests simply open their native phone camera, scan the table QR code, and snap photos directly through their browser.
                </p>
              </div>
              <div className="pt-4 border-t flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <Camera className="h-4 w-4" />
                No App Download Needed
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-card border rounded-3xl p-8 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
              <div className="space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="text-xl font-bold tracking-tight">Live Stream & Archive</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Watch candid moments pop up live on your venue projector or phone. Download full-resolution media in a single click after the event.
                </p>
              </div>
              <div className="pt-4 border-t flex items-center gap-2 text-xs font-semibold text-purple-600">
                <Download className="h-4 w-4" />
                1-Click Full-Res ZIP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE LIVE EXPERIENCE PREVIEW */}
      <section id="live-demo" className="py-20 md:py-28 bg-muted/20 border-t">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Dual Experience
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Crafted for both Guests and Hosts
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Toggle below to see how seamless the experience is for your party guests and for you as the event organizer.
            </p>

            <div className="inline-flex p-1.5 rounded-2xl bg-muted border gap-2 mt-4">
              <button
                onClick={() => setActiveTab('guest')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'guest'
                    ? 'bg-background shadow-md text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Guest View (Mobile Browser)
              </button>
              <button
                onClick={() => setActiveTab('host')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'host'
                    ? 'bg-background shadow-md text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Host View (Dashboard & Mod)
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center bg-card border rounded-3xl p-6 sm:p-12 shadow-xl">
            {activeTab === 'guest' ? (
              <>
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Zero Friction Guest Onboarding
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Instant in-browser camera with offline queue resilience.
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Guests don&apos;t have to make accounts or fill lengthy forms. They scan, enter their name (or stay anonymous), and start taking candid shots with real-time compression.
                  </p>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span><strong>Fast Client-Side Compression</strong> — snappy uploads even on crowded mobile networks.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <WifiOff className="h-4 w-4" />
                      </div>
                      <span><strong>Offline Upload Queue</strong> — keeps photos safe in IndexedDB if signal drops.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Images className="h-4 w-4" />
                      </div>
                      <span><strong>Live Shared Gallery</strong> — guests can view everyone&apos;s photos in real-time.</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Button onClick={() => setJoinModalOpen(true)} className="rounded-xl font-bold h-11 px-6">
                      <Play className="h-4 w-4 mr-2" />
                      Try Guest Camera Demo
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6 flex justify-center">
                  <div className="relative w-[300px] h-[580px] bg-zinc-950 rounded-[44px] border-[6px] border-zinc-800 p-3 shadow-2xl flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-zinc-800 rounded-b-2xl z-20" />

                    <div className="relative flex-1 rounded-3xl overflow-hidden bg-zinc-900 flex flex-col justify-between p-4 text-white">
                      <Image
                        src="/images/auth-hero.jpg"
                        alt="Guest camera view"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                      <div className="relative z-10 flex justify-between items-center text-xs">
                        <span className="font-bold">Sita & Ramesh Wedding</span>
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-emerald-400 font-mono">
                          LIVE
                        </span>
                      </div>

                      <div className="relative z-10 flex items-center justify-around pt-4">
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <div className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center">
                          <div className="h-12 w-12 bg-white rounded-full" />
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <Sparkles className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    <Sliders className="h-3.5 w-3.5" />
                    Complete Host Control
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Manage guests, moderate media & project live slideshows.
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    You have total authority over what gets displayed on your event wall. Approve or hide photos, monitor guest quotas, and download high-res files whenever you want.
                  </p>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span><strong>1-Click Media Moderation</strong> — approve or reject photos before they appear on the big screen.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Tv className="h-4 w-4" />
                      </div>
                      <span><strong>Live Slideshow Projector</strong> — plug into any TV/Projector with full-screen presentation mode.</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Lock className="h-4 w-4" />
                      </div>
                      <span><strong>Unguessable Event Slugs</strong> — secure, encrypted cloud storage on Cloudflare R2 & Supabase.</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Button asChild className="rounded-xl font-bold h-11 px-6">
                      <Link href="/signup">
                        Create Host Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-full max-w-md bg-card border rounded-3xl p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-bold text-base">Media Moderation</h4>
                        <p className="text-xs text-muted-foreground">3 pending review</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-600">
                        Moderation Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="aspect-square rounded-2xl overflow-hidden relative border">
                        <Image
                          src={samplePhotos[0].url}
                          alt="Review 1"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 inset-x-2 flex gap-1.5">
                          <button className="flex-1 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-md">
                            Approve
                          </button>
                          <button className="flex-1 py-1 rounded-lg bg-red-500 text-white text-[11px] font-bold shadow-md">
                            Reject
                          </button>
                        </div>
                      </div>

                      <div className="aspect-square rounded-2xl overflow-hidden relative border">
                        <Image
                          src={samplePhotos[1].url}
                          alt="Review 2"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 inset-x-2 flex gap-1.5">
                          <button className="flex-1 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-md">
                            Approve
                          </button>
                          <button className="flex-1 py-1 rounded-lg bg-red-500 text-white text-[11px] font-bold shadow-md">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7. FEATURES HIGHLIGHT GRID */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Built for Modern Events
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Everything You Need for Live Media Sharing
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Built from the ground up for zero-friction guest participation and rock-solid host control.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-card border shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Instant QR Code Access</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Guests scan from their default camera. No App Store visits, no forgotten passwords, no downloads.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-card border shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Real-time Photo Streaming</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Photos appear in the shared celebration gallery within seconds of being snapped.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-card border shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">AI Photo Scan & Face Match</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Find every photo you appear in across thousands of uploads by snapping a single 1-second selfie.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-card border shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <WifiOff className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Crowded Venue Resilience</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built-in IndexedDB queue stores photos safely if cell reception drops and syncs once reconnected.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-card border shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Original Resolution Downloads</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No extreme social media compression. Hosts can download the full-fidelity raw photo archive.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-card border shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Tv className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Projector & TV Live Wall</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn any venue screen into an interactive, live-updating photo wall that wows your attendees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. EVENT TYPES SECTION */}
      <section id="event-types" className="py-20 md:py-28 bg-muted/20 border-t">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Versatile Celebrations
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Perfect for Every Special Moment
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              From intimate birthday gatherings to grand 1,000+ guest weddings.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Weddings & Receptions',
                desc: 'Collect raw candid emotions from every guest table that the hired photographer missed.',
                icon: Heart,
                color: 'text-rose-500 bg-rose-500/10',
              },
              {
                title: 'Birthdays & Milestones',
                desc: 'Let family and friends upload funny moments and group selfies into one shared album.',
                icon: Sparkles,
                color: 'text-amber-500 bg-amber-500/10',
              },
              {
                title: 'College & Alumni Fests',
                desc: 'Capture energetic stage performances, reunions, and festival crowds seamlessly.',
                icon: Users,
                color: 'text-blue-500 bg-blue-500/10',
              },
              {
                title: 'Corporate Galas & Summits',
                desc: 'Display live attendee photos on conference mainstage screens in real-time.',
                icon: Layers,
                color: 'text-purple-500 bg-purple-500/10',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-3xl border bg-card hover:border-primary/40 transition-all hover:shadow-md space-y-3">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 md:py-28 border-t">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about Ekthau storage, pricing, and features.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="rounded-2xl border bg-card p-5 transition-all shadow-xs cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="font-bold text-base text-foreground">{faq.q}</h4>
                    <span className="text-primary font-bold text-lg">
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed pt-2 border-t">
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION BOTTOM BANNER */}
      <section className="py-16 md:py-24 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/25 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center space-y-8 relative z-10">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Ready to collect every candid memory?
            </h2>
            <p className="text-zinc-400 text-sm sm:text-lg max-w-xl mx-auto">
              Create your event space in seconds, generate your printable QR code, and experience live photo sharing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto h-13 px-9 rounded-2xl text-base font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-all">
              <Link href="/signup">
                Create Free Event (1 GB Free)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setJoinModalOpen(true)}
              className="w-full sm:w-auto h-13 px-8 rounded-2xl text-base font-bold bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <QrCode className="mr-2 h-5 w-5 text-primary" />
              Join an Existing Event
            </Button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="h-7 w-7 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Camera className="h-4 w-4" />
            </div>
            <span>Ekthau • Real-Time Event Photo Sharing</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link href="/join" className="hover:text-foreground transition-colors">
              Join Event
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Host Sign In
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Create Event
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Ekthau. All rights reserved.</p>
        </div>
      </footer>

      {/* Global Join Event Modal */}
      <JoinEventModal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} />
    </div>
  )
}
