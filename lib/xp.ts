/**
 * XP System - Experience points and badges for Plugg Bot 1
 * Implements gamification with XP rewards and achievement badges
 */

import type { 
  UserProfile, 
  Badge, 
  SubjectId, 
  MasteryState,
  Attempt 
} from '../types/domain'
import { store } from './store'
import { masteryEngine } from './mastery'

export interface XPEvent {
  type: 'mastery' | 'streak' | 'correct_streak' | 'review_streak'
  userId: string
  skillId?: string
  subjectId?: SubjectId
  xpAwarded: number
  timestamp: Date
  description: string
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  condition: (userId: string) => boolean
  subjectId?: SubjectId
}

export class XPSystem {
  private static instance: XPSystem
  private xpEvents: XPEvent[] = []
  private badgeDefinitions: BadgeDefinition[] = []
  private userStreaks: Map<string, { correctStreak: number, lastAttempt: Date }> = new Map()

  private constructor() {
    this.initializeBadgeDefinitions()
    this.loadXPEvents()
    this.loadStreaks()
  }

  static getInstance(): XPSystem {
    if (!XPSystem.instance) {
      XPSystem.instance = new XPSystem()
    }
    return XPSystem.instance
  }

  /**
   * Award XP for various achievements
   */
  awardXP(
    type: XPEvent['type'],
    userId: string,
    options: {
      skillId?: string
      subjectId?: SubjectId
      xpAmount?: number
      description?: string
    } = {}
  ): XPEvent {
    const xpAmount = options.xpAmount || this.getXPAmount(type)
    const description = options.description || this.getXPDescription(type, options.subjectId)
    
    const event: XPEvent = {
      type,
      userId,
      skillId: options.skillId,
      subjectId: options.subjectId,
      xpAwarded: xpAmount,
      timestamp: new Date(),
      description
    }

    this.xpEvents.push(event)
    this.updateUserXP(userId, xpAmount)
    this.checkForBadges(userId)
    this.saveXPEvents()

    return event
  }

  /**
   * Get XP amount for different event types
   */
  private getXPAmount(type: XPEvent['type']): number {
    const xpRewards = {
      mastery: 100,        // First mastery per subject
      streak: 50,          // 10 items in a row
      correct_streak: 25, // Correct answers streak
      review_streak: 75   // First review streak
    }
    return xpRewards[type]
  }

  /**
   * Get XP description for different event types
   */
  private getXPDescription(type: XPEvent['type'], subjectId?: SubjectId): string {
    const descriptions = {
      mastery: `Första behärskning i ${subjectId || 'ämne'}`,
      streak: '10 rätta svar i rad',
      correct_streak: 'Rätt svar-streak',
      review_streak: 'Första review-streak'
    }
    return descriptions[type]
  }

  /**
   * Update user's total XP and level
   */
  private updateUserXP(userId: string, xpAmount: number): void {
    const profile = store.getProfile()
    if (profile.id !== userId) return

    const newTotalXP = profile.totalXP + xpAmount
    const newLevel = this.calculateLevel(newTotalXP)

    store.updateProfile({
      totalXP: newTotalXP,
      level: newLevel
    })
  }

  /**
   * Calculate level based on total XP
   */
  private calculateLevel(totalXP: number): number {
    // Level formula: Level = floor(sqrt(XP / 100)) + 1
    return Math.floor(Math.sqrt(totalXP / 100)) + 1
  }

  /**
   * Check for new badges and award them
   */
  private checkForBadges(userId: string): void {
    const profile = store.getProfile()
    if (profile.id !== userId) return

    for (const badgeDef of this.badgeDefinitions) {
      // Skip if user already has this badge
      if (profile.badges.some(badge => badge.id === badgeDef.id)) {
        continue
      }

      // Check if badge condition is met
      if (badgeDef.condition(userId)) {
        this.awardBadge(userId, badgeDef)
      }
    }
  }

  /**
   * Award a badge to the user
   */
  private awardBadge(userId: string, badgeDef: BadgeDefinition): void {
    const profile = store.getProfile()
    if (profile.id !== userId) return

    const badge: Badge = {
      id: badgeDef.id,
      name: badgeDef.name,
      description: badgeDef.description,
      icon: badgeDef.icon,
      earnedAt: new Date(),
      subjectId: badgeDef.subjectId
    }

    const updatedBadges = [...profile.badges, badge]
    store.updateProfile({ badges: updatedBadges })

    // Award XP for badge
    this.awardXP('mastery', userId, {
      xpAmount: badgeDef.xpReward,
      description: `Badge: ${badgeDef.name}`
    })
  }

