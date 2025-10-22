/**
 * Simple Data Service - No complex async operations
 * Provides static data to prevent infinite loading states
 */

import type { Subject, WeaknessAnalysis, StudyPlan } from '../types/domain'

// Static subjects data - no async loading
export const STATIC_SUBJECTS: Subject[] = [
  {
    id: 'matematik',
    name: 'Matematik',
    description: 'Algebra och grundläggande matematik',
    color: 'bg-blue-600',
    icon: 'Calculator',
    topics: [
      {
        id: 'algebra-grund',
        name: 'Algebra Grund',
        description: 'Grundläggande algebra',
        skills: [
          {
            id: 'variabler-uttryck',
            name: 'Variabler och uttryck',
            description: 'Arbeta med variabler och algebraiska uttryck',
            difficulty: 'enkel'
          },
          {
            id: 'enkla-ekvationer',
            name: 'Enkla ekvationer',
            description: 'Lösa enkla ekvationer',
            difficulty: 'enkel'
          },
          {
            id: 'parenteser',
            name: 'Parenteser',
            description: 'Arbeta med parenteser i algebra',
            difficulty: 'medel'
          }
        ]
      }
    ]
  },
  {
    id: 'fysik',
    name: 'Fysik',
    description: 'Mekanik och grundläggande fysik',
    color: 'bg-purple-600',
    icon: 'Atom',
    topics: [
      {
        id: 'mekanik-grund',
        name: 'Mekanik Grund',
        description: 'Grundläggande mekanik',
        skills: [
          {
            id: 'krafter',
            name: 'Krafter',
            description: 'Förstå olika typer av krafter',
            difficulty: 'enkel'
          },
          {
            id: 'rorelse',
            name: 'Rörelse',
            description: 'Grundläggande rörelse',
            difficulty: 'medel'
          }
        ]
      }
    ]
  },
  {
    id: 'svenska',
    name: 'Svenska',
    description: 'Skrivande och grammatisk feedback',
    color: 'bg-green-600',
    icon: 'BookOpen',
    topics: [
      {
        id: 'skrivande',
        name: 'Skrivande',
        description: 'Grundläggande skrivande',
        skills: [
          {
            id: 'grammatik',
            name: 'Grammatik',
            description: 'Svensk grammatik',
            difficulty: 'medel'
          }
        ]
      }
    ]
  },
  {
    id: 'engelska',
    name: 'Engelska',
    description: 'Writing och vocabulary feedback',
    color: 'bg-red-600',
    icon: 'Globe',
    topics: [
      {
        id: 'vocabulary',
        name: 'Vocabulary',
        description: 'Engelska ord',
        skills: [
          {
            id: 'basic-words',
            name: 'Basic Words',
            description: 'Grundläggande engelska ord',
            difficulty: 'enkel'
          }
        ]
      }
    ]
  },
  {
    id: 'kemi',
    name: 'Kemi',
    description: 'Binding och bonding',
    color: 'bg-orange-600',
    icon: 'Beaker',
    topics: [
      {
        id: 'binding',
        name: 'Binding',
        description: 'Kemisk binding',
        skills: [
          {
            id: 'kovalenta-bindningar',
            name: 'Kovalenta bindningar',
            description: 'Förstå kovalenta bindningar',
            difficulty: 'medel'
          }
        ]
      }
    ]
  },
  {
    id: 'biologi',
    name: 'Biologi',
    description: 'Genetik och grundläggande biologi',
    color: 'bg-teal-600',
    icon: 'Dna',
    topics: [
      {
        id: 'genetik',
        name: 'Genetik',
        description: 'Grundläggande genetik',
        skills: [
          {
            id: 'dna-struktur',
            name: 'DNA struktur',
            description: 'Förstå DNA struktur',
            difficulty: 'medel'
          }
        ]
      }
    ]
  }
]

// Simple data functions - no async operations
export function getSubjectsSync(): Subject[] {
  return STATIC_SUBJECTS
}

export function getSubjectByIdSync(subjectId: string): Subject | null {
  return STATIC_SUBJECTS.find(s => s.id === subjectId) || null
}

export function getTopicsBySubjectSync(subjectId: string) {
  const subject = getSubjectByIdSync(subjectId)
  return subject?.topics || []
}

export function getSkillsByTopicSync(subjectId: string, topicId: string) {
  const topics = getTopicsBySubjectSync(subjectId)
  const topic = topics.find(t => t.id === topicId)
  return topic?.skills || []
}

export function getSkillByIdSync(subjectId: string, topicId: string, skillId: string) {
  const skills = getSkillsByTopicSync(subjectId, topicId)
  return skills.find(s => s.id === skillId) || null
}

// Mock data for other functions
export function getWeakSkillsSync(userId: string, limit: number = 3): Array<{skillId: string, weaknessScore: number}> {
  // Return some mock weak skills
  return [
    { skillId: 'variabler-uttryck', weaknessScore: 0.8 },
    { skillId: 'enkla-ekvationer', weaknessScore: 0.6 },
    { skillId: 'parenteser', weaknessScore: 0.4 }
  ].slice(0, limit)
}

export function getMasteryStateSync(skillId: string, userId: string) {
  // Return mock mastery state
  return {
    skillId,
    userId,
    probability: 0.3,
    attempts: 5,
    correctAttempts: 2,
    lastAttempt: new Date(),
    lastMasteryUpdate: new Date(),
    isMastered: false
  }
}

export function getMasteryPercentageSync(skillId: string, userId: string): number {
  const state = getMasteryStateSync(skillId, userId)
  return Math.round(state.probability * 100)
}

export function getDueItemsSync(userId: string) {
  // Return empty array for now
  return []
}

export function getAllFlashcardsSync() {
  // Return empty array for now
  return []
}

export function areFixturesLoadedSync(): boolean {
  return true
}

export function getFixturesStatsSync() {
  return {
    totalItems: 0,
    totalLessons: 0,
    totalFlashcards: 0,
    subjects: {}
  }
}

export function getItemsBySkillSync(skillId: string) {
  // Return empty array for now
  return []
}

export function getLessonsBySkillSync(skillId: string) {
  // Return empty array for now
  return []
}
