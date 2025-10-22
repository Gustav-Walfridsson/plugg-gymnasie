'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth-simple'

export default function MagicLinkPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signInWithMagicLink } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signInWithMagicLink(email)
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
              Vi har skickat en magisk länk till {email}. 
              Klicka på länken för att logga in.
            </p>
            <div className="space-y-4">
              <a
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
              >
                Gå till inloggning
              </a>
              <div>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                  }}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Skicka ny länk
                </button>
              </div>
            </div>
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
            Magisk länk
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Ange din e-postadress så skickar vi en inloggningslänk
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              {loading ? 'Skickar länk...' : 'Skicka magisk länk'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <div>
              <a href="/auth/login" className="text-sm text-primary hover:text-primary/80">
                Logga in med lösenord
              </a>
            </div>
            <div>
              <a href="/auth/signup" className="text-sm text-primary hover:text-primary/80">
                Skapa konto
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