  /**
   * Initialize badge definitions
   */
  private initializeBadgeDefinitions(): void {
    this.badgeDefinitions = [
      // First mastery per subject badges
      {
        id: 'first-mastery-matematik',
        name: 'Matematik-mästare',
        description: 'Din första behärskning i matematik',
        icon: '🧮',
        xpReward: 50,
        subjectId: 'matematik',
        condition: (userId) => this.hasFirstMasteryInSubject(userId, 'matematik')
      },
      {
        id: 'first-mastery-fysik',
        name: 'Fysik-fenomen',
        description: 'Din första behärskning i fysik',
        icon: '⚡',
        xpReward: 50,
        subjectId: 'fysik',
        condition: (userId) => this.hasFirstMasteryInSubject(userId, 'fysik')
      },
      {
        id: 'first-mastery-svenska',
        name: 'Svenska-stjärna',
        description: 'Din första behärskning i svenska',
        icon: '📚',
        xpReward: 50,
        subjectId: 'svenska',
        condition: (userId) => this.hasFirstMasteryInSubject(userId, 'svenska')
      },
      {
        id: 'first-mastery-engelska',
        name: 'English Expert',
        description: 'Din första behärskning i engelska',
        icon: '🇬🇧',
        xpReward: 50,
        subjectId: 'engelska',
        condition: (userId) => this.hasFirstMasteryInSubject(userId, 'engelska')
      },
      {
        id: 'first-mastery-kemi',
        name: 'Kemi-kemist',
        description: 'Din första behärskning i kemi',
        icon: '🧪',
        xpReward: 50,
        subjectId: 'kemi',
        condition: (userId) => this.hasFirstMasteryInSubject(userId, 'kemi')
      },
      {
        id: 'first-mastery-biologi',
        name: 'Biologi-biolog',
        description: 'Din första behärskning i biologi',
        icon: '🧬',
        xpReward: 50,
        subjectId: 'biologi',
        condition: (userId) => this.hasFirstMasteryInSubject(userId, 'biologi')
      },
      
      // 10 items in a row badge
      {
        id: 'perfect-streak',
        name: 'Perfekt Streak',
        description: '10 rätta svar i rad',
        icon: '🔥',
        xpReward: 100,
        condition: (userId) => this.hasPerfectStreak(userId)
      },
      
      // First review streak badge
      {
        id: 'review-master',
        name: 'Review-mästare',
        description: 'Din första review-streak',
        icon: '🔄',
        xpReward: 75,
        condition: (userId) => this.hasReviewStreak(userId)
      }
    ]
  }

  /**
   * Check if user has first mastery in a specific subject
   */
  private hasFirstMasteryInSubject(userId: string, subjectId: SubjectId): boolean {
    const masteryStates = store.getUserMasteryStates(userId)
    return masteryStates.some(state => 
      state.isMastered && 
      this.getSubjectIdFromSkillId(state.skillId) === subjectId
    )
  }

  /**
   * Check if user has perfect streak (10 correct in a row)
   */
  private hasPerfectStreak(userId: string): boolean {
    return this.getUserStreak(userId) >= 10
  }

  /**
   * Check if user has review streak
   */
  private hasReviewStreak(userId: string): boolean {
    const spacedItems = store.getUserSpacedRepetitionItems(userId)
    return spacedItems.some(item => item.repetitions >= 3)
  }

  /**
   * Get subject ID from skill ID (simplified - would need actual skill data)
   */
  private getSubjectIdFromSkillId(skillId: string): SubjectId | null {
    // This is a simplified implementation
    // In a real system, you'd look up the skill in the skills data
    const subjectMap: Record<string, SubjectId> = {
      'math': 'matematik',
      'physics': 'fysik',
      'swedish': 'svenska',
      'english': 'engelska',
      'chemistry': 'kemi',
      'biology': 'biologi'
    }
    
    for (const [key, subjectId] of Object.entries(subjectMap)) {
      if (skillId.toLowerCase().includes(key)) {
        return subjectId
      }
    }
    
    return null
  }

  /**
   * Get user's XP events
   */
  getUserXPEvents(userId: string, limit?: number): XPEvent[] {
    const userEvents = this.xpEvents.filter(event => event.userId === userId)
    return limit ? userEvents.slice(-limit) : userEvents
  }

  /**
   * Get user's total XP
   */
  getUserTotalXP(userId: string): number {
    const profile = store.getProfile()
    return profile.id === userId ? profile.totalXP : 0
  }

  /**
   * Get user's current level
   */
  getUserLevel(userId: string): number {
    const profile = store.getProfile()
    return profile.id === userId ? profile.level : 1
  }

  /**
   * Get XP needed for next level
   */
  getXPToNextLevel(userId: string): number {
    const currentLevel = this.getUserLevel(userId)
    const nextLevelXP = Math.pow(currentLevel, 2) * 100
    const currentXP = this.getUserTotalXP(userId)
    return Math.max(0, nextLevelXP - currentXP)
  }

  /**
   * Get user's badges
   */
  getUserBadges(userId: string): Badge[] {
    const profile = store.getProfile()
    return profile.id === userId ? profile.badges : []
  }

  /**
   * Get available badges (not yet earned)
   */
  getAvailableBadges(userId: string): BadgeDefinition[] {
    const profile = store.getProfile()
    if (profile.id !== userId) return []

    const earnedBadgeIds = profile.badges.map(badge => badge.id)
    return this.badgeDefinitions.filter(badgeDef => 
      !earnedBadgeIds.includes(badgeDef.id)
    )
  }

  /**
   * Process attempt and check for XP/badge opportunities
   */
  processAttempt(attempt: Attempt): void {
    const userId = attempt.userId
    const skillId = attempt.skillId

    // Update streak tracking
    this.updateStreak(userId, attempt.isCorrect)

    // Award XP for correct answer
    if (attempt.isCorrect) {
      this.awardXP('correct_streak', userId, {
        skillId,
        xpAmount: 10,
        description: 'Rätt svar'
      })
    }

    // Check for mastery achievement
    const masteryState = masteryEngine.getMasteryState(skillId, userId)
    if (masteryState?.isMastered && masteryState.masteryDate) {
      const timeDiff = Date.now() - masteryState.masteryDate.getTime()
      // Only award if mastery was achieved recently (within last minute)
      if (timeDiff < 60000) {
        const subjectId = this.getSubjectIdFromSkillId(skillId)
        this.awardXP('mastery', userId, {
          skillId,
          subjectId: subjectId || undefined,
          description: `Behärskning: ${skillId}`
        })
      }
    }
  }

  /**
   * Update user's correct answer streak
   */
  private updateStreak(userId: string, isCorrect: boolean): void {
    const now = new Date()
    const streakData = this.userStreaks.get(userId) || { correctStreak: 0, lastAttempt: now }
    
    // Reset streak if more than 24 hours have passed
    const hoursSinceLastAttempt = (now.getTime() - streakData.lastAttempt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastAttempt > 24) {
      streakData.correctStreak = 0
    }
    
    if (isCorrect) {
      streakData.correctStreak += 1
      
      // Check for perfect streak achievement (10 in a row)
      if (streakData.correctStreak === 10) {
        this.awardXP('streak', userId, {
          xpAmount: 50,
          description: '10 rätta svar i rad!'
        })
      }
    } else {
      streakData.correctStreak = 0
    }
    
    streakData.lastAttempt = now
    this.userStreaks.set(userId, streakData)
    this.saveStreaks()
  }

  /**
   * Get user's current correct streak
   */
  getUserStreak(userId: string): number {
    const streakData = this.userStreaks.get(userId)
    if (!streakData) return 0
    
    // Reset streak if more than 24 hours have passed
    const now = new Date()
    const hoursSinceLastAttempt = (now.getTime() - streakData.lastAttempt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastAttempt > 24) {
      return 0
    }
    
    return streakData.correctStreak
  }

  /**
   * Load XP events from storage
   */
  private loadXPEvents(): void {
    try {
      if (typeof window === 'undefined') return
      const eventsData = localStorage.getItem('plugg-bot-xp-events')
      if (eventsData) {
        const parsed = JSON.parse(eventsData)
        this.xpEvents = parsed.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load XP events:', error)
      this.xpEvents = []
    }
  }

  /**
   * Save XP events to storage
   */
  private saveXPEvents(): void {
    try {
      localStorage.setItem('plugg-bot-xp-events', JSON.stringify(this.xpEvents))
    } catch (error) {
      console.error('Failed to save XP events:', error)
    }
  }

  /**
   * Load streaks from storage
   */
  private loadStreaks(): void {
    try {
      if (typeof window === 'undefined') return
      const streaksData = localStorage.getItem('plugg-bot-streaks')
      if (streaksData) {
        const parsed = JSON.parse(streaksData)
        this.userStreaks = new Map(parsed.map(([userId, data]: [string, any]) => [
          userId,
          {
            ...data,
            lastAttempt: new Date(data.lastAttempt)
          }
        ]))
      }
    } catch (error) {
      console.error('Failed to load streaks:', error)
      this.userStreaks = new Map()
    }
  }

  /**
   * Save streaks to storage
   */
  private saveStreaks(): void {
    try {
      const serialized = Array.from(this.userStreaks.entries())
      localStorage.setItem('plugg-bot-streaks', JSON.stringify(serialized))
    } catch (error) {
      console.error('Failed to save streaks:', error)
    }
  }
}

// Export singleton instance
export const xpSystem = XPSystem.getInstance()
