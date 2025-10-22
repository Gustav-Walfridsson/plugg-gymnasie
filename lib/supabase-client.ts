/**
 * Supabase Client - Singleton client for database operations
 * Handles authentication, database queries, and real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug environment variables
console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'Missing')

// Create Supabase client
let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
} else {
  console.log('Creating Supabase client with provided credentials')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key length:', supabaseAnonKey?.length)
  
  // Validate URL format
  try {
    new URL(supabaseUrl)
    console.log('URL validation passed')
  } catch (error) {
    console.error('Invalid URL format:', error)
  }
  
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? {
        getItem: (key: string) => {
          try {
            const item = window.localStorage.getItem(key)
            console.log('Getting from localStorage:', key, item ? 'Found' : 'Not found')
            return item
          } catch (error) {
            console.error('Error getting item from localStorage:', error)
            return null
          }
        },
        setItem: (key: string, value: string) => {
          try {
            window.localStorage.setItem(key, value)
            console.log('Session saved to localStorage:', key)
          } catch (error) {
            console.error('Error setting item in localStorage:', error)
          }
        },
        removeItem: (key: string) => {
          try {
            window.localStorage.removeItem(key)
            console.log('Session removed from localStorage:', key)
          } catch (error) {
            console.error('Error removing item from localStorage:', error)
          }
        }
      } : undefined
    }
  })
}

export { supabase }

// Auth helpers
export const auth = {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    })
    return { data, error }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  /**
   * Sign in with magic link
   */
  async signInWithMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/magic-link`
      }
    })
    return { data, error }
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },


  /**
   * Get current session
   */
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  /**
   * Get user's account information
   */
  async getAccount(userId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  /**
   * Update user's account
   */
  async updateAccount(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  /**
   * Get all subjects
   */
  async getSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        topics (
          *,
          skills (*)
        )
      `)
      .order('name')
    return { data, error }
  },

  /**
   * Get skills for a subject
   */
  async getSkillsBySubject(subjectId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select(`
        *,
        topics (*),
        lessons (*)
      `)
      .eq('subject_id', subjectId)
      .order('display_order')
    return { data, error }
  },

  /**
   * Get items for a skill
   */
  async getItemsBySkill(skillId: string) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('skill_id', skillId)
      .order('display_order')
    return { data, error }
  },

  /**
   * Get mastery state for a skill
   */
  async getMasteryState(accountId: string, skillId: string) {
    const { data, error } = await supabase
      .from('mastery_states')
      .select('*')
      .eq('account_id', accountId)
      .eq('skill_id', skillId)
      .single()
    return { data, error }
  },

  /**
   * Update mastery state
   */
  async updateMasteryState(accountId: string, skillId: string, updates: any) {
    const { data, error } = await supabase
      .from('mastery_states')
      .upsert({
        account_id: accountId,
        skill_id: skillId,
        ...updates
      })
      .select()
      .single()
    return { data, error }
  },

  /**
   * Add an attempt
   */
  async addAttempt(accountId: string, itemId: string, skillId: string, answer: any, isCorrect: boolean, timeSpent: number) {
    const { data, error } = await supabase
      .from('attempts')
      .insert({
        account_id: accountId,
        item_id: itemId,
        skill_id: skillId,
        answer,
        is_correct: isCorrect,
        time_spent: timeSpent
      })
      .select()
      .single()
    return { data, error }
  },

  /**
   * Get skills due for review
   */
  async getSkillsDueForReview(accountId: string) {
    const { data, error } = await supabase
      .from('spaced_repetition_items')
      .select(`
        *,
        skills (*)
      `)
      .eq('account_id', accountId)
      .lte('next_review', new Date().toISOString())
      .order('next_review')
    return { data, error }
  },

  /**
   * Add analytics event
   */
  async addAnalyticsEvent(accountId: string, eventType: string, eventData: any) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        account_id: accountId,
        event_type: eventType as any,
        event_data: eventData
      })
      .select()
      .single()
    return { data, error }
  },

  /**
   * Get user progress summary
   */
  async getUserProgressSummary(accountId: string) {
    const { data, error } = await supabase
      .from('user_progress_summary')
      .select('*')
      .eq('account_id', accountId)
      .single()
    return { data, error }
  }
}

// GDPR helpers
export const gdpr = {
  /**
   * Export user data
   */
  async exportUserData(userId: string) {
    const { data, error } = await supabase.rpc('export_user_data', {
      user_uuid: userId
    })
    return { data, error }
  },

  /**
   * Soft delete account
   */
  async softDeleteAccount(userId: string) {
    const { data, error } = await supabase.rpc('soft_delete_account', {
      user_uuid: userId
    })
    return { data, error }
  }
}

// Export individual functions
export const getCurrentUser = auth.getCurrentUser

export default supabase
