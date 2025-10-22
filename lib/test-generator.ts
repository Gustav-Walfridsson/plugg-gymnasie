/**
 * Test generator for creating randomized practice tests
 * Generates representative items from fixtures for Mathematics, Swedish, and English
 */

import type { QuizItem, PracticeTest, SubjectId } from '../types/domain'
import testFixtures from '../data/test-fixtures.json'

export interface TestGeneratorOptions {
  itemCount?: number
  difficultyDistribution?: {
    enkel: number
    medel: number
    svår: number
  }
  includeSkills?: string[]
}

export class TestGenerator {
  private fixtures = testFixtures

  /**
   * Generate a randomized test for a specific subject
   */
  generateTest(
    subjectId: SubjectId, 
    options: TestGeneratorOptions = {}
  ): PracticeTest {
    const {
      itemCount = 10,
      difficultyDistribution = { enkel: 0.4, medel: 0.4, svår: 0.2 },
      includeSkills = []
    } = options

    const subjectItems: QuizItem[] = (this.fixtures as any)[subjectId]?.items || []
    
    if (subjectItems.length === 0) {
      throw new Error(`No test items found for subject: ${subjectId}`)
    }

    // Filter by skills if specified
    let availableItems = subjectItems
    if (includeSkills.length > 0) {
      availableItems = subjectItems.filter((item: QuizItem) => 
        includeSkills.includes(item.skillId)
      )
    }

    // Calculate how many items of each difficulty to include
    const difficultyCounts = this.calculateDifficultyCounts(
      availableItems, 
      itemCount, 
      difficultyDistribution
    )

    // Select items based on difficulty distribution
    const selectedItems = this.selectItemsByDifficulty(
      availableItems, 
      difficultyCounts
    )

    // Shuffle the selected items
    const shuffledItems = this.shuffleArray(selectedItems)

    return {
      id: `test-${subjectId}-${Date.now()}`,
      subjectId,
      title: this.getTestTitle(subjectId),
      description: this.getTestDescription(subjectId),
      items: shuffledItems,
      passingScore: 70 // 70% passing score
    }
  }

  /**
   * Calculate how many items of each difficulty level to include
   */
  private calculateDifficultyCounts(
    items: QuizItem[], 
    totalCount: number, 
    distribution: { enkel: number; medel: number; svår: number }
  ): { enkel: number; medel: number; svår: number } {
    const difficultyGroups = {
      enkel: items.filter((item: QuizItem) => item.difficulty === 'enkel'),
      medel: items.filter((item: QuizItem) => item.difficulty === 'medel'),
      svår: items.filter((item: QuizItem) => item.difficulty === 'svår')
    }

    const counts = {
      enkel: Math.min(
        Math.floor(totalCount * distribution.enkel),
        difficultyGroups.enkel.length
      ),
      medel: Math.min(
        Math.floor(totalCount * distribution.medel),
        difficultyGroups.medel.length
      ),
      svår: Math.min(
        Math.floor(totalCount * distribution.svår),
        difficultyGroups.svår.length
      )
    }

    // Adjust if total doesn't match requested count
    const currentTotal = counts.enkel + counts.medel + counts.svår
    if (currentTotal < totalCount) {
      const remaining = totalCount - currentTotal
      // Add remaining items to the most available difficulty
      const mostAvailable = Object.entries(difficultyGroups)
        .sort(([,a], [,b]) => b.length - a.length)[0][0] as keyof typeof counts
      
      counts[mostAvailable] += Math.min(remaining, difficultyGroups[mostAvailable].length - counts[mostAvailable])
    }

    return counts
  }

  /**
   * Select items based on difficulty distribution
   */
  private selectItemsByDifficulty(
    items: QuizItem[], 
    counts: { enkel: number; medel: number; svår: number }
  ): QuizItem[] {
    const difficultyGroups = {
      enkel: items.filter((item: QuizItem) => item.difficulty === 'enkel'),
      medel: items.filter((item: QuizItem) => item.difficulty === 'medel'),
      svår: items.filter((item: QuizItem) => item.difficulty === 'svår')
    }

    const selectedItems: QuizItem[] = []

    // Select items from each difficulty group
    Object.entries(counts).forEach(([difficulty, count]) => {
      const group = difficultyGroups[difficulty as keyof typeof difficultyGroups]
      const shuffled = this.shuffleArray([...group])
      selectedItems.push(...shuffled.slice(0, count))
    })

    return selectedItems
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Get test title for subject
   */
  private getTestTitle(subjectId: SubjectId): string {
    const titles = {
      matematik: 'Matematik Träningsprov',
      svenska: 'Svenska Träningsprov', 
      engelska: 'English Practice Test',
      fysik: 'Fysik Träningsprov',
      kemi: 'Kemi Träningsprov',
      biologi: 'Biologi Träningsprov'
    }
    return titles[subjectId] || `${subjectId} Test`
  }

  /**
   * Get test description for subject
   */
  private getTestDescription(subjectId: SubjectId): string {
    const descriptions = {
      matematik: 'Testa dina matematiska färdigheter med representativa uppgifter',
      svenska: 'Utvärdera dina svenska språkfärdigheter och skrivförmåga',
      engelska: 'Practice your English skills with comprehensive test questions',
      fysik: 'Testa dina fysikaliska kunskaper och problemlösningsförmåga',
      kemi: 'Utvärdera dina kemiska kunskaper och förståelse',
      biologi: 'Testa dina biologiska kunskaper och vetenskapliga förståelse'
    }
    return descriptions[subjectId] || `Practice test for ${subjectId}`
  }

  /**
   * Get available skills for a subject
   */
  getAvailableSkills(subjectId: SubjectId): string[] {
    const items: QuizItem[] = (this.fixtures as any)[subjectId]?.items || []
    const skills = new Set(items.map((item: QuizItem) => item.skillId))
    return Array.from(skills)
  }

  /**
   * Get difficulty distribution for a subject
   */
  getDifficultyDistribution(subjectId: SubjectId): { enkel: number; medel: number; svår: number } {
    const items: QuizItem[] = (this.fixtures as any)[subjectId]?.items || []
    const total = items.length
    
    if (total === 0) return { enkel: 0, medel: 0, svår: 0 }

    return {
      enkel: items.filter((item: QuizItem) => item.difficulty === 'enkel').length / total,
      medel: items.filter((item: QuizItem) => item.difficulty === 'medel').length / total,
      svår: items.filter((item: QuizItem) => item.difficulty === 'svår').length / total
    }
  }
}

// Export singleton instance
export const testGenerator = new TestGenerator()

// Export utility functions
export function generateQuickTest(subjectId: SubjectId): PracticeTest {
  return testGenerator.generateTest(subjectId, { itemCount: 5 })
}

export function generateFullTest(subjectId: SubjectId): PracticeTest {
  return testGenerator.generateTest(subjectId, { itemCount: 15 })
}

export function generateCustomTest(
  subjectId: SubjectId, 
  options: TestGeneratorOptions
): PracticeTest {
  return testGenerator.generateTest(subjectId, options)
}
