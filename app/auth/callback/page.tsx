'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

function AuthCallbackContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔗 Handling auth callback, redirectTo:', redirectTo)
        console.log('📍 Current URL:', window.location.href)
        
        // Check if we have tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('🔑 Access token present:', !!accessToken)
        console.log('🔄 Refresh token present:', !!refreshToken)
        
        if (!accessToken) {
          console.log('❌ No access token in URL, redirecting to login')
          router.push('/auth/login')
          return
        }
        
        // Handle the auth callback
        const supabase = createClient()
        
        // Set the session manually from URL tokens
        console.log('🔧 Setting session from URL tokens...')
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          setError('Inloggning misslyckades: ' + sessionError.message)
          setLoading(false)
          return
        }
        
        console.log('✅ Session set successfully:', sessionData.session?.user?.email)
        
        if (sessionData.session?.user) {
          console.log('🎉 User authenticated:', sessionData.session.user.email)
          // Clear the URL hash to remove tokens
          window.history.replaceState({}, document.title, window.location.pathname)
          router.push(redirectTo)
        } else {
          console.log('❌ No user in session after setting tokens')
          setError('Inloggning misslyckades: Ingen användare hittades')
          setLoading(false)
        }
        
      } catch (err) {
        console.error('❌ Unexpected error during auth callback:', err)
        setError('Ett oväntat fel uppstod: ' + err.message)
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
