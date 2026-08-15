'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, PlusCircle, Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, loading, signOut } = useAuth()
  const router = useRouter()

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-xl tracking-tighter">
              Ekthau
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Events
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/events/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Event
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
