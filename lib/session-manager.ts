'use client'

import { createClient } from './supabase/client'

export class SessionManager {
  private static instance: SessionManager
  private session: any = null
  private listeners: Set<(session: any) => void> = new Set()

  private constructor() {
    this.initializeSession()
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  private async initializeSession() {
    try {
      console.log('🔄 Initializing session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Session initialization error:', error)
        this.session = null
      } else {
        console.log('✅ Session initialized:', session?.user?.email || 'No user')
        this.session = session
      }
      
      this.notifyListeners()
    } catch (error) {
      console.error('❌ Session initialization exception:', error)
      this.session = null
      this.notifyListeners()
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.session))
  }

  subscribe(listener: (session: any) => void) {
    this.listeners.add(listener)
    // Immediately call with current session
    listener(this.session)
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSession() {
    return this.session
  }

  setSession(session: any) {
    console.log('🔄 Session updated:', session?.user?.email || 'No user')
    this.session = session
    this.notifyListeners()
  }

  clearSession() {
    console.log('🔄 Session cleared')
    this.session = null
    this.notifyListeners()
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()
