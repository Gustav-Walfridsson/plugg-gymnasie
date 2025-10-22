/**
 * Test data generator for development and testing
 * Creates sample spaced repetition items for English and Biology
 */

import { spacedRepetitionEngine } from './spaced'
import { masteryEngine } from './mastery'
import { store } from './store'
import type { SpacedRepetitionItem, MasteryState } from '../types/domain'

export function createSampleReviewData() {
  const userId = store.getProfile().id
  
  // English vocabulary skills
  const englishSkills = [
    'basic-vocabulary',
    'sentence-structure', 
    'paragraph-writing',
    'essay-writing',
    'advanced-vocabulary'
  ]
  
  // Biology skills
  const biologySkills = [
    'cellstruktur',
    'dna-struktur',
    'genetisk-kod',
    'arvslagar',
    'mutationer'
  ]
  
  // Create mastery states and spaced repetition items
  const allSkills = [...englishSkills, ...biologySkills]
  
  allSkills.forEach((skillId, index) => {
    // Create mastery state
    const masteryState: MasteryState = {
      skillId,
      userId,
      probability: 0.5 + (index * 0.1), // Varying probabilities
      attempts: Math.floor(Math.random() * 10) + 1,
      correctAttempts: Math.floor(Math.random() * 8) + 1,
      lastAttempt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
      lastMasteryUpdate: new Date(),
      isMastered: false
    }
    
    // Set mastery state
    store.setMasteryState(masteryState)
    
    // Create spaced repetition item
    const spacedItem: SpacedRepetitionItem = {
      id: `${userId}-${skillId}`,
      skillId,
      userId,
      interval: 8 + (index * 4), // Varying intervals
      repetitions: Math.floor(Math.random() * 5),
      easeFactor: 2.5,
      nextReview: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Some due now
      lastReview: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
    }
    
    // Set spaced repetition item
    store.setSpacedRepetitionItem(spacedItem)
  })
  
  console.log('Sample review data created!')
}

export function clearAllData() {
  store.clearAll()
  console.log('All data cleared!')
}

export function getReviewStats() {
  const userId = store.getProfile().id
  const stats = spacedRepetitionEngine.getStats(userId)
  
  console.log('Review Stats:', stats)
  return stats
}
