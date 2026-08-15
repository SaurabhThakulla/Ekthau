'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Sparkles,
  QrCode,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { MOCK_MODE } from '@/lib/mockData'
import { useAuth } from '@/features/auth/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { forceMockLogin } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (MOCK_MODE && forceMockLogin) {
      forceMockLogin()
      router.push('/dashboard')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleQuickDemo = () => {
    if (forceMockLogin) {
      forceMockLogin()
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* LEFT SIDE: Cinematic Feature & Brand Hero */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-zinc-950 text-white select-none">
        {/* Background Image with Depth Overlays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth-hero.jpg"
            alt="Ekthau live event photo sharing"
            fill
            priority
            className="object-cover object-center brightness-90 transform scale-105 transition-transform duration-10000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/30" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/70" />
        </div>

        {/* Top Header / Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
              Ekthau
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <p className="text-xs text-zinc-300 font-medium tracking-wide uppercase">
              Live Event Memories
            </p>
          </div>
        </div>

        {/* Floating Feature Badges */}
        <div className="relative z-10 space-y-4 my-auto max-w-md">
          {/* Glass Card 1 */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl space-y-2 transform hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between text-xs text-zinc-200">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live Event Stream
              </span>
              <span className="text-zinc-300 font-mono">100% Guest Privacy</span>
            </div>
            <p className="text-sm font-medium text-white/90 leading-snug">
              Every guest snaps photos from their phone — they show up instantly in your high-res host dashboard.
            </p>
          </div>

          {/* Glass Card 2 */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl flex items-center gap-3 transform hover:-translate-y-1 transition-transform">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Instant QR Code Access</h4>
              <p className="text-xs text-zinc-300">No app download or account creation needed for guests</p>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial / Tagline */}
        <div className="relative z-10 pt-6 border-t border-white/15 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Designed for weddings, birthdays & celebrations
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
            Collect candid moments from every angle.
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Automatic background compression, offline upload queue, and full host moderation controls.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Modern Clean Login Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <Camera className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">Ekthau</span>
          </div>

          {/* Form Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your events, download full-res galleries, and moderate guest uploads.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl text-sm bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2.5 animate-in fade-in-50">
              <div className="p-0.5 mt-0.5">
                <span className="block h-2 w-2 rounded-full bg-destructive" />
              </div>
              <p className="flex-1 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="host@ekthau.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="pl-10 h-11 rounded-xl bg-background border-input focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                >
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10 pr-10 h-11 rounded-xl bg-background border-input focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Demo Mode Quick Access */}
          {MOCK_MODE && (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickDemo}
                className="w-full h-10 rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/5 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Explore with Instant Demo Account
              </Button>
            </div>
          )}

          {/* Switch to Signup */}
          <div className="pt-4 border-t text-center text-sm text-muted-foreground">
            Don&apos;t have a host account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              End-to-end secure
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              Live QR Sync
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
