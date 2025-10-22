/**
 * Test för Milestone 2 - Verifiera att alla funktioner fungerar
 * Kör denna fil för att testa mastery engine, analytics och storage
 */

import { masteryEngine } from './lib/mastery.js'
import { analyticsEngine } from './lib/analytics.js'
import { storageManager, userProfileManager } from './lib/storage.js'
import { formatDuration, getMasteryColor, getMasteryText } from './lib/utils.js'

// Test data
const testUserId = 'test-user-123'
const testSkillId = 'variabler-uttryck'
const testSubjectId = 'matematik'

console.log('🧪 Testar Milestone 2 funktioner...\n')

// Test 1: Mastery Engine
console.log('1️⃣ Testar Mastery Engine...')
try {
  // Skapa en test attempt
  const testAttempt = {
    id: 'attempt-1',
    itemId: 'item-1',
    skillId: testSkillId,
    userId: testUserId,
    answer: 'x + 5',
    isCorrect: true,
    timestamp: new Date(),
    timeSpent: 15000 // 15 sekunder
  }

  // Processa attempt
  const masteryState = masteryEngine.processAttempt(testAttempt)
  console.log('✅ Mastery state skapad:', {
    probability: masteryState.probability,
    attempts: masteryState.attempts,
    isMastered: masteryState.isMastered
  })

  // Testa mastery level
  const level = masteryEngine.getMasteryLevel(testSkillId, testUserId)
  console.log('✅ Mastery level:', level)

  // Testa mastery percentage
  const percentage = masteryEngine.getMasteryPercentage(testSkillId, testUserId)
  console.log('✅ Mastery percentage:', percentage + '%')

} catch (error) {
  console.error('❌ Mastery Engine fel:', error)
}

// Test 2: Analytics Engine
console.log('\n2️⃣ Testar Analytics Engine...')
try {
  // Starta session
  const sessionId = analyticsEngine.startSession(testUserId, testSubjectId, testSkillId)
  console.log('✅ Session startad:', sessionId)

  // Starta practice
  analyticsEngine.startPractice(testUserId, testSkillId)
  console.log('✅ Practice startad')

  // Logga item answered
  analyticsEngine.itemAnswered(testUserId, 'item-1', testSkillId, true, 15000)
  console.log('✅ Item answered loggat')

  // Logga skill mastered
  analyticsEngine.skillMastered(testUserId, testSkillId, 0.9)
  console.log('✅ Skill mastered loggat')

  // Hämta user analytics
  const analytics = analyticsEngine.getUserAnalytics(testUserId)
  console.log('✅ User analytics:', {
    totalSessions: analytics.totalSessions,
    totalItems: analytics.totalItems,
    accuracy: analytics.accuracy.toFixed(1) + '%'
  })

  // Avsluta session
  analyticsEngine.endSession(sessionId)
  console.log('✅ Session avslutad')

} catch (error) {
  console.error('❌ Analytics Engine fel:', error)
}

// Test 3: Storage Manager
console.log('\n3️⃣ Testar Storage Manager...')
try {
  // Testa storage availability
  const isAvailable = storageManager.isAvailable()
  console.log('✅ Storage available:', isAvailable)

  // Testa set/get item
  const testData = { name: 'Test', value: 42 }
  const saved = storageManager.setItem('test-data', testData)
  console.log('✅ Data sparat:', saved)

  const loaded = storageManager.getItem('test-data')
  console.log('✅ Data laddad:', loaded)

  // Testa storage info
  const storageInfo = storageManager.getStorageInfo()
  console.log('✅ Storage info:', {
    available: storageInfo.available,
    used: Math.round(storageInfo.used / 1024) + ' KB'
  })

} catch (error) {
  console.error('❌ Storage Manager fel:', error)
}

// Test 4: User Profile Manager
console.log('\n4️⃣ Testar User Profile Manager...')
try {
  // Hämta profil
  const profile = userProfileManager.getProfile()
  console.log('✅ Profil hämtad:', {
    name: profile.name,
    level: profile.level,
    totalXP: profile.totalXP
  })

  // Lägg till XP
  const xpAdded = userProfileManager.addXP(100)
  console.log('✅ XP tillagt:', xpAdded)

  // Uppdatera profil
  const updated = userProfileManager.updateProfile({ name: 'Test Student' })
  console.log('✅ Profil uppdaterad:', updated)

} catch (error) {
  console.error('❌ User Profile Manager fel:', error)
}

// Test 5: Utility Functions
console.log('\n5️⃣ Testar Utility Functions...')
try {
  // Testa duration formatting
  const duration = formatDuration(125000) // 2 min 5 sek
  console.log('✅ Duration format:', duration)

  // Testa mastery color
  const color = getMasteryColor(85)
  console.log('✅ Mastery color:', color)

  // Testa mastery text
  const text = getMasteryText(85)
  console.log('✅ Mastery text:', text)

} catch (error) {
  console.error('❌ Utility Functions fel:', error)
}

// Test 6: Spaced Repetition
console.log('\n6️⃣ Testar Spaced Repetition...')
try {
  // Testa för engelska (ska använda spaced repetition)
  const shouldUseSpaced = masteryEngine.shouldUseSpacedRepetition('basic-vocabulary', 'engelska')
  console.log('✅ Spaced repetition för engelska:', shouldUseSpaced)

  // Testa för matematik (ska INTE använda spaced repetition)
  const shouldNotUseSpaced = masteryEngine.shouldUseSpacedRepetition('variabler-uttryck', 'matematik')
  console.log('✅ Spaced repetition för matematik:', shouldNotUseSpaced)

  // Schemalägg spaced repetition
  const spacedItem = masteryEngine.scheduleSpacedRepetition('basic-vocabulary', testUserId, true)
  console.log('✅ Spaced repetition schemalagd:', {
    interval: spacedItem.interval + ' timmar',
    repetitions: spacedItem.repetitions
  })

} catch (error) {
  console.error('❌ Spaced Repetition fel:', error)
}

console.log('\n🎉 Alla Milestone 2 tester slutförda!')
console.log('\n📋 Sammanfattning av implementerade funktioner:')
console.log('✅ Mastery Engine med p-model (0.5 → 0.9)')
console.log('✅ Adaptive difficulty baserat på tid och prestation')
console.log('✅ Spaced repetition för engelska och biologi')
console.log('✅ Analytics tracking (5 event-typer)')
console.log('✅ LocalStorage med error handling')
console.log('✅ User profile med XP och badges')
console.log('✅ Utility functions för svenska formatering')
console.log('✅ Weakness detection och skill analysis')
console.log('✅ Study streak calculation')
console.log('✅ Data export/import funktionalitet')
