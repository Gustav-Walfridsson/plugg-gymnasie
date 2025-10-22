'use client'

import { useAuth } from '../lib/auth-simple'
import { useState, useEffect } from 'react'

export function AuthButtons() {
  const [isClient, setIsClient] = useState(false)
  const [fallbackMode, setFallbackMode] = useState(false)
  
  // Try to use auth context, but fallback to simple buttons if it fails
  let user = null
  let loading = false
  let signOut = () => {}
  
  try {
    const authContext = useAuth()
    user = authContext.user
    loading = authContext.loading
    signOut = authContext.signOut
  } catch (error) {
    console.log('Auth context not available, using fallback mode')
    setFallbackMode(true)
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading only for a reasonable time, then show login buttons
  if (!isClient || loading) {
    return <div className="text-sm text-muted-foreground">Laddar...</div>
  }

  if (user && !fallbackMode) {
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

  // Always show login/signup buttons as fallback
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