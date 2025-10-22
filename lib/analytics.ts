/**
 * Analytics System - Supabase-powered tracking for Plugg Bot 1
 * Tracks user behavior and learning progress
 */

import type { AnalyticsEvent, StudySession, SubjectId } from '../types/domain'
import { createClient } from '@supabase/supabase-js'

export class AnalyticsEngine {
  private static instance: AnalyticsEngine
  private supabase: ReturnType<typeof createClient>
  private accountId: string | null = null

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine()
    }
    return AnalyticsEngine.instance
  }

  /**
   * Set the current account ID for analytics tracking
   */
  setAccountId(accountId: string | null): void {
    this.accountId = accountId
  }

  /**
   * Start a new study session
   */
  async startSession(userId: string, subjectId: SubjectId, skillId?: string): Promise<string> {
    if (!this.accountId) {
      console.warn('Analytics: No account ID set, skipping session start')
      return ''
    }

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Save session to database
      const { error } = await this.supabase
        .from('study_sessions')
        .insert({
          id: sessionId,
          account_id: this.accountId,
          subject_id: subjectId,
          skill_id: skillId,
          start_time: new Date().toISOString(),
          items_completed: 0,
          correct_answers: 0,
          total_time_ms: 0
        })

      if (error) {
        console.error('Error saving study session:', error)
        return ''
      }

      // Track analytics event
      await this.emitEvent('start_session', userId, { sessionId, subjectId, skillId })
      
      return sessionId
    } catch (err) {
      console.error('Error starting session:', err)
      return ''
    }
  }

  /**
   * End a study session
   */
  async endSession(sessionId: string): Promise<void> {
    if (!this.accountId || !sessionId) return

    try {
      const endTime = new Date()
      
      // Get session start time to calculate duration
      const { data: session, error: fetchError } = await this.supabase
        .from('study_sessions')
        .select('start_time')
        .eq('id', sessionId)
        .eq('account_id', this.accountId)
        .single()

      if (fetchError) {
        console.error('Error fetching session:', fetchError)
        return
      }

      const startTime = new Date(session.start_time)
      const totalTime = endTime.getTime() - startTime.getTime()

      // Update session in database
      const { error } = await this.supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          total_time_ms: totalTime
        })
        .eq('id', sessionId)
        .eq('account_id', this.accountId)

      if (error) {
        console.error('Error updating session:', error)
      }
    } catch (err) {
      console.error('Error ending session:', err)
    }
  }

  /**
   * Track practice start
   */
  async startPractice(userId: string, skillId: string): Promise<void> {
    await this.emitEvent('start_practice', userId, { skillId })
  }

  /**
   * Track item answered
   */
  async itemAnswered(
    userId: string, 
    itemId: string, 
    skillId: string, 
    isCorrect: boolean, 
    timeSpent: number
  ): Promise<void> {
    if (!this.accountId) return

    try {
      // Update current session if exists
      const { data: activeSession, error: sessionError } = await this.supabase
        .from('study_sessions')
        .select('id, items_completed, correct_answers')
        .eq('account_id', this.accountId)
        .is('end_time', null)
        .single()

      if (!sessionError && activeSession) {
        const updates = {
          items_completed: activeSession.items_completed + 1,
          correct_answers: activeSession.correct_answers + (isCorrect ? 1 : 0)
        }

        await this.supabase
          .from('study_sessions')
          .update(updates)
          .eq('id', activeSession.id)
      }

      // Track analytics event
      await this.emitEvent('item_answered', userId, { 
        itemId, 
        skillId, 
        isCorrect, 
        timeSpent 
      })
    } catch (err) {
      console.error('Error tracking item answer:', err)
    }
  }

  /**
   * Track skill mastery
   */
  async skillMastered(userId: string, skillId: string, probability: number): Promise<void> {
    await this.emitEvent('skill_mastered', userId, { skillId, probability })
  }

  /**
   * Track review due
   */
  async reviewDue(userId: string, skillId: string, itemId: string): Promise<void> {
    await this.emitEvent('review_due', userId, { skillId, itemId })
  }

  /**
   * Emit analytics event
   */
  private async emitEvent(type: AnalyticsEvent['type'], userId: string, data: Record<string, any>): Promise<void> {
    if (!this.accountId) {
      console.warn('Analytics: No account ID set, skipping event:', type)
      return
    }

    try {
      const event: AnalyticsEvent = {
        type,
        userId,
        timestamp: new Date(),
        data
      }

      // Save to Supabase
      const { error } = await this.supabase
        .from('analytics_events')
        .insert({
          account_id: this.accountId,
          event_type: type,
          event_data: data,
          timestamp: event.timestamp.toISOString()
        })

      if (error) {
        console.error('Error saving analytics event:', error)
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', event)
      }
    } catch (err) {
      console.error('Error emitting analytics event:', err)
    }
  }

  /**
   * Get analytics data for a user
   */
  async getUserAnalytics(userId: string): Promise<{
    totalSessions: number
    totalTime: number
    totalItems: number
    correctAnswers: number
    accuracy: number
    skillsMastered: number
    recentActivity: AnalyticsEvent[]
  }> {
    if (!this.accountId) {
      return {
        totalSessions: 0,
        totalTime: 0,
        totalItems: 0,
        correctAnswers: 0,
        accuracy: 0,
        skillsMastered: 0,
        recentActivity: []
      }
    }

    try {
      // Get sessions data
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('study_sessions')
        .select('total_time_ms, items_completed, correct_answers')
        .eq('account_id', this.accountId)

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError)
        return this.getDefaultAnalytics()
      }

      // Get analytics events
      const { data: events, error: eventsError } = await this.supabase
        .from('analytics_events')
        .select('event_type, event_data, timestamp')
        .eq('account_id', this.accountId)
        .order('timestamp', { ascending: false })
        .limit(50)

      if (eventsError) {
        console.error('Error fetching events:', eventsError)
        return this.getDefaultAnalytics()
      }

      // Calculate statistics
      const totalSessions = sessions?.length || 0
      const totalTime = sessions?.reduce((sum, s) => sum + (s.total_time_ms || 0), 0) || 0
      const totalItems = sessions?.reduce((sum, s) => sum + (s.items_completed || 0), 0) || 0
      const correctAnswers = sessions?.reduce((sum, s) => sum + (s.correct_answers || 0), 0) || 0
      const accuracy = totalItems > 0 ? (correctAnswers / totalItems) * 100 : 0
      const skillsMastered = events?.filter(e => e.event_type === 'skill_mastered').length || 0

      // Transform events to AnalyticsEvent format
      const recentActivity: AnalyticsEvent[] = (events || []).map(e => ({
        type: e.event_type as AnalyticsEvent['type'],
        userId,
        timestamp: new Date(e.timestamp),
        data: e.event_data
      }))

      return {
        totalSessions,
        totalTime,
        totalItems,
        correctAnswers,
        accuracy,
        skillsMastered,
        recentActivity
      }
    } catch (err) {
      console.error('Error getting user analytics:', err)
      return this.getDefaultAnalytics()
    }
  }

  /**
   * Get study streak for a user
   */
  async getStudyStreak(userId: string): Promise<number> {
    if (!this.accountId) return 0

    try {
      // Get session start events
      const { data: events, error } = await this.supabase
        .from('analytics_events')
        .select('timestamp')
        .eq('account_id', this.accountId)
        .eq('event_type', 'start_session')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error fetching streak data:', error)
        return 0
      }

      if (!events || events.length === 0) return 0

      // Group by date
      const dates = new Set(
        events.map(e => new Date(e.timestamp).toDateString())
      )

      const sortedDates = Array.from(dates)
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime())

      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < sortedDates.length; i++) {
        const date = sortedDates[i]
        date.setHours(0, 0, 0, 0)

        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)

        if (date.getTime() === expectedDate.getTime()) {
          streak++
        } else {
          break
        }
      }

      return streak
    } catch (err) {
      console.error('Error calculating study streak:', err)
      return 0
    }
  }

  /**
   * Get default analytics when there's an error
   */
  private getDefaultAnalytics() {
    return {
      totalSessions: 0,
      totalTime: 0,
      totalItems: 0,
      correctAnswers: 0,
      accuracy: 0,
      skillsMastered: 0,
      recentActivity: []
    }
  }

  /**
   * Clear all analytics data (for testing)
   */
  async clearData(): Promise<void> {
    if (!this.accountId) return

    try {
      // Clear analytics events
      await this.supabase
        .from('analytics_events')
        .delete()
        .eq('account_id', this.accountId)

      // Clear study sessions
      await this.supabase
        .from('study_sessions')
        .delete()
        .eq('account_id', this.accountId)

      console.log('Analytics data cleared for account:', this.accountId)
    } catch (err) {
      console.error('Error clearing analytics data:', err)
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(): Promise<{
    dailyStats: Array<{ date: string; sessions: number; items: number; accuracy: number }>
    subjectStats: Array<{ subject: string; sessions: number; time: number }>
    skillProgress: Array<{ skill: string; mastery: number; attempts: number }>
  }> {
    if (!this.accountId) {
      return {
        dailyStats: [],
        subjectStats: [],
        skillProgress: []
      }
    }

    try {
      // Get daily stats for last 30 days
      const { data: dailyData, error: dailyError } = await this.supabase
        .from('study_sessions')
        .select('start_time, items_completed, correct_answers')
        .eq('account_id', this.accountId)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (dailyError) {
        console.error('Error fetching daily stats:', dailyError)
        return { dailyStats: [], subjectStats: [], skillProgress: [] }
      }

      // Process daily stats
      const dailyStatsMap = new Map<string, { sessions: number; items: number; correct: number }>()
      
      dailyData?.forEach(session => {
        const date = new Date(session.start_time).toDateString()
        const existing = dailyStatsMap.get(date) || { sessions: 0, items: 0, correct: 0 }
        existing.sessions += 1
        existing.items += session.items_completed || 0
        existing.correct += session.correct_answers || 0
        dailyStatsMap.set(date, existing)
      })

      const dailyStats = Array.from(dailyStatsMap.entries()).map(([date, stats]) => ({
        date,
        sessions: stats.sessions,
        items: stats.items,
        accuracy: stats.items > 0 ? (stats.correct / stats.items) * 100 : 0
      }))

      // Get subject stats
      const { data: subjectData, error: subjectError } = await this.supabase
        .from('study_sessions')
        .select('subject_id, total_time_ms, items_completed')
        .eq('account_id', this.accountId)

      if (subjectError) {
        console.error('Error fetching subject stats:', subjectError)
        return { dailyStats, subjectStats: [], skillProgress: [] }
      }

      const subjectStatsMap = new Map<string, { sessions: number; time: number }>()
      
      subjectData?.forEach(session => {
        const subject = session.subject_id
        const existing = subjectStatsMap.get(subject) || { sessions: 0, time: 0 }
        existing.sessions += 1
        existing.time += session.total_time_ms || 0
        subjectStatsMap.set(subject, existing)
      })

      const subjectStats = Array.from(subjectStatsMap.entries()).map(([subject, stats]) => ({
        subject,
        sessions: stats.sessions,
        time: stats.time
      }))

      // Get skill progress
      const { data: skillData, error: skillError } = await this.supabase
        .from('mastery_states')
        .select('skill_id, probability, skills(name)')
        .eq('account_id', this.accountId)

      if (skillError) {
        console.error('Error fetching skill progress:', skillError)
        return { dailyStats, subjectStats, skillProgress: [] }
      }

      const skillProgress = skillData?.map(skill => ({
        skill: skill.skills?.name || skill.skill_id,
        mastery: Math.round(skill.probability * 100),
        attempts: 0 // This would need to be calculated from attempts table
      })) || []

      return {
        dailyStats,
        subjectStats,
        skillProgress
      }
    } catch (err) {
      console.error('Error getting dashboard data:', err)
      return {
        dailyStats: [],
        subjectStats: [],
        skillProgress: []
      }
    }
  }
}

// Export singleton instance
export const analyticsEngine = AnalyticsEngine.getInstance()