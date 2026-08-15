'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import JoinEventModal from '@/components/JoinEventModal'
import {
  LogOut,
  PlusCircle,
  Loader2,
  Camera,
  QrCode,
  Calendar,
  Sparkles,
  User,
  Shield,
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login')
    }
  }, [loading, session, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
          <Camera className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Verifying host session...
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userInitial = (user?.email?.charAt(0) || 'H').toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity"
            >
              <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
                <Camera className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1.5">
                Ekthau
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md border border-primary/20">
                  Host
                </span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-muted text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Events
              </Link>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Join Event Button (Modal Trigger) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJoinModalOpen(true)}
              className="rounded-xl h-9 text-xs sm:text-sm font-semibold border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
            >
              <QrCode className="h-4 w-4 sm:mr-1.5 text-primary" />
              <span className="hidden sm:inline">Join with Code</span>
              <span className="sm:hidden">Join</span>
            </Button>

            {/* Create New Event Button */}
            <Button size="sm" asChild className="rounded-xl h-9 text-xs sm:text-sm font-semibold shadow-sm shadow-primary/25">
              <Link href="/dashboard/events/new">
                <PlusCircle className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">New Event</span>
                <span className="sm:hidden">Create</span>
              </Link>
            </Button>

            {/* User Profile Chip & Sign Out */}
            <div className="flex items-center pl-2 border-l gap-2">
              <div
                className="h-8 w-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 select-none"
                title={user?.email || 'Host'}
              >
                {userInitial}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Sign out of host dashboard"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {children}
      </main>

      {/* Join Event Modal Accessible Anywhere in Dashboard */}
      <JoinEventModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
      />
    </div>
  )
}
