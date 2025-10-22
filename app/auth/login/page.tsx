'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../lib/auth-simple'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get the redirect URL from query parameters
  const redirectTo = searchParams.get('redirectTo') || '/'
  const { user } = useAuth()

  // Redirect when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('🔄 User authenticated, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [user, redirectTo, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔑 Login form submitted, redirecting to:', redirectTo)
      const { error } = await signIn(email, password)
      if (error) {
        console.error('❌ Login error:', error)
        setError(error.message)
        setLoading(false)
      } else {
        console.log('✅ Login successful, will redirect to:', redirectTo)
        // Don't set loading to false here - let the auth state change handle it
        // The redirect will happen in useEffect when user state changes
      }
    } catch (err) {
      console.error('❌ Login exception:', err)
      setError('Ett oväntat fel uppstod')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Logga in på ditt konto
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Eller{' '}
            <a href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
              skapa ett nytt konto
            </a>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                E-postadress
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="din@email.se"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Lösenord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="Ditt lösenord"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </div>

          <div className="text-center">
            <a href="/auth/magic-link" className="text-sm text-primary hover:text-primary/80">
              Logga in med magisk länk
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
