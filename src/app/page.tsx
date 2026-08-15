'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/AuthContext'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [session, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
