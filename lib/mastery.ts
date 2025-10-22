/**
 * Mastery Engine - Core learning algorithm for Plugg Bot 1
 * Implements p-model with adaptive difficulty and spaced repetition
 */

import type { 
  MasteryState, 
  Attempt, 
  SpacedRepetitionItem, 
  Skill, 
  SubjectId 
} from '../types/domain'
import { store } from './store'
import { analyticsEngine } from './analytics'
import { xpSystem } from './xp'

export class MasteryEngine {
  private static instance: MasteryEngine
  private masteryStates: Map<string, MasteryState> = new Map()
  private spacedRepetitionItems: Map<string, SpacedRepetitionItem> = new Map()

  private constructor() {
    if (typeof window !== 'undefined') {
      // Load data asynchronously
      this.loadFromStorage().catch(error => {
        console.error('Failed to load mastery data on initialization:', error)
      })
    }
  }

  static getInstance(): MasteryEngine {
    if (!MasteryEngine.instance) {
      MasteryEngine.instance = new MasteryEngine()
    }
    return MasteryEngine.instance
  }

  /**
   * Process an attempt and update mastery state
   */
  async processAttempt(attempt: Attempt): Promise<MasteryState> {
    const skillId = attempt.skillId
    const userId = attempt.userId
    const key = `${userId}-${skillId}`
    
    let masteryState = this.masteryStates.get(key)
    const isNewSkill = !masteryState
    
    if (!masteryState) {
      masteryState = this.createInitialMasteryState(skillId, userId)
    }

    // Update mastery probability using p-model
    const newProbability = this.updateMasteryProbability(
      masteryState.probability,
      attempt.isCorrect,
      attempt.timeSpent
    )

    // Update mastery state
    masteryState.probability = newProbability
    masteryState.attempts += 1
    masteryState.correctAttempts += attempt.isCorrect ? 1 : 0
    masteryState.lastAttempt = attempt.timestamp
    masteryState.lastMasteryUpdate = new Date()
    
    // Check if skill is now mastered
    const wasMastered = masteryState.isMastered
    masteryState.isMastered = newProbability >= 0.9
    
    if (masteryState.isMastered && !wasMastered) {
      masteryState.masteryDate = new Date()
      analyticsEngine.skillMastered(userId, skillId, newProbability)
      
      // Award XP for mastery achievement
      xpSystem.processAttempt(attempt)
    }

    this.masteryStates.set(key, masteryState)
    await store.setMasteryState(masteryState)
    
    // Return a copy to avoid reference issues
    return { ...masteryState }
  }

  /**
   * Update mastery probability using p-model
   */
  private updateMasteryProbability(
    currentProbability: number,
    isCorrect: boolean,
    timeSpent: number
  ): number {
    // Base learning rate - start with a reasonable value
    let learningRate = 0.25
    
    // Adjust learning rate based on time spent (faster = more confident)
    const timeFactor = Math.max(0.5, Math.min(2.0, 10000 / timeSpent)) // 10s baseline
    learningRate *= timeFactor
    
    // Adjust based on current probability (harder to improve when already high)
    const difficultyFactor = 1 - currentProbability
    learningRate *= difficultyFactor

    // Ensure minimum learning rate for meaningful changes
    learningRate = Math.max(0.12, learningRate)

    let newProbability: number
    
    if (isCorrect) {
      // Increase probability - ensure it always increases
      const increase = learningRate * (1 - currentProbability)
      newProbability = currentProbability + increase
    } else {
      // Decrease probability (but not too much)
      const decrease = learningRate * currentProbability * 0.5
      newProbability = currentProbability - decrease
    }
    
    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, newProbability))
  }

  /**
   * Create initial mastery state for a skill
   */
  private createInitialMasteryState(skillId: string, userId: string): MasteryState {
    return {
      skillId,
      userId,
      probability: 0.5, // Start at 50%
      attempts: 0,
      correctAttempts: 0,
      lastAttempt: new Date(),
      lastMasteryUpdate: new Date(),
      isMastered: false
    }
  }

  /**
   * Get mastery state for a skill
   */
  async getMasteryState(skillId: string, userId: string): Promise<MasteryState | null> {
    const key = `${userId}-${skillId}`
    let state = this.masteryStates.get(key)
    
    // If not in memory, try to load from store
    if (!state) {
      state = await store.getMasteryState(skillId, userId)
      if (state) {
        this.masteryStates.set(key, state)
      }
    }
    
    return state || null
  }

  /**
   * Get mastery level (nybörjare, lärande, behärskad)
   */
  async getMasteryLevel(skillId: string, userId: string): Promise<'nybörjare' | 'lärande' | 'behärskad'> {
    const state = await this.getMasteryState(skillId, userId)
    if (!state) return 'nybörjare'
    
    if (state.probability >= 0.9) return 'behärskad'
    if (state.probability >= 0.6) return 'lärande'
    return 'nybörjare'
  }

  /**
   * Get mastery percentage (0-100)
   */
  async getMasteryPercentage(skillId: string, userId: string): Promise<number> {
    const state = await this.getMasteryState(skillId, userId)
    if (!state) return 0
    return Math.round(state.probability * 100)
  }

  /**
   * Spaced Repetition System (for English and Biology flashcards)
   */
  async scheduleSpacedRepetition(skillId: string, userId: string, isCorrect: boolean): Promise<SpacedRepetitionItem> {
    const key = `${userId}-${skillId}`
    let item = this.spacedRepetitionItems.get(key)
    
    if (!item) {
      item = this.createInitialSpacedRepetitionItem(skillId, userId)
    }
    
    // Update based on performance
    if (isCorrect) {
      item.repetitions += 1
      item.easeFactor = Math.max(1.3, item.easeFactor + 0.1)
      item.interval = Math.round(item.interval * item.easeFactor)
    } else {
      item.repetitions = 0
      item.easeFactor = Math.max(1.3, item.easeFactor - 0.2)
      item.interval = Math.max(1, Math.round(item.interval / 2))
    }
    
    // Set next review time
    item.nextReview = new Date(Date.now() + item.interval * 60 * 60 * 1000) // Convert hours to ms
    item.lastReview = new Date()
    
    this.spacedRepetitionItems.set(key, item)
    await store.setSpacedRepetitionItem(item)
    
    return item
  }

  /**
   * Create initial spaced repetition item
   */
  private createInitialSpacedRepetitionItem(skillId: string, userId: string): SpacedRepetitionItem {
    return {
      id: `${userId}-${skillId}`,
      skillId,
      userId,
      interval: 8, // Start with 8 hours
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      lastReview: undefined
    }
  }

  /**
   * Get items due for review
   */
  async getDueItems(userId: string): Promise<SpacedRepetitionItem[]> {
    const now = new Date()
    const dueItems: SpacedRepetitionItem[] = []
    
    // Load all spaced repetition items for the user
    const userItems = await store.getUserSpacedRepetitionItems(userId)
    
    for (const item of userItems) {
      if (item.nextReview <= now) {
        dueItems.push(item)
      }
    }
    
    return dueItems.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
  }

  /**
   * Check if spaced repetition applies to a skill
   */
  shouldUseSpacedRepetition(skillId: string, subjectId: SubjectId): boolean {
    // Only use spaced repetition for English vocabulary and Biology flashcards
    return subjectId === 'engelska' || subjectId === 'biologi'
  }

  /**
   * Get weak skills for a user
   */
  async getWeakSkills(userId: string, limit: number = 3): Promise<Array<{skillId: string, weaknessScore: number}>> {
    const weakSkills: Array<{skillId: string, weaknessScore: number}> = []
    
    // Load all mastery states for the user
    const userMasteryStates = await store.getUserMasteryStates(userId)
    
    for (const state of userMasteryStates) {
      if (!state.isMastered) {
        // Calculate weakness score (higher = weaker)
        const timeSinceLastAttempt = Date.now() - state.lastAttempt.getTime()
        const daysSinceAttempt = timeSinceLastAttempt / (1000 * 60 * 60 * 24)
        
        const weaknessScore = (1 - state.probability) + (daysSinceAttempt / 30) // Decay over time
        
        weakSkills.push({
          skillId: state.skillId,
          weaknessScore
        })
      }
    }
    
    return weakSkills
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, limit)
  }

  /**
   * Clear all mastery states (for testing)
   */
  clearAllStates(): void {
    this.masteryStates.clear()
    this.spacedRepetitionItems.clear()
  }

  /**
   * Load data from store
   */
  private async loadFromStorage(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // Load mastery states from store
      const profile = await store.getProfile()
      const userId = profile.id
      const userMasteryStates = await store.getUserMasteryStates(userId)
      
      this.masteryStates = new Map()
      userMasteryStates.forEach(state => {
        const key = `${state.userId}-${state.skillId}`
        this.masteryStates.set(key, state)
      })
      
      // Load spaced repetition items from store
      const userSpacedItems = await store.getUserSpacedRepetitionItems(userId)
      this.spacedRepetitionItems = new Map()
      userSpacedItems.forEach(item => {
        this.spacedRepetitionItems.set(item.id, item)
      })
    } catch (error) {
      console.error('Failed to load mastery data:', error)
    }
  }
}

// Export singleton instance
export const masteryEngine = MasteryEngine.getInstance()
