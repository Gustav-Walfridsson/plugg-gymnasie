/**
 * Unit tests for Mastery Engine and Spaced Repetition System
 * Tests p-model implementation and bucket-based scheduling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MasteryEngine } from '../lib/mastery'
import { SpacedRepetitionEngine } from '../lib/spaced'
import { Store } from '../lib/store'
import type { Attempt, MasteryState, SpacedRepetitionItem } from '../types/domain'

// Get localStorage mock from global setup
const localStorageMock = global.localStorage

describe('MasteryEngine', () => {
  let masteryEngine: MasteryEngine
  let store: Store

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    // Get fresh instances
    masteryEngine = MasteryEngine.getInstance()
    masteryEngine.clearAllStates()
    store = Store.getInstance()
    
    // Clear any existing data
    store.clearAll()
  })

  describe('p-model implementation', () => {
    it('should start with probability 0.5 for new skills', () => {
      const skillId = 'test-skill-1'
      const userId = 'test-user'
      
      // Check initial state before any attempts
      const initialState = masteryEngine.getMasteryState(skillId, userId)
      expect(initialState).toBeNull()
      
      const attempt: Attempt = {
        id: 'test-attempt-1',
        itemId: 'test-item-1',
        skillId,
        userId,
        answer: 'correct',
        isCorrect: true,
        timestamp: new Date(),
        timeSpent: 5000
      }

      const result = masteryEngine.processAttempt(attempt)
      
      // After first attempt, probability should be slightly higher than 0.5
      expect(result.probability).toBeGreaterThan(0.5)
      expect(result.attempts).toBe(1)
      expect(result.correctAttempts).toBe(1)
      expect(result.isMastered).toBe(false)
    })

    it('should increase probability on correct answers', () => {
      const skillId = 'test-skill-2'
      const userId = 'test-user'
      
      // First attempt - correct
      const attempt1: Attempt = {
        id: 'test-attempt-1',
        itemId: 'test-item-1',
        skillId,
        userId,
        answer: 'correct',
        isCorrect: true,
        timestamp: new Date(),
        timeSpent: 5000
      }

      const result1 = masteryEngine.processAttempt(attempt1)
      expect(result1.probability).toBeGreaterThan(0.5)

      // Second attempt - correct
      const attempt2: Attempt = {
        id: 'test-attempt-2',
        itemId: 'test-item-2',
        skillId,
        userId,
        answer: 'correct',
        isCorrect: true,
        timestamp: new Date(),
        timeSpent: 4000
      }

      const result2 = masteryEngine.processAttempt(attempt2)
      expect(result2.probability).toBeGreaterThan(result1.probability)
    })

    it('should decrease probability on incorrect answers', () => {
      const skillId = 'test-skill-3'
      const userId = 'test-user'
      
      // First attempt - correct
      const attempt1: Attempt = {
        id: 'test-attempt-1',
        itemId: 'test-item-1',
        skillId,
        userId,
        answer: 'correct',
        isCorrect: true,
        timestamp: new Date(),
        timeSpent: 5000
      }

      const result1 = masteryEngine.processAttempt(attempt1)

      // Second attempt - incorrect
      const attempt2: Attempt = {
        id: 'test-attempt-2',
        itemId: 'test-item-2',
        skillId,
        userId,
        answer: 'wrong',
        isCorrect: false,
        timestamp: new Date(),
        timeSpent: 3000
      }

      const result2 = masteryEngine.processAttempt(attempt2)
      expect(result2.probability).toBeLessThan(result1.probability)
    })

    it('should achieve mastery at probability >= 0.9', () => {
      const skillId = 'test-skill-1'
      const userId = 'test-user'
      
      // Simulate multiple correct attempts to reach mastery
      let currentProbability = 0.5
      let attempts = 0
      
      while (currentProbability < 0.9 && attempts < 50) {
        const attempt: Attempt = {
          id: `test-attempt-${attempts}`,
          itemId: `test-item-${attempts}`,
          skillId,
          userId,
          answer: 'correct',
          isCorrect: true,
          timestamp: new Date(),
          timeSpent: 5000
        }

        const result = masteryEngine.processAttempt(attempt)
        currentProbability = result.probability
        attempts++
      }

      expect(currentProbability).toBeGreaterThanOrEqual(0.9)
      
      const masteryState = masteryEngine.getMasteryState(skillId, userId)
      expect(masteryState?.isMastered).toBe(true)
      expect(masteryState?.masteryDate).toBeDefined()
    })

    it('should adjust learning rate based on time spent', () => {
      const skillId = 'test-skill-1'
      const userId = 'test-user'
      
      // Fast correct answer (should increase probability more)
      const fastAttempt: Attempt = {
        id: 'fast-attempt',
        itemId: 'test-item-1',
        skillId,
        userId,
        answer: 'correct',
        isCorrect: true,
        timestamp: new Date(),
        timeSpent: 2000 // 2 seconds
      }

      const fastResult = masteryEngine.processAttempt(fastAttempt)

      // Reset for slow attempt
      masteryEngine = MasteryEngine.getInstance()
      masteryEngine.clearAllStates()
      store.clearAll()

      // Slow correct answer (should increase probability less)
      const slowAttempt: Attempt = {
        id: 'slow-attempt',
        itemId: 'test-item-1',
        skillId,
        userId,
        answer: 'correct',
        isCorrect: true,
        timestamp: new Date(),
        timeSpent: 15000 // 15 seconds
      }

      const slowResult = masteryEngine.processAttempt(slowAttempt)

      // Fast answer should result in higher probability increase
      expect(fastResult.probability).toBeGreaterThan(slowResult.probability)
    })
  })

  describe('mastery level classification', () => {
    it('should classify as nybörjare for new skills', () => {
      const level = masteryEngine.getMasteryLevel('new-skill', 'test-user')
      expect(level).toBe('nybörjare')
    })

    it('should classify as lärande for probability >= 0.6', () => {
      const skillId = 'test-skill-1'
      const userId = 'test-user'
      
      // Simulate progress to lärande level
      for (let i = 0; i < 10; i++) {
        const attempt: Attempt = {
          id: `attempt-${i}`,
          itemId: `item-${i}`,
          skillId,
          userId,
          answer: 'correct',
          isCorrect: true,
          timestamp: new Date(),
          timeSpent: 5000
        }
        masteryEngine.processAttempt(attempt)
      }

      const level = masteryEngine.getMasteryLevel(skillId, userId)
      expect(level).toBe('lärande')
    })

    it('should classify as behärskad for mastered skills', () => {
      const skillId = 'test-skill-1'
      const userId = 'test-user'
      
      // Simulate mastery
      for (let i = 0; i < 50; i++) {
        const attempt: Attempt = {
          id: `attempt-${i}`,
          itemId: `item-${i}`,
          skillId,
          userId,
          answer: 'correct',
          isCorrect: true,
          timestamp: new Date(),
          timeSpent: 5000
        }
        masteryEngine.processAttempt(attempt)
      }

      const level = masteryEngine.getMasteryLevel(skillId, userId)
      expect(level).toBe('behärskad')
    })
  })

  describe('weak skills detection', () => {
    it('should identify weak skills correctly', () => {
      const userId = 'test-user'
      
      // Create a weak skill (many incorrect attempts)
      const weakSkillId = 'weak-skill'
      for (let i = 0; i < 5; i++) {
        const attempt: Attempt = {
          id: `weak-attempt-${i}`,
          itemId: `item-${i}`,
          skillId: weakSkillId,
          userId,
          answer: 'wrong',
          isCorrect: false,
          timestamp: new Date(),
          timeSpent: 5000
        }
        masteryEngine.processAttempt(attempt)
      }

      // Create a strong skill (many correct attempts)
      const strongSkillId = 'strong-skill'
      for (let i = 0; i < 10; i++) {
        const attempt: Attempt = {
          id: `strong-attempt-${i}`,
          itemId: `item-${i}`,
          skillId: strongSkillId,
          userId,
          answer: 'correct',
          isCorrect: true,
          timestamp: new Date(),
          timeSpent: 5000
        }
        masteryEngine.processAttempt(attempt)
      }

      const weakSkills = masteryEngine.getWeakSkills(userId, 2)
      expect(weakSkills).toHaveLength(2)
      expect(weakSkills[0].skillId).toBe(weakSkillId)
      expect(weakSkills[0].weaknessScore).toBeGreaterThan(weakSkills[1].weaknessScore)
    })
  })
})

describe('SpacedRepetitionEngine', () => {
  let spacedEngine: SpacedRepetitionEngine
  let store: Store

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    
    spacedEngine = SpacedRepetitionEngine.getInstance()
    spacedEngine.clearAllItems()
    store = Store.getInstance()
    store.clearAll()
  })

  describe('bucket system', () => {
    it('should assign correct intervals based on probability', () => {
      const skillId = 'test-skill-1'
      const userId = 'test-user'
      
      // Test different probability ranges
      const testCases = [
        { probability: 0.55, expectedInterval: 8 },   // 8h bucket
        { probability: 0.65, expectedInterval: 24 },  // 1d bucket
        { probability: 0.75, expectedInterval: 72 },  // 3d bucket
        { probability: 0.85, expectedInterval: 168 }, // 1w bucket
        { probability: 0.95, expectedInterval: 504 }  // 3w bucket
      ]

      testCases.forEach(({ probability, expectedInterval }, index) => {
        const testSkillId = `${skillId}-${index}`
        const masteryState: MasteryState = {
          skillId: testSkillId,
          userId,
          probability,
          attempts: 1,
          correctAttempts: 1,
          lastAttempt: new Date(),
          lastMasteryUpdate: new Date(),
          isMastered: false
        }

        const item = spacedEngine.scheduleRepetition(testSkillId, userId, masteryState, true)
        expect(item.interval).toBe(expectedInterval)
      })
    })

    it('should only apply to English and Biology subjects', () => {
      expect(spacedEngine.shouldUseSpacedRepetition('vocab-skill', 'engelska')).toBe(true)
      expect(spacedEngine.shouldUseSpacedRepetition('flashcard-skill', 'biologi')).toBe(true)
      expect(spacedEngine.shouldUseSpacedRepetition('math-skill', 'matematik')).toBe(false)
      expect(spacedEngine.shouldUseSpacedRepetition('physics-skill', 'fysik')).toBe(false)
    })
  })

  describe('interval adjustment', () => {
    it('should increase interval on correct answers', () => {
      const skillId = 'test-skill-1'
      const userId = 'test-user'
      
      const masteryState: MasteryState = {
        skillId,
        userId,
        probability: 0.6,
        attempts: 1,
        correctAttempts: 1,
        lastAttempt: new Date(),
        lastMasteryUpdate: new Date(),
        isMastered: false
      }

      const item1 = spacedEngine.scheduleRepetition(skillId, userId, masteryState, true)
      const item2 = spacedEngine.scheduleRepetition(skillId, userId, masteryState, true)
      
      expect(item2.interval).toBeGreaterThanOrEqual(item1.interval)
      expect(item2.repetitions).toBeGreaterThan(item1.repetitions)
    })

    it('should decrease interval on incorrect answers', () => {
      const skillId = 'test-skill-1'
      const userId = 'test-user'
      
      const masteryState: MasteryState = {
        skillId,
        userId,
        probability: 0.6,
        attempts: 1,
        correctAttempts: 1,
        lastAttempt: new Date(),
        lastMasteryUpdate: new Date(),
        isMastered: false
      }

      const item1 = spacedEngine.scheduleRepetition(skillId, userId, masteryState, true)
      const item2 = spacedEngine.scheduleRepetition(skillId, userId, masteryState, false)
      
      expect(item2.interval).toBeLessThan(item1.interval)
      expect(item2.repetitions).toBeLessThan(item1.repetitions)
    })
  })

  describe('due items detection', () => {
    it('should return items that are due for review', () => {
      const userId = 'test-user'
      
      // Create an item that's due now
      const dueItem: SpacedRepetitionItem = {
        id: 'due-item',
        skillId: 'test-skill-1',
        userId,
        interval: 24,
        repetitions: 1,
        easeFactor: 2.5,
        nextReview: new Date(Date.now() - 1000), // Due 1 second ago
        lastReview: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
      }
      
      store.setSpacedRepetitionItem(dueItem)
      
      // Create an item that's not due yet
      const notDueItem: SpacedRepetitionItem = {
        id: 'not-due-item',
        skillId: 'test-skill-2',
        userId,
        interval: 24,
        repetitions: 1,
        easeFactor: 2.5,
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
        lastReview: new Date()
      }
      
      store.setSpacedRepetitionItem(notDueItem)
      
      const dueItems = spacedEngine.getDueItems(userId)
      expect(dueItems).toHaveLength(1)
      expect(dueItems[0].id).toBe('due-item')
    })

    it('should return items due soon (within 24 hours)', () => {
      const userId = 'test-user'
      
      // Create an item due in 12 hours
      const dueSoonItem: SpacedRepetitionItem = {
        id: 'due-soon-item',
        skillId: 'test-skill-1',
        userId,
        interval: 24,
        repetitions: 1,
        easeFactor: 2.5,
        nextReview: new Date(Date.now() + 12 * 60 * 60 * 1000), // Due in 12 hours
        lastReview: new Date()
      }
      
      store.setSpacedRepetitionItem(dueSoonItem)
      
      // Create an item due in 48 hours
      const notDueSoonItem: SpacedRepetitionItem = {
        id: 'not-due-soon-item',
        skillId: 'test-skill-2',
        userId,
        interval: 24,
        repetitions: 1,
        easeFactor: 2.5,
        nextReview: new Date(Date.now() + 48 * 60 * 60 * 1000), // Due in 48 hours
        lastReview: new Date()
      }
      
      store.setSpacedRepetitionItem(notDueSoonItem)
      
      const dueSoonItems = spacedEngine.getItemsDueSoon(userId)
      expect(dueSoonItems).toHaveLength(1)
      expect(dueSoonItems[0].id).toBe('due-soon-item')
    })
  })

  describe('decay logic', () => {
    it('should apply decay to overdue items', () => {
      const userId = 'test-user'
      
      // Create an overdue item
      const overdueItem: SpacedRepetitionItem = {
        id: 'overdue-item',
        skillId: 'test-skill-1',
        userId,
        interval: 24,
        repetitions: 1,
        easeFactor: 2.5,
        nextReview: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days overdue
        lastReview: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
      
      store.setSpacedRepetitionItem(overdueItem)
      
      const originalEaseFactor = overdueItem.easeFactor
      spacedEngine.applyDecay(userId)
      
      // Check that decay was applied
      const updatedItem = store.getSpacedRepetitionItem('test-skill-1', userId)
      expect(updatedItem?.easeFactor).toBeLessThan(originalEaseFactor)
    })
  })

  describe('statistics', () => {
    it('should provide accurate statistics', () => {
      const userId = 'test-user'
      
      // Create multiple items
      const items = [
        {
          id: 'item-1',
          skillId: 'skill-1',
          userId,
          interval: 24,
          repetitions: 1,
          easeFactor: 2.5,
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
          lastReview: new Date()
        },
        {
          id: 'item-2',
          skillId: 'skill-2',
          userId,
          interval: 72,
          repetitions: 2,
          easeFactor: 2.8,
          nextReview: new Date(Date.now() + 72 * 60 * 60 * 1000),
          lastReview: new Date()
        }
      ]
      
      items.forEach(item => store.setSpacedRepetitionItem(item))
      
      const stats = spacedEngine.getStats(userId)
      
      expect(stats.totalItems).toBe(2)
      expect(stats.averageInterval).toBeCloseTo(48, 0) // (24 + 72) / 2
      expect(stats.averageEaseFactor).toBeCloseTo(2.65, 1) // (2.5 + 2.8) / 2
      expect(stats.bucketDistribution['1 dag']).toBe(1)
      expect(stats.bucketDistribution['3 dagar']).toBe(1)
    })
  })
})

describe('Store integration', () => {
  let store: Store

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    store = Store.getInstance()
    store.clearAll()
  })

  it('should persist mastery states correctly', () => {
    const masteryState: MasteryState = {
      skillId: 'test-skill',
      userId: 'test-user',
      probability: 0.7,
      attempts: 5,
      correctAttempts: 4,
      lastAttempt: new Date(),
      lastMasteryUpdate: new Date(),
      isMastered: false
    }

    const success = store.setMasteryState(masteryState)
    expect(success).toBe(true)

    const retrieved = store.getMasteryState('test-skill', 'test-user')
    expect(retrieved).toEqual(masteryState)
  })

  it('should persist spaced repetition items correctly', () => {
    const spacedItem: SpacedRepetitionItem = {
      id: 'test-user-test-skill',
      skillId: 'test-skill',
      userId: 'test-user',
      interval: 24,
      repetitions: 1,
      easeFactor: 2.5,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastReview: new Date()
    }

    const success = store.setSpacedRepetitionItem(spacedItem)
    expect(success).toBe(true)

    const retrieved = store.getSpacedRepetitionItem('test-skill', 'test-user')
    expect(retrieved).toEqual(spacedItem)
  })

  it('should handle analytics events correctly', () => {
    const event = {
      type: 'start_practice' as const,
      userId: 'test-user',
      timestamp: new Date(),
      data: { skillId: 'test-skill' }
    }

    const success = store.addAnalyticsEvent(event)
    expect(success).toBe(true)

    const retrieved = store.getUserAnalyticsEvents('test-user')
    expect(retrieved).toHaveLength(1)
    expect(retrieved[0]).toEqual(event)
  })
})
