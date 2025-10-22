'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase-client'

function AuthCallbackContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback, redirectTo:', redirectTo)
        
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError('Inloggning misslyckades')
          setLoading(false)
          return
        }

        if (data.session) {
          console.log('Auth callback successful, user:', data.session.user.email)
          // User is authenticated, redirect to intended page
          router.push(redirectTo)
        } else {
          console.log('No session in callback, redirecting to login')
          // No session, redirect to login
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        setError('Ett oväntat fel uppstod')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifierar inloggning...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">
              Inloggning misslyckades
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <a
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
            >
              Försök igen
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
