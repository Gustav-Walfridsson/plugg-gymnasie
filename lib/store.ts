/**
 * Store - Centralized data adapter for Plugg Bot 1
 * Handles profile, mastery, queue, and analytics data persistence
 * Uses Supabase for authenticated users, localStorage as fallback
 */

import type { 
  UserProfile, 
  MasteryState, 
  SpacedRepetitionItem, 
  AnalyticsEvent,
  StudySession 
} from '../types/domain'
import { supabaseStore } from './supabase-store'
import { supabase } from './supabase-client'

export interface StoreData {
  profile: UserProfile
  mastery: Map<string, MasteryState>
  spacedRepetition: Map<string, SpacedRepetitionItem>
  analytics: AnalyticsEvent[]
  sessions: StudySession[]
  queue: string[] // skill IDs in review queue
  lastUpdated: string
}

export class Store {
  private static instance: Store
  private readonly prefix = 'plugg-bot-store-'
  private data: Partial<StoreData> = {}
  private isAuthenticated = false

  private constructor() {
    // Only load data on client side
    if (typeof window !== 'undefined') {
      this.initializeAuth()
    }
  }

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store()
    }
    return Store.instance
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuth(): Promise<void> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (user) {
        this.isAuthenticated = true
        // Get account ID from user metadata or fetch from accounts table
        const accountId = user.user_metadata?.account_id
        if (accountId) {
          await supabaseStore.initialize(user.id, accountId)
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    }
  }

  /**
   * Handle authentication state changes
   */
  async onAuthStateChange(user: any): Promise<void> {
    if (user) {
      this.isAuthenticated = true
      // Get account ID from user metadata or fetch from accounts table
      const accountId = user.user_metadata?.account_id
      if (accountId) {
        await supabaseStore.initialize(user.id, accountId)
      }
    } else {
      this.isAuthenticated = false
      supabaseStore.clear()
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.getProfile()
      } catch (error) {
        console.error('Failed to get profile from Supabase:', error)
        // Fallback to localStorage
      }
    }

    if (!this.data.profile) {
      this.data.profile = this.createDefaultProfile()
    }
    return this.data.profile
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.updateProfile(updates)
      } catch (error) {
        console.error('Failed to update profile in Supabase:', error)
        // Fallback to localStorage
      }
    }

    try {
      const currentProfile = await this.getProfile()
      this.data.profile = { ...currentProfile, ...updates, lastActive: new Date() }
      this.saveProfile()
      return true
    } catch (error) {
      console.error('Failed to update profile:', error)
      return false
    }
  }

  /**
   * Get mastery state for a skill
   */
  async getMasteryState(skillId: string, userId: string): Promise<MasteryState | null> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.getMasteryState(skillId)
      } catch (error) {
        console.error('Failed to get mastery state from Supabase:', error)
        // Fallback to localStorage
      }
    }

    const key = `${userId}-${skillId}`
    return this.data.mastery?.get(key) || null
  }

  /**
   * Set mastery state for a skill
   */
  async setMasteryState(masteryState: MasteryState): Promise<boolean> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.setMasteryState(masteryState)
      } catch (error) {
        console.error('Failed to set mastery state in Supabase:', error)
        // Fallback to localStorage
      }
    }

    try {
      if (!this.data.mastery) {
        this.data.mastery = new Map()
      }
      
      const key = `${masteryState.userId}-${masteryState.skillId}`
      this.data.mastery.set(key, masteryState)
      this.saveMastery()
      return true
    } catch (error) {
      console.error('Failed to set mastery state:', error)
      return false
    }
  }

  /**
   * Get all mastery states for a user
   */
  async getUserMasteryStates(userId: string): Promise<MasteryState[]> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.getUserMasteryStates()
      } catch (error) {
        console.error('Failed to get mastery states from Supabase:', error)
        // Fallback to localStorage
      }
    }

    if (!this.data.mastery) return []
    
    const userStates: MasteryState[] = []
    for (const state of this.data.mastery.values()) {
      if (state.userId === userId) {
        userStates.push(state)
      }
    }
    return userStates
  }

  /**
   * Get spaced repetition item
   */
  async getSpacedRepetitionItem(skillId: string, userId: string): Promise<SpacedRepetitionItem | null> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.getSpacedRepetitionItem(skillId)
      } catch (error) {
        console.error('Failed to get spaced repetition item from Supabase:', error)
        // Fallback to localStorage
      }
    }

    const key = `${userId}-${skillId}`
    return this.data.spacedRepetition?.get(key) || null
  }

  /**
   * Set spaced repetition item
   */
  async setSpacedRepetitionItem(item: SpacedRepetitionItem): Promise<boolean> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.setSpacedRepetitionItem(item)
      } catch (error) {
        console.error('Failed to set spaced repetition item in Supabase:', error)
        // Fallback to localStorage
      }
    }

    try {
      if (!this.data.spacedRepetition) {
        this.data.spacedRepetition = new Map()
      }
      
      // Use the same key format as getSpacedRepetitionItem
      const key = `${item.userId}-${item.skillId}`
      this.data.spacedRepetition.set(key, item)
      this.saveSpacedRepetition()
      return true
    } catch (error) {
      console.error('Failed to set spaced repetition item:', error)
      return false
    }
  }

  /**
   * Get all spaced repetition items for a user
   */
  async getUserSpacedRepetitionItems(userId: string): Promise<SpacedRepetitionItem[]> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.getUserSpacedRepetitionItems()
      } catch (error) {
        console.error('Failed to get spaced repetition items from Supabase:', error)
        // Fallback to localStorage
      }
    }

    if (!this.data.spacedRepetition) return []
    
    const userItems: SpacedRepetitionItem[] = []
    for (const item of this.data.spacedRepetition.values()) {
      if (item.userId === userId) {
        userItems.push(item)
      }
    }
    return userItems
  }

  /**
   * Add analytics event
   */
  async addAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.addAnalyticsEvent(event)
      } catch (error) {
        console.error('Failed to add analytics event to Supabase:', error)
        // Fallback to localStorage
      }
    }

    try {
      if (!this.data.analytics) {
        this.data.analytics = []
      }
      
      this.data.analytics.push(event)
      
      // Keep only last 1000 events to prevent storage bloat
      if (this.data.analytics.length > 1000) {
        this.data.analytics = this.data.analytics.slice(-1000)
      }
      
      this.saveAnalytics()
      return true
    } catch (error) {
      console.error('Failed to add analytics event:', error)
      return false
    }
  }

  /**
   * Get analytics events for a user
   */
  async getUserAnalyticsEvents(userId: string, limit?: number): Promise<AnalyticsEvent[]> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.getUserAnalyticsEvents(limit)
      } catch (error) {
        console.error('Failed to get analytics events from Supabase:', error)
        // Fallback to localStorage
      }
    }

    if (!this.data.analytics) return []
    
    const userEvents = this.data.analytics.filter(event => event.userId === userId)
    return limit ? userEvents.slice(-limit) : userEvents
  }

  /**
   * Add study session
   */
  async addStudySession(session: StudySession): Promise<boolean> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.addStudySession(session)
      } catch (error) {
        console.error('Failed to add study session to Supabase:', error)
        // Fallback to localStorage
      }
    }

    try {
      if (!this.data.sessions) {
        this.data.sessions = []
      }
      
      this.data.sessions.push(session)
      
      // Keep only last 100 sessions
      if (this.data.sessions.length > 100) {
        this.data.sessions = this.data.sessions.slice(-100)
      }
      
      this.saveSessions()
      return true
    } catch (error) {
      console.error('Failed to add study session:', error)
      return false
    }
  }

  /**
   * Get study sessions for a user
   */
  async getUserStudySessions(userId: string, limit?: number): Promise<StudySession[]> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.getUserStudySessions(limit)
      } catch (error) {
        console.error('Failed to get study sessions from Supabase:', error)
        // Fallback to localStorage
      }
    }

    if (!this.data.sessions) return []
    
    const userSessions = this.data.sessions.filter(session => session.userId === userId)
    return limit ? userSessions.slice(-limit) : userSessions
  }

  /**
   * Get all sessions (for analytics)
   */
  getSessions(): StudySession[] {
    return this.data.sessions || []
  }

  /**
   * Get all mastery states (for analytics)
   */
  getMastery(): Map<string, MasteryState> {
    return this.data.mastery || new Map()
  }

  /**
   * Update mastery level for a skill
   */
  updateMastery(skillId: string, level: number): void {
    if (!this.data.mastery) {
      this.data.mastery = new Map()
    }
    
    const existing = this.data.mastery.get(skillId)
    this.data.mastery.set(skillId, {
      skillId,
      level,
      lastUpdated: new Date().toISOString(),
      userId: existing?.userId || 'local',
      correctAnswers: existing?.correctAnswers || 0,
      totalAttempts: existing?.totalAttempts || 0
    })
  }

  /**
   * Add skill to review queue
   */
  addToQueue(skillId: string): boolean {
    try {
      if (!this.data.queue) {
        this.data.queue = []
      }
      
      if (!this.data.queue.includes(skillId)) {
        this.data.queue.push(skillId)
        this.saveQueue()
      }
      return true
    } catch (error) {
      console.error('Failed to add to queue:', error)
      return false
    }
  }

  /**
   * Remove skill from review queue
   */
  removeFromQueue(skillId: string): boolean {
    try {
      if (!this.data.queue) return true
      
      const index = this.data.queue.indexOf(skillId)
      if (index > -1) {
        this.data.queue.splice(index, 1)
        this.saveQueue()
      }
      return true
    } catch (error) {
      console.error('Failed to remove from queue:', error)
      return false
    }
  }

  /**
   * Get review queue
   */
  getQueue(): string[] {
    return this.data.queue || []
  }

  /**
   * Clear review queue
   */
  clearQueue(): boolean {
    try {
      this.data.queue = []
      this.saveQueue()
      return true
    } catch (error) {
      console.error('Failed to clear queue:', error)
      return false
    }
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<string> {
    if (this.isAuthenticated) {
      try {
        return await supabaseStore.exportData()
      } catch (error) {
        console.error('Failed to export data from Supabase:', error)
        // Fallback to localStorage
      }
    }

    try {
      const exportData = {
        profile: this.data.profile,
        mastery: this.data.mastery ? Array.from(this.data.mastery.entries()) : [],
        spacedRepetition: this.data.spacedRepetition ? Array.from(this.data.spacedRepetition.entries()) : [],
        analytics: this.data.analytics || [],
        sessions: this.data.sessions || [],
        queue: this.data.queue || [],
        exportedAt: new Date().toISOString()
      }
      
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      return '{}'
    }
  }

  /**
   * Import data from backup
   */
  importData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData)
      
      if (importData.profile) {
        this.data.profile = importData.profile
        this.saveProfile()
      }
      
      if (importData.mastery) {
        this.data.mastery = new Map(importData.mastery)
        this.saveMastery()
      }
      
      if (importData.spacedRepetition) {
        this.data.spacedRepetition = new Map(importData.spacedRepetition)
        this.saveSpacedRepetition()
      }
      
      if (importData.analytics) {
        this.data.analytics = importData.analytics
        this.saveAnalytics()
      }
      
      if (importData.sessions) {
        this.data.sessions = importData.sessions
        this.saveSessions()
      }
      
      if (importData.queue) {
        this.data.queue = importData.queue
        this.saveQueue()
      }
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  /**
   * Clear all data
   */
  clearAll(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      
      this.data = {}
      return true
    } catch (error) {
      console.error('Failed to clear all data:', error)
      return false
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): {
    totalSize: number
    breakdown: Record<string, number>
    percentage: number
  } {
    if (typeof window === 'undefined') {
      return { totalSize: 0, breakdown: {}, percentage: 0 }
    }
    
    let totalSize = 0
    const breakdown: Record<string, number> = {}
    
    try {
      const keys = Object.keys(localStorage)
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const size = localStorage[key].length
          const cleanKey = key.replace(this.prefix, '')
          breakdown[cleanKey] = size
          totalSize += size
        }
      })
      
      // Estimate total storage (5MB)
      const totalStorage = 5 * 1024 * 1024
      const percentage = (totalSize / totalStorage) * 100
      
      return { totalSize, breakdown, percentage }
    } catch (error) {
      return { totalSize: 0, breakdown: {}, percentage: 0 }
    }
  }

  /**
   * Create default profile
   */
  private createDefaultProfile(): UserProfile {
    return {
      id: 'default-user',
      name: 'Student',
      level: 1,
      totalXP: 0,
      badges: [],
      preferences: {
        darkMode: true,
        notifications: true,
        language: 'sv'
      },
      studyStreak: 0,
      lastActive: new Date()
    }
  }

  /**
   * Load all data from localStorage
   */
  private loadAll(): void {
    this.loadProfile()
    this.loadMastery()
    this.loadSpacedRepetition()
    this.loadAnalytics()
    this.loadSessions()
    this.loadQueue()
  }

  /**
   * Load profile from localStorage
   */
  private loadProfile(): void {
    if (typeof window === 'undefined') return
    
    try {
      const profileData = localStorage.getItem(this.prefix + 'profile')
      if (profileData) {
        const profile = JSON.parse(profileData)
        profile.lastActive = new Date(profile.lastActive)
        this.data.profile = profile
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  /**
   * Save profile to localStorage
   */
  private saveProfile(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.prefix + 'profile', JSON.stringify(this.data.profile))
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  /**
   * Load mastery data from localStorage
   */
  private loadMastery(): void {
    try {
      const masteryData = localStorage.getItem(this.prefix + 'mastery')
      if (masteryData) {
        const parsed = JSON.parse(masteryData)
        this.data.mastery = new Map(parsed.map(([key, state]: [string, any]) => [
          key,
          {
            ...state,
            lastAttempt: new Date(state.lastAttempt),
            lastMasteryUpdate: new Date(state.lastMasteryUpdate),
            masteryDate: state.masteryDate ? new Date(state.masteryDate) : undefined
          }
        ]))
      }
    } catch (error) {
      console.error('Failed to load mastery data:', error)
    }
  }

  /**
   * Save mastery data to localStorage
   */
  private saveMastery(): void {
    try {
      if (this.data.mastery) {
        const serialized = Array.from(this.data.mastery.entries())
        localStorage.setItem(this.prefix + 'mastery', JSON.stringify(serialized))
      }
    } catch (error) {
      console.error('Failed to save mastery data:', error)
    }
  }

  /**
   * Load spaced repetition data from localStorage
   */
  private loadSpacedRepetition(): void {
    try {
      const spacedData = localStorage.getItem(this.prefix + 'spaced-repetition')
      if (spacedData) {
        const parsed = JSON.parse(spacedData)
        this.data.spacedRepetition = new Map(parsed.map(([key, item]: [string, any]) => [
          key,
          {
            ...item,
            nextReview: new Date(item.nextReview),
            lastReview: item.lastReview ? new Date(item.lastReview) : undefined
          }
        ]))
      }
    } catch (error) {
      console.error('Failed to load spaced repetition data:', error)
    }
  }

  /**
   * Save spaced repetition data to localStorage
   */
  private saveSpacedRepetition(): void {
    try {
      if (this.data.spacedRepetition) {
        const serialized = Array.from(this.data.spacedRepetition.entries())
        localStorage.setItem(this.prefix + 'spaced-repetition', JSON.stringify(serialized))
      }
    } catch (error) {
      console.error('Failed to save spaced repetition data:', error)
    }
  }

  /**
   * Load analytics data from localStorage
   */
  private loadAnalytics(): void {
    try {
      const analyticsData = localStorage.getItem(this.prefix + 'analytics')
      if (analyticsData) {
        const parsed = JSON.parse(analyticsData)
        this.data.analytics = parsed.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    }
  }

  /**
   * Save analytics data to localStorage
   */
  private saveAnalytics(): void {
    try {
      if (this.data.analytics) {
        localStorage.setItem(this.prefix + 'analytics', JSON.stringify(this.data.analytics))
      }
    } catch (error) {
      console.error('Failed to save analytics data:', error)
    }
  }

  /**
   * Load sessions data from localStorage
   */
  private loadSessions(): void {
    try {
      const sessionsData = localStorage.getItem(this.prefix + 'sessions')
      if (sessionsData) {
        const parsed = JSON.parse(sessionsData)
        this.data.sessions = parsed.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        }))
      }
    } catch (error) {
      console.error('Failed to load sessions data:', error)
    }
  }

  /**
   * Save sessions data to localStorage
   */
  private saveSessions(): void {
    try {
      if (this.data.sessions) {
        localStorage.setItem(this.prefix + 'sessions', JSON.stringify(this.data.sessions))
      }
    } catch (error) {
      console.error('Failed to save sessions data:', error)
    }
  }

  /**
   * Load queue data from localStorage
   */
  private loadQueue(): void {
    try {
      const queueData = localStorage.getItem(this.prefix + 'queue')
      if (queueData) {
        this.data.queue = JSON.parse(queueData)
      }
    } catch (error) {
      console.error('Failed to load queue data:', error)
    }
  }

  /**
   * Save queue data to localStorage
   */
  private saveQueue(): void {
    try {
      if (this.data.queue) {
        localStorage.setItem(this.prefix + 'queue', JSON.stringify(this.data.queue))
      }
    } catch (error) {
      console.error('Failed to save queue data:', error)
    }
  }
}

// Export singleton instance
export const store = Store.getInstance()
