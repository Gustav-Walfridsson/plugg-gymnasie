'use client'

import { useAuth } from '../lib/auth-simple'

export function AuthButtons() {
  const { user, loading, signOut } = useAuth()

  // Show loading only for a reasonable time, then show login buttons
  if (loading) {
    return <div className="text-sm text-muted-foreground">Laddar...</div>
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          {user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-sm hover:text-primary transition-colors"
        >
          Logga ut
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <a href="/auth/login" className="text-sm hover:text-primary transition-colors">
        Logga in
      </a>
      <a href="/auth/signup" className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:bg-primary/90 transition-colors">
        Registrera
      </a>
    </div>
  )
}