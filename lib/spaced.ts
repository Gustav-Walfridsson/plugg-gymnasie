/**
 * Spaced Repetition System - Plugg Bot 1
 * Implements bucket-based scheduling with decay logic for English and Biology
 * Buckets: 0.5→8h, 0.6→1d, 0.7→3d, 0.8→1w, 0.9→3w
 */

import type { 
  SpacedRepetitionItem, 
  SubjectId, 
  MasteryState 
} from '../types/domain'
import { store } from './store'
import { analyticsEngine } from './analytics'

export interface SpacedRepetitionBucket {
  probabilityRange: [number, number]
  intervalHours: number
  name: string
}

export interface DecayConfig {
  enabled: boolean
  decayRate: number // per day
  minProbability: number
}

export class SpacedRepetitionEngine {
  private static instance: SpacedRepetitionEngine
  private items: Map<string, SpacedRepetitionItem> = new Map()
  
  // Bucket configuration as specified
  private readonly buckets: SpacedRepetitionBucket[] = [
    { probabilityRange: [0.5, 0.6], intervalHours: 8, name: '8 timmar' },
    { probabilityRange: [0.6, 0.7], intervalHours: 24, name: '1 dag' },
    { probabilityRange: [0.7, 0.8], intervalHours: 72, name: '3 dagar' },
    { probabilityRange: [0.8, 0.9], intervalHours: 168, name: '1 vecka' },
    { probabilityRange: [0.9, 1.0], intervalHours: 504, name: '3 veckor' }
  ]
  
  private readonly decayConfig: DecayConfig = {
    enabled: true,
    decayRate: 0.02, // 2% per day
    minProbability: 0.3
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
    }
  }

  static getInstance(): SpacedRepetitionEngine {
    if (!SpacedRepetitionEngine.instance) {
      SpacedRepetitionEngine.instance = new SpacedRepetitionEngine()
    }
    return SpacedRepetitionEngine.instance
  }

  /**
   * Check if spaced repetition applies to a skill
   */
  shouldUseSpacedRepetition(skillId: string, subjectId: SubjectId): boolean {
    // Only use spaced repetition for English vocabulary and Biology flashcards
    return subjectId === 'engelska' || subjectId === 'biologi'
  }

  /**
   * Schedule or update spaced repetition for a skill
   */
  scheduleRepetition(
    skillId: string, 
    userId: string, 
    masteryState: MasteryState,
    isCorrect: boolean
  ): SpacedRepetitionItem {
    const key = `${userId}-${skillId}`
    let item = this.items.get(key)
    
    if (!item) {
      // Create initial item
      item = this.createInitialItem(skillId, userId, masteryState.probability)
    }
    
    // Update item based on performance (for both new and existing items)
    this.updateItem(item, masteryState.probability, isCorrect)
    
    this.items.set(key, item)
    store.setSpacedRepetitionItem(item)
    
    // Emit analytics event for review due
    analyticsEngine.reviewDue(userId, skillId, item.id)
    
    // Return a copy to avoid reference issues
    return { ...item }
  }

  /**
   * Create initial spaced repetition item
   */
  private createInitialItem(
    skillId: string, 
    userId: string, 
    probability: number
  ): SpacedRepetitionItem {
    const bucket = this.getBucketForProbability(probability)
    const now = new Date()
    
    return {
      id: `${userId}-${skillId}`,
      skillId,
      userId,
      interval: bucket.intervalHours,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: new Date(now.getTime() + bucket.intervalHours * 60 * 60 * 1000),
      lastReview: undefined
    }
  }

  /**
   * Update existing item based on performance
   */
  private updateItem(
    item: SpacedRepetitionItem, 
    probability: number, 
    isCorrect: boolean
  ): void {
    const bucket = this.getBucketForProbability(probability)
    
    if (isCorrect) {
      // Correct answer - move to next bucket or extend interval
      item.repetitions += 1
      item.easeFactor = Math.min(3.0, item.easeFactor + 0.1)
      
      // Only extend interval after the first correct answer (repetitions > 1)
      if (item.repetitions > 1) {
        const newInterval = Math.round(item.interval * item.easeFactor)
        item.interval = Math.max(bucket.intervalHours, newInterval)
      }
    } else {
      // Wrong answer - reset to shorter interval
      item.repetitions = 0 // Reset repetitions on wrong answer
      item.easeFactor = Math.max(1.3, item.easeFactor - 0.2)
      item.interval = Math.max(8, Math.round(item.interval / 2))
    }
    
    // Set next review time
    const now = new Date()
    item.nextReview = new Date(now.getTime() + item.interval * 60 * 60 * 1000)
    item.lastReview = now
  }

  /**
   * Get bucket for given probability
   */
  private getBucketForProbability(probability: number): SpacedRepetitionBucket {
    for (const bucket of this.buckets) {
      if (probability >= bucket.probabilityRange[0] && probability < bucket.probabilityRange[1]) {
        return bucket
      }
    }
    
    // Default to highest bucket for probabilities >= 0.9
    return this.buckets[this.buckets.length - 1]
  }

  /**
   * Get items due for review
   */
  getDueItems(userId: string): SpacedRepetitionItem[] {
    // Load fresh data from store
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
    }
    
    const now = new Date()
    const dueItems: SpacedRepetitionItem[] = []
    
    for (const item of this.items.values()) {
      if (item.userId === userId && item.nextReview <= now) {
        dueItems.push(item)
      }
    }
    
    // Also check items directly from store
    const userItems = store.getUserSpacedRepetitionItems(userId)
    for (const item of userItems) {
      if (item.nextReview <= now && !dueItems.find(d => d.id === item.id)) {
        dueItems.push(item)
      }
    }
    
    return dueItems.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
  }

  /**
   * Get items due soon (within next 24 hours)
   */
  getItemsDueSoon(userId: string): SpacedRepetitionItem[] {
    // Load fresh data from store
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
    }
    
    const now = new Date()
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
    const dueSoon: SpacedRepetitionItem[] = []
    
    for (const item of this.items.values()) {
      if (item.userId === userId && 
          item.nextReview > now && 
          item.nextReview <= soon) {
        dueSoon.push(item)
      }
    }
    
    // Also check items directly from store
    const userItems = store.getUserSpacedRepetitionItems(userId)
    for (const item of userItems) {
      if (item.userId === userId && 
          item.nextReview > now && 
          item.nextReview <= soon &&
          !dueSoon.find(d => d.id === item.id)) {
        dueSoon.push(item)
      }
    }
    
    return dueSoon.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
  }

  /**
   * Apply decay to items that haven't been reviewed
   */
  applyDecay(userId: string): void {
    if (!this.decayConfig.enabled) return
    
    // Load items for the specified user
    const userItems = store.getUserSpacedRepetitionItems(userId)
    
    const now = new Date()
    let hasChanges = false
    
    for (const item of userItems) {
      // Only apply decay to items that are overdue
      if (item.nextReview < now) {
        const daysOverdue = (now.getTime() - item.nextReview.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysOverdue > 0) {
          // Reduce ease factor based on how overdue
          const decayFactor = Math.pow(1 - this.decayConfig.decayRate, daysOverdue)
          item.easeFactor = Math.max(1.3, item.easeFactor * decayFactor)
          
          // Reduce interval slightly
          item.interval = Math.max(8, Math.round(item.interval * 0.9))
          
          // Update in store and internal map
          store.setSpacedRepetitionItem(item)
          this.items.set(item.id, item)
          hasChanges = true
        }
      }
    }
  }

  /**
   * Get statistics for spaced repetition
   */
  getStats(userId: string): {
    totalItems: number
    dueItems: number
    dueSoonItems: number
    averageInterval: number
    averageEaseFactor: number
    bucketDistribution: Record<string, number>
  } {
    // Load fresh data from store
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
    }
    
    // Get items from both internal map and store
    const internalItems = Array.from(this.items.values()).filter(item => item.userId === userId)
    const storeItems = typeof window !== 'undefined' ? store.getUserSpacedRepetitionItems(userId) : []
    
    // Combine and deduplicate items
    const allItems = [...internalItems]
    for (const storeItem of storeItems) {
      if (!allItems.find(item => item.id === storeItem.id)) {
        allItems.push(storeItem)
      }
    }
    
    const dueItems = this.getDueItems(userId)
    const dueSoonItems = this.getItemsDueSoon(userId)
    
    const totalItems = allItems.length
    const averageInterval = allItems.length > 0 
      ? allItems.reduce((sum, item) => sum + item.interval, 0) / allItems.length 
      : 0
    const averageEaseFactor = allItems.length > 0
      ? allItems.reduce((sum, item) => sum + item.easeFactor, 0) / allItems.length
      : 0
    
    // Calculate bucket distribution
    const bucketDistribution: Record<string, number> = {}
    for (const bucket of this.buckets) {
      bucketDistribution[bucket.name] = 0
    }
    
    for (const item of allItems) {
      const bucket = this.getBucketForInterval(item.interval)
      if (bucket) {
        bucketDistribution[bucket.name]++
      }
    }
    
    return {
      totalItems,
      dueItems: dueItems.length,
      dueSoonItems: dueSoonItems.length,
      averageInterval,
      averageEaseFactor,
      bucketDistribution
    }
  }

  /**
   * Get bucket for given interval
   */
  private getBucketForInterval(intervalHours: number): SpacedRepetitionBucket | null {
    for (const bucket of this.buckets) {
      if (Math.abs(bucket.intervalHours - intervalHours) <= 1) {
        return bucket
      }
    }
    return null
  }

  /**
   * Remove item from spaced repetition
   */
  removeItem(skillId: string, userId: string): boolean {
    const key = `${userId}-${skillId}`
    const removed = this.items.delete(key)
    if (removed) {
      this.saveToStorage()
    }
    return removed
  }

  /**
   * Clear all items for a user
   */
  clearUserItems(userId: string): void {
    const keysToDelete: string[] = []
    
    for (const [key, item] of this.items) {
      if (item.userId === userId) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.items.delete(key))
    this.saveToStorage()
  }

  /**
   * Clear all items (for testing)
   */
  clearAllItems(): void {
    this.items.clear()
  }

  /**
   * Load data from store
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const userId = store.getProfile().id
      const userItems = store.getUserSpacedRepetitionItems(userId)
      
      this.items = new Map()
      userItems.forEach(item => {
        this.items.set(item.id, item)
      })
    } catch (error) {
      console.error('Failed to load spaced repetition data:', error)
    }
  }

  /**
   * Save data to store
   */
  private saveToStorage(): void {
    try {
      // Data is already saved via store.setSpacedRepetitionItem calls
      // This method is kept for compatibility but does nothing
    } catch (error) {
      console.error('Failed to save spaced repetition data:', error)
    }
  }
}

// Export singleton instance
export const spacedRepetitionEngine = SpacedRepetitionEngine.getInstance()
