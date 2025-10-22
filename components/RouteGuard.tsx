'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth-simple'

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      console.log('🛡️ Route guard: User not authenticated, redirecting to login')
      router.push('/auth/login')
    }
  }, [user, loading, requireAuth, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not logged in, don't render children
  if (requireAuth && !user) {
    return null
  }

  return <>{children}</>
}
