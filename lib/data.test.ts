import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  getSubjects, 
  getTopicsBySubject, 
  getSkillsByTopic, 
  getSkillById, 
  getSubjectById 
} from './data'

// Mock fetch
global.fetch = vi.fn()

const mockSkillsData = {
  subjects: [
    {
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
            },
            {
              id: 'enkla-ekvationer',
              name: 'Enkla ekvationer',
              description: 'Lösa enkla ekvationer med en variabel',
              difficulty: 'enkel',
              prerequisites: ['variabler-uttryck']
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
      topics: []
    }
  ]
}

describe('Data Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSubjects', () => {
    it('should return all subjects when fetch succeeds', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const subjects = await getSubjects()
      
      expect(subjects).toHaveLength(2)
      expect(subjects[0].id).toBe('matematik')
      expect(subjects[1].id).toBe('fysik')
    })

    it('should return empty array when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      } as Response)

      const subjects = await getSubjects()
      
      expect(subjects).toEqual([])
    })

    it('should return empty array when fetch throws', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const subjects = await getSubjects()
      
      expect(subjects).toEqual([])
    })
  })

  describe('getTopicsBySubject', () => {
    it('should return topics for existing subject', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const topics = await getTopicsBySubject('matematik')
      
      expect(topics).toHaveLength(1)
      expect(topics[0].id).toBe('algebra-grund')
    })

    it('should return empty array for non-existing subject', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const topics = await getTopicsBySubject('non-existing')
      
      expect(topics).toEqual([])
    })
  })

  describe('getSkillsByTopic', () => {
    it('should return skills for existing topic', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const skills = await getSkillsByTopic('matematik', 'algebra-grund')
      
      expect(skills).toHaveLength(2)
      expect(skills[0].id).toBe('variabler-uttryck')
      expect(skills[1].id).toBe('enkla-ekvationer')
    })

    it('should return empty array for non-existing topic', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const skills = await getSkillsByTopic('matematik', 'non-existing')
      
      expect(skills).toEqual([])
    })
  })

  describe('getSkillById', () => {
    it('should return skill for existing skill ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const skill = await getSkillById('matematik', 'algebra-grund', 'variabler-uttryck')
      
      expect(skill).toBeTruthy()
      expect(skill?.id).toBe('variabler-uttryck')
      expect(skill?.name).toBe('Variabler och uttryck')
    })

    it('should return null for non-existing skill ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const skill = await getSkillById('matematik', 'algebra-grund', 'non-existing')
      
      expect(skill).toBeNull()
    })
  })

  describe('getSubjectById', () => {
    it('should return subject for existing subject ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const subject = await getSubjectById('matematik')
      
      expect(subject).toBeTruthy()
      expect(subject?.id).toBe('matematik')
      expect(subject?.name).toBe('Matematik')
    })

    it('should return null for non-existing subject ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSkillsData)
      } as Response)

      const subject = await getSubjectById('non-existing')
      
      expect(subject).toBeNull()
    })
  })
})
