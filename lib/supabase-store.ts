/**
 * Supabase Store - Database-backed store for Plugg Bot 1
 * Replaces localStorage with Supabase database persistence
 */

import { supabase } from './supabase-client'
import type { 
  UserProfile, 
  MasteryState, 
  SpacedRepetitionItem, 
  AnalyticsEvent,
  StudySession 
} from '../types/domain'

export interface StoreData {
  profile: UserProfile
  mastery: Map<string, MasteryState>
  spacedRepetition: Map<string, SpacedRepetitionItem>
  analytics: AnalyticsEvent[]
  sessions: StudySession[]
  queue: string[] // skill IDs in review queue
  lastUpdated: string
}

export class SupabaseStore {
  private static instance: SupabaseStore
  private data: Partial<StoreData> = {}
  private currentUserId: string | null = null
  private currentAccountId: string | null = null

  private constructor() {
    // Initialize with empty data
    this.data = {
      mastery: new Map(),
      spacedRepetition: new Map(),
      analytics: [],
      sessions: [],
      queue: []
    }
  }

  static getInstance(): SupabaseStore {
    if (!SupabaseStore.instance) {
      SupabaseStore.instance = new SupabaseStore()
    }
    return SupabaseStore.instance
  }

  /**
   * Initialize store with current user
   */
  async initialize(userId: string, accountId: string): Promise<void> {
    this.currentUserId = userId
    this.currentAccountId = accountId
    await this.loadAll()
  }

  /**
   * Clear store data (on logout)
   */
  clear(): void {
    this.data = {
      mastery: new Map(),
      spacedRepetition: new Map(),
      analytics: [],
      sessions: [],
      queue: []
    }
    this.currentUserId = null
    this.currentAccountId = null
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    // If not authenticated, return default profile
    if (!this.currentAccountId) {
      console.log('⚠️ No account ID, returning default profile')
      return this.createDefaultProfile()
    }

    if (!this.data.profile) {
      await this.loadProfile()
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
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const currentProfile = await this.getProfile()
      const updatedProfile = { ...currentProfile, ...updates, lastActive: new Date() }
      
      // Update in database
      const { error } = await supabase
        .from('accounts')
        .update({
          name: updatedProfile.name,
          level: updatedProfile.level,
          total_xp: updatedProfile.totalXP,
          study_streak: updatedProfile.studyStreak,
          preferences: updatedProfile.preferences,
          last_active: updatedProfile.lastActive.toISOString()
        })
        .eq('id', this.currentAccountId)

      if (error) {
        console.error('Failed to update profile in database:', error)
        return false
      }

      // Update local cache
      this.data.profile = updatedProfile
      return true
    } catch (error) {
      console.error('Failed to update profile:', error)
      return false
    }
  }

