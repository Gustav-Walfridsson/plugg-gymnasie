'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from './supabase/client'
import { sessionManager } from './session-manager'
import { analyticsEngine } from './analytics'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithMagicLink: (email: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  accountId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [accountId, setAccountId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    try {
      // Subscribe to session changes
      const unsubscribe = sessionManager.subscribe(async (session) => {
        if (!mounted) return

        if (session?.user) {
          console.log('✅ User authenticated:', session.user.email)
          setUser(session.user)

          // Get the account ID from the accounts table
          const getAccountId = async () => {
            try {
              const supabase = createClient()
              const { data: account, error } = await supabase
                .from('accounts')
                .select('id')
                .eq('user_id', session.user.id)
                .is('deleted_at', null)
                .single()

              if (account && !error) {
                setAccountId(account.id)
                analyticsEngine.setAccountId(account.id)
                console.log('✅ Using account ID:', account.id)
              } else {
                console.log('⚠️ No account found, using user ID as fallback:', session.user.id)
                setAccountId(session.user.id)
                analyticsEngine.setAccountId(session.user.id)
              }
            } catch (error) {
              console.error('❌ Error getting account ID:', error)
              setAccountId(session.user.id)
              analyticsEngine.setAccountId(session.user.id)
            }
          }

          getAccountId()
        } else {
          console.log('❌ No user in session')
          setUser(null)
          setAccountId(null)
          analyticsEngine.setAccountId(null)
        }
        
        setLoading(false)
      })

      // Listen for auth changes from Supabase
      const supabase = createClient()
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Supabase auth state change:', event, session?.user?.email || 'No user')
          
          if (!mounted) return

          // Update session manager
          sessionManager.setSession(session)
        }
      )

      return () => {
        mounted = false
        unsubscribe()
        subscription.unsubscribe()
      }
    } catch (error) {
      console.log('Auth initialization failed, using fallback mode:', error)
      setLoading(false)
      return () => {
        mounted = false
      }
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      console.log('📝 Signing up:', email)
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error('❌ Sign up error:', error)
      } else {
        console.log('✅ Sign up successful')
      }
      
      return { error }
    } catch (err) {
      console.error('❌ Sign up exception:', err)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Signing in:', email)
      setLoading(true)
      
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Sign in error:', error)
        setLoading(false)
        return { error }
      }
      
      if (data.session) {
        console.log('✅ Sign in successful:', data.session.user.email)
        // Update session manager immediately
        sessionManager.setSession(data.session)
      } else {
        console.log('⚠️ Sign in successful but no session returned')
      }
      
      return { error: null }
    } catch (err) {
      console.error('❌ Sign in exception:', err)
      setLoading(false)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const signInWithMagicLink = async (email: string) => {
    try {
      console.log('🔗 Sending magic link to:', email)
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error('❌ Magic link error:', error)
      } else {
        console.log('✅ Magic link sent')
      }
      
      return { error }
    } catch (err) {
      console.error('❌ Magic link exception:', err)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out')
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error)
      } else {
        console.log('✅ Sign out successful')
        // Clear session manager immediately
        sessionManager.clearSession()
      }
      
      return { error }
    } catch (err) {
      console.error('❌ Sign out exception:', err)
      return { error: { message: 'An unexpected error occurred' } }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    accountId,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
