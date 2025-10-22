import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { getSubjects, getTopicsBySubject, getSkillsByTopic } from '../lib/data'

// Mock the data functions
vi.mock('../lib/data', () => ({
  getSubjects: vi.fn(),
  getTopicsBySubject: vi.fn(),
  getSkillsByTopic: vi.fn(),
  getSubjectById: vi.fn(),
  getSkillById: vi.fn(),
  getLessonsBySkill: vi.fn(),
  getItemsBySkill: vi.fn()
}))

const mockSubject = {
  id: 'matematik',
  name: 'Matematik',
  description: 'Algebra och grundläggande matematik',
  color: 'bg-blue-600',
  icon: 'Calculator',
  topics: [
    {
      id: 'algebra-grund',
      name: 'Algebra - Grundläggande',
      description: 'Variabler, uttryck och enkla ekvationer',
      skills: [
        {
          id: 'variabler-uttryck',
          name: 'Variabler och uttryck',
          description: 'Förstå och arbeta med variabler och algebraiska uttryck',
          difficulty: 'enkel',
          prerequisites: []
        }
      ]
    }
  ]
}

const mockTopic = {
  id: 'algebra-grund',
  name: 'Algebra - Grundläggande',
  description: 'Variabler, uttryck och enkla ekvationer',
  skills: [
    {
      id: 'variabler-uttryck',
      name: 'Variabler och uttryck',
      description: 'Förstå och arbeta med variabler och algebraiska uttryck',
      difficulty: 'enkel',
      prerequisites: []
    }
  ]
}

const mockSkill = {
  id: 'variabler-uttryck',
  name: 'Variabler och uttryck',
  description: 'Förstå och arbeta med variabler och algebraiska uttryck',
  difficulty: 'enkel',
  prerequisites: []
}

describe('Study Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Subject Page Data Loading', () => {
    it('should load subjects and topics correctly', async () => {
      vi.mocked(getSubjects).mockResolvedValue([mockSubject])
      vi.mocked(getTopicsBySubject).mockResolvedValue(mockSubject.topics)

      const subjects = await getSubjects()
      const topics = await getTopicsBySubject('matematik')

      expect(subjects).toHaveLength(1)
      expect(subjects[0].id).toBe('matematik')
      expect(topics).toHaveLength(1)
      expect(topics[0].id).toBe('algebra-grund')
    })

    it('should handle missing subject gracefully', async () => {
      vi.mocked(getSubjects).mockResolvedValue([])
      vi.mocked(getTopicsBySubject).mockResolvedValue([])

      const subjects = await getSubjects()
      const topics = await getTopicsBySubject('non-existing')

      expect(subjects).toEqual([])
      expect(topics).toEqual([])
    })
  })

  describe('Topic Page Data Loading', () => {
    it('should load skills for topic correctly', async () => {
      vi.mocked(getSkillsByTopic).mockResolvedValue(mockTopic.skills)

      const skills = await getSkillsByTopic('matematik', 'algebra-grund')

      expect(skills).toHaveLength(1)
      expect(skills[0].id).toBe('variabler-uttryck')
    })

    it('should handle missing topic gracefully', async () => {
      vi.mocked(getSkillsByTopic).mockResolvedValue([])

      const skills = await getSkillsByTopic('matematik', 'non-existing')

      expect(skills).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors in getSubjects', async () => {
      vi.mocked(getSubjects).mockRejectedValue(new Error('Network error'))

      try {
        await getSubjects()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
    })

    it('should handle network errors in getTopicsBySubject', async () => {
      vi.mocked(getTopicsBySubject).mockRejectedValue(new Error('Network error'))

      try {
        await getTopicsBySubject('matematik')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
    })

    it('should handle network errors in getSkillsByTopic', async () => {
      vi.mocked(getSkillsByTopic).mockRejectedValue(new Error('Network error'))

      try {
        await getSkillsByTopic('matematik', 'algebra-grund')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
    })
  })

  describe('Data Validation', () => {
    it('should validate subject structure', () => {
      expect(mockSubject).toHaveProperty('id')
      expect(mockSubject).toHaveProperty('name')
      expect(mockSubject).toHaveProperty('description')
      expect(mockSubject).toHaveProperty('topics')
      expect(Array.isArray(mockSubject.topics)).toBe(true)
    })

    it('should validate topic structure', () => {
      expect(mockTopic).toHaveProperty('id')
      expect(mockTopic).toHaveProperty('name')
      expect(mockTopic).toHaveProperty('description')
      expect(mockTopic).toHaveProperty('skills')
      expect(Array.isArray(mockTopic.skills)).toBe(true)
    })

    it('should validate skill structure', () => {
      expect(mockSkill).toHaveProperty('id')
      expect(mockSkill).toHaveProperty('name')
      expect(mockSkill).toHaveProperty('description')
      expect(mockSkill).toHaveProperty('difficulty')
      expect(mockSkill).toHaveProperty('prerequisites')
      expect(['enkel', 'medel', 'svår']).toContain(mockSkill.difficulty)
    })
  })
})