  /**
   * Get mastery state for a skill
   */
  async getMasteryState(skillId: string): Promise<MasteryState | null> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('mastery_states')
        .select('*')
        .eq('account_id', this.currentAccountId)
        .eq('skill_id', skillId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null
        }
        console.error('Failed to get mastery state:', error)
        return null
      }

      return this.mapMasteryStateFromDb(data)
    } catch (error) {
      console.error('Failed to get mastery state:', error)
      return null
    }
  }

  /**
   * Set mastery state for a skill
   */
  async setMasteryState(masteryState: MasteryState): Promise<boolean> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const dbData = this.mapMasteryStateToDb(masteryState)
      
      const { error } = await supabase
        .from('mastery_states')
        .upsert(dbData, {
          onConflict: 'account_id,skill_id'
        })

      if (error) {
        console.error('Failed to set mastery state:', error)
        return false
      }

      // Update local cache
      const key = `${this.currentUserId}-${masteryState.skillId}`
      if (!this.data.mastery) {
        this.data.mastery = new Map()
      }
      this.data.mastery.set(key, masteryState)
      
      return true
    } catch (error) {
      console.error('Failed to set mastery state:', error)
      return false
    }
  }

  /**
   * Get all mastery states for current user
   */
  async getUserMasteryStates(): Promise<MasteryState[]> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('mastery_states')
        .select('*')
        .eq('account_id', this.currentAccountId)

      if (error) {
        console.error('Failed to get mastery states:', error)
        return []
      }

      return data.map(this.mapMasteryStateFromDb)
    } catch (error) {
      console.error('Failed to get mastery states:', error)
      return []
    }
  }

  /**
   * Get spaced repetition item
   */
  async getSpacedRepetitionItem(skillId: string): Promise<SpacedRepetitionItem | null> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('spaced_repetition_items')
        .select('*')
        .eq('account_id', this.currentAccountId)
        .eq('skill_id', skillId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null
        }
        console.error('Failed to get spaced repetition item:', error)
        return null
      }

      return this.mapSpacedRepetitionItemFromDb(data)
    } catch (error) {
      console.error('Failed to get spaced repetition item:', error)
      return null
    }
  }

  /**
   * Set spaced repetition item
   */
  async setSpacedRepetitionItem(item: SpacedRepetitionItem): Promise<boolean> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const dbData = this.mapSpacedRepetitionItemToDb(item)
      
      const { error } = await supabase
        .from('spaced_repetition_items')
        .upsert(dbData, {
          onConflict: 'account_id,skill_id'
        })

      if (error) {
        console.error('Failed to set spaced repetition item:', error)
        return false
      }

      // Update local cache
      const key = `${this.currentUserId}-${item.skillId}`
      if (!this.data.spacedRepetition) {
        this.data.spacedRepetition = new Map()
      }
      this.data.spacedRepetition.set(key, item)
      
      return true
    } catch (error) {
      console.error('Failed to set spaced repetition item:', error)
      return false
    }
  }

  /**
   * Get all spaced repetition items for current user
   */
  async getUserSpacedRepetitionItems(): Promise<SpacedRepetitionItem[]> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('spaced_repetition_items')
        .select('*')
        .eq('account_id', this.currentAccountId)

      if (error) {
        console.error('Failed to get spaced repetition items:', error)
        return []
      }

      return data.map(this.mapSpacedRepetitionItemFromDb)
    } catch (error) {
      console.error('Failed to get spaced repetition items:', error)
      return []
    }
  }

  /**
   * Add analytics event
   */
  async addAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const dbData = this.mapAnalyticsEventToDb(event)
      
      const { error } = await supabase
        .from('analytics_events')
        .insert(dbData)

      if (error) {
        console.error('Failed to add analytics event:', error)
        return false
      }

      // Update local cache
      if (!this.data.analytics) {
        this.data.analytics = []
      }
      this.data.analytics.push(event)
      
      // Keep only last 1000 events to prevent memory bloat
      if (this.data.analytics.length > 1000) {
        this.data.analytics = this.data.analytics.slice(-1000)
      }
      
      return true
    } catch (error) {
      console.error('Failed to add analytics event:', error)
      return false
    }
  }

  /**
   * Get analytics events for current user
   */
  async getUserAnalyticsEvents(limit?: number): Promise<AnalyticsEvent[]> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('account_id', this.currentAccountId)
        .order('timestamp', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to get analytics events:', error)
        return []
      }

      return data.map(this.mapAnalyticsEventFromDb)
    } catch (error) {
      console.error('Failed to get analytics events:', error)
      return []
    }
  }

  /**
   * Add study session
   */
  async addStudySession(session: StudySession): Promise<boolean> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      const dbData = this.mapStudySessionToDb(session)
      
      const { error } = await supabase
        .from('study_sessions')
        .insert(dbData)

      if (error) {
        console.error('Failed to add study session:', error)
        return false
      }

      // Update local cache
      if (!this.data.sessions) {
        this.data.sessions = []
      }
      this.data.sessions.push(session)
      
      // Keep only last 100 sessions
      if (this.data.sessions.length > 100) {
        this.data.sessions = this.data.sessions.slice(-100)
      }
      
      return true
    } catch (error) {
      console.error('Failed to add study session:', error)
      return false
    }
  }

  /**
   * Get study sessions for current user
   */
  async getUserStudySessions(limit?: number): Promise<StudySession[]> {
    if (!this.currentAccountId) {
      throw new Error('User not authenticated')
    }

    try {
      let query = supabase
        .from('study_sessions')
        .select('*')
        .eq('account_id', this.currentAccountId)
        .order('start_time', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to get study sessions:', error)
        return []
      }

      return data.map(this.mapStudySessionFromDb)
    } catch (error) {
      console.error('Failed to get study sessions:', error)
      return []
    }
  }

  /**
   * Add skill to review queue (stored in localStorage for now)
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
    try {
      const profile = await this.getProfile()
      const masteryStates = await this.getUserMasteryStates()
      const spacedRepetitionItems = await this.getUserSpacedRepetitionItems()
      const analyticsEvents = await this.getUserAnalyticsEvents()
      const studySessions = await this.getUserStudySessions()

      const exportData = {
        profile,
        mastery: masteryStates.map(ms => [`${ms.userId}-${ms.skillId}`, ms]),
        spacedRepetition: spacedRepetitionItems.map(sri => [`${sri.userId}-${sri.skillId}`, sri]),
        analytics: analyticsEvents,
        sessions: studySessions,
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
   * Create default profile
   */
  private createDefaultProfile(): UserProfile {
    return {
      id: this.currentUserId || 'default-user',
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
   * Load all data from database
   */
  private async loadAll(): Promise<void> {
    await Promise.all([
      this.loadProfile(),
      this.loadMastery(),
      this.loadSpacedRepetition(),
      this.loadAnalytics(),
      this.loadSessions(),
      this.loadQueue()
    ])
  }

  /**
   * Load profile from database
   */
  private async loadProfile(): Promise<void> {
    if (!this.currentAccountId) return
    
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', this.currentAccountId)
        .single()

      if (error) {
        console.error('Failed to load profile:', error)
        return
      }

      this.data.profile = this.mapAccountToProfile(data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  /**
   * Load mastery data from database
   */
  private async loadMastery(): Promise<void> {
    if (!this.currentAccountId) return
    
    try {
      const { data, error } = await supabase
        .from('mastery_states')
        .select('*')
        .eq('account_id', this.currentAccountId)

      if (error) {
        console.error('Failed to load mastery data:', error)
        return
      }

      this.data.mastery = new Map()
      data.forEach(ms => {
        const key = `${this.currentUserId}-${ms.skill_id}`
        this.data.mastery!.set(key, this.mapMasteryStateFromDb(ms))
      })
    } catch (error) {
      console.error('Failed to load mastery data:', error)
    }
  }

  /**
   * Load spaced repetition data from database
   */
  private async loadSpacedRepetition(): Promise<void> {
    if (!this.currentAccountId) return
    
    try {
      const { data, error } = await supabase
        .from('spaced_repetition_items')
        .select('*')
        .eq('account_id', this.currentAccountId)

      if (error) {
        console.error('Failed to load spaced repetition data:', error)
        return
      }

      this.data.spacedRepetition = new Map()
      data.forEach(sri => {
        const key = `${this.currentUserId}-${sri.skill_id}`
        this.data.spacedRepetition!.set(key, this.mapSpacedRepetitionItemFromDb(sri))
      })
    } catch (error) {
      console.error('Failed to load spaced repetition data:', error)
    }
  }

  /**
   * Load analytics data from database
   */
  private async loadAnalytics(): Promise<void> {
    if (!this.currentAccountId) return
    
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('account_id', this.currentAccountId)
        .order('timestamp', { ascending: false })
        .limit(1000)

      if (error) {
        console.error('Failed to load analytics data:', error)
        return
      }

      this.data.analytics = data.map(this.mapAnalyticsEventFromDb)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    }
  }

  /**
   * Load sessions data from database
   */
  private async loadSessions(): Promise<void> {
    if (!this.currentAccountId) return
    
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('account_id', this.currentAccountId)
        .order('start_time', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Failed to load sessions data:', error)
        return
      }

      this.data.sessions = data.map(this.mapStudySessionFromDb)
    } catch (error) {
      console.error('Failed to load sessions data:', error)
    }
  }

  /**
   * Load queue data from localStorage (temporary)
   */
  private loadQueue(): void {
    if (typeof window === 'undefined') return
    
    try {
      const queueData = localStorage.getItem('plugg-bot-store-queue')
      if (queueData) {
        this.data.queue = JSON.parse(queueData)
      }
    } catch (error) {
      console.error('Failed to load queue data:', error)
    }
  }

  /**
   * Save queue data to localStorage (temporary)
   */
  private saveQueue(): void {
    if (typeof window === 'undefined') return
    
    try {
      if (this.data.queue) {
        localStorage.setItem('plugg-bot-store-queue', JSON.stringify(this.data.queue))
      }
    } catch (error) {
      console.error('Failed to save queue data:', error)
    }
  }

  // Database mapping functions
  private mapAccountToProfile(account: any): UserProfile {
    return {
      id: this.currentUserId!,
      name: account.name,
      level: account.level,
      totalXP: account.total_xp,
      badges: [], // TODO: Load from user_badges table
      preferences: account.preferences || {
        darkMode: true,
        notifications: true,
        language: 'sv'
      },
      studyStreak: account.study_streak,
      lastActive: new Date(account.last_active)
    }
  }

  private mapMasteryStateFromDb(data: any): MasteryState {
    return {
      skillId: data.skill_id,
      userId: this.currentUserId!,
      probability: data.probability,
      attempts: data.attempts,
      correctAttempts: data.correct_attempts,
      lastAttempt: new Date(data.last_attempt),
      lastMasteryUpdate: new Date(data.last_mastery_update),
      isMastered: data.is_mastered,
      masteryDate: data.mastery_date ? new Date(data.mastery_date) : undefined
    }
  }

  private mapMasteryStateToDb(masteryState: MasteryState): any {
    return {
      account_id: this.currentAccountId,
      skill_id: masteryState.skillId,
      probability: masteryState.probability,
      attempts: masteryState.attempts,
      correct_attempts: masteryState.correctAttempts,
      last_attempt: masteryState.lastAttempt.toISOString(),
      last_mastery_update: masteryState.lastMasteryUpdate.toISOString(),
      is_mastered: masteryState.isMastered,
      mastery_date: masteryState.masteryDate?.toISOString()
    }
  }

  private mapSpacedRepetitionItemFromDb(data: any): SpacedRepetitionItem {
    return {
      id: data.id,
      skillId: data.skill_id,
      userId: this.currentUserId!,
      interval: data.interval,
      repetitions: data.repetitions,
      easeFactor: data.ease_factor,
      nextReview: new Date(data.next_review),
      lastReview: data.last_review ? new Date(data.last_review) : undefined
    }
  }

  private mapSpacedRepetitionItemToDb(item: SpacedRepetitionItem): any {
    return {
      account_id: this.currentAccountId,
      skill_id: item.skillId,
      interval: item.interval,
      repetitions: item.repetitions,
      ease_factor: item.easeFactor,
      next_review: item.nextReview.toISOString(),
      last_review: item.lastReview?.toISOString()
    }
  }

  private mapAnalyticsEventFromDb(data: any): AnalyticsEvent {
    return {
      type: data.event_type,
      userId: this.currentUserId!,
      timestamp: new Date(data.timestamp),
      data: data.event_data || {}
    }
  }

  private mapAnalyticsEventToDb(event: AnalyticsEvent): any {
    return {
      account_id: this.currentAccountId,
      event_type: event.type,
      event_data: event.data,
      timestamp: event.timestamp.toISOString()
    }
  }

  private mapStudySessionFromDb(data: any): StudySession {
    return {
      id: data.id,
      userId: this.currentUserId!,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      subjectId: data.subject_id,
      skillId: data.skill_id,
      itemsCompleted: data.items_completed,
      correctAnswers: data.correct_answers,
      totalTime: data.total_time
    }
  }

  private mapStudySessionToDb(session: StudySession): any {
    return {
      account_id: this.currentAccountId,
      subject_id: session.subjectId,
      skill_id: session.skillId,
      start_time: session.startTime.toISOString(),
      end_time: session.endTime?.toISOString(),
      items_completed: session.itemsCompleted,
      correct_answers: session.correctAnswers,
      total_time: session.totalTime
    }
  }
}

// Export singleton instance
export const supabaseStore = SupabaseStore.getInstance()
