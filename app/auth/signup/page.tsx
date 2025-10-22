'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth-simple'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Ett oväntat fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">
              Kontrollera din e-post
            </h2>
            <p className="text-muted-foreground mb-6">
              Vi har skickat en bekräftelselänk till {email}. 
              Klicka på länken för att aktivera ditt konto.
            </p>
            <a
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
            >
              Gå till inloggning
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Skapa ditt konto
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Eller{' '}
            <a href="/auth/login" className="font-medium text-primary hover:text-primary/80">
              logga in på ditt befintliga konto
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="Minst 6 tecken"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Bekräfta lösenord
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary bg-background text-foreground"
                placeholder="Bekräfta ditt lösenord"
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
              {loading ? 'Skapar konto...' : 'Skapa konto'}
            </button>
          </div>

          <div className="text-center">
            <a href="/auth/magic-link" className="text-sm text-primary hover:text-primary/80">
              Registrera med magisk länk
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
