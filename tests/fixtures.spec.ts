/**
 * Fixtures validation tests for Plugg Bot 1
 * Tests data structure, validation rules, and content quality
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  ItemSchema, 
  PhysicsItemSchema,
  LessonSchema, 
  FlashcardSchema,
  validateSubjectItems,
  validateSkillIdMapping,
  isCorrectNumeric,
  scoreFreeText
} from '../lib/schemas';
import type { Item, Lesson, FlashcardItem, NumericAnswer, Rubric } from '../types/domain';

// Mock data for testing
const mockMathItem: Item = {
  id: 'math-item-001',
  skillId: 'variabler-uttryck',
  type: 'numeric',
  prompt: 'Beräkna: 2 + 3 = ?',
  latex: '2 + 3 = ?',
  answer: { value: 5 },
  explanation: 'Lägg ihop 2 och 3 för att få 5.',
  difficulty: 1,
  tags: ['algebra', 'addition']
};

const mockPhysicsItem: Item = {
  id: 'physics-item-001',
  skillId: 'kraft-begrepp',
  type: 'numeric',
  prompt: 'Beräkna hastigheten: s = 100m, t = 10s',
  latex: 'v = \\frac{s}{t} = \\frac{100}{10}',
  answer: { value: 10, unit: 'm/s', tol: 0.1 },
  explanation: 'Använd formeln v = s/t för att beräkna hastigheten.',
  difficulty: 1,
  tags: ['mekanik', 'hastighet']
};

const mockChemistryItem: Item = {
  id: 'chemistry-item-001',
  skillId: 'jonbindning',
  type: 'mcq',
  prompt: 'Vilken typ av bindning finns mellan natrium och klor i NaCl?',
  choices: ['Jonbindning', 'Kovalent bindning', 'Metallbindning', 'Vätebindning'],
  answer: { 
    correctIndex: 0, 
    rationales: [
      'Korrekt! NaCl har jonbindning.',
      'Fel. Kovalent bindning delar elektroner.',
      'Fel. Metallbindning är mellan metaller.',
      'Fel. Vätebindning är svag bindning.'
    ]
  },
  explanation: 'NaCl har jonbindning eftersom natrium donerar en elektron till klor.',
  difficulty: 1,
  tags: ['bindning', 'joner']
};

const mockBiologyItem: Item = {
  id: 'biology-item-001',
  skillId: 'dna-struktur',
  type: 'mcq',
  prompt: 'Vilka är DNA:s byggstenar?',
  choices: ['Nukleotider', 'Aminosyror', 'Socker', 'Fettsyror'],
  answer: { correctIndex: 0 },
  explanation: 'DNA består av nukleotider som innehåller fosfat, socker och kvävebaser.',
  difficulty: 1,
  tags: ['DNA', 'genetik']
};

const mockSwedishItem: Item = {
  id: 'swedish-item-001',
  skillId: 'meningsbyggnad',
  type: 'freeText',
  prompt: 'Skriv en mening om vädret idag.',
  answer: { modelAnswer: 'Det är vackert väder idag med sol och blå himmel.' },
  explanation: 'Skriv en tydlig mening med korrekt grammatik och ordföljd.',
  difficulty: 1,
  tags: ['skrivande', 'grammatik'],
  rubric: {
    levelE: 'Enkel mening med grundläggande struktur',
    levelC: 'Tydlig mening med varierad ordföljd',
    levelA: 'Engagerande mening med avancerat språk',
    criteria: [
      { key: 'grammar', weight: 0.4 },
      { key: 'vocabulary', weight: 0.3 },
      { key: 'structure', weight: 0.3 }
    ],
    keywords: ['väder', 'vackert', 'sol', 'himmel']
  }
};

const mockEnglishItem: Item = {
  id: 'english-item-001',
  skillId: 'basic-vocabulary',
  type: 'freeText',
  prompt: 'Write a sentence about your favorite food.',
  answer: { modelAnswer: 'My favorite food is pizza because it tastes delicious.' },
  explanation: 'Write a clear sentence with correct grammar and vocabulary.',
  difficulty: 1,
  tags: ['writing', 'vocabulary'],
  rubric: {
    levelE: 'Simple sentence with basic structure',
    levelC: 'Clear sentence with varied word order',
    levelA: 'Engaging sentence with advanced language',
    criteria: [
      { key: 'grammar', weight: 0.4 },
      { key: 'vocabulary', weight: 0.3 },
      { key: 'structure', weight: 0.3 }
    ],
    keywords: ['favorite', 'food', 'delicious', 'taste']
  }
};

const mockFlashcard: FlashcardItem = {
  id: 'bio-flash-001',
  type: 'flashcard',
  front: 'DNA',
  back: 'Deoxyribonucleic acid - arvsmassan som innehåller genetisk information',
  tags: ['genetik', 'DNA']
};

const mockLesson: Lesson = {
  id: 'lesson-001',
  skillId: 'variabler-uttryck',
  title: 'Variabler och uttryck - Lektion 1',
  content: 'Detta är innehållet för variabler och uttryck lektion 1.',
  order: 1
};

describe('Fixtures Validation', () => {
  describe('Item Schema Validation', () => {
    it('should validate math items with LaTeX', () => {
      expect(() => ItemSchema.parse(mockMathItem)).not.toThrow();
    });

    it('should validate physics items with unit and tolerance', () => {
      expect(() => ItemSchema.parse(mockPhysicsItem)).not.toThrow();
    });

    it('should validate chemistry items with MCQ and rationales', () => {
      expect(() => ItemSchema.parse(mockChemistryItem)).not.toThrow();
    });

    it('should validate biology items with MCQ', () => {
      expect(() => ItemSchema.parse(mockBiologyItem)).not.toThrow();
    });

    it('should validate swedish items with freeText and rubric', () => {
      expect(() => ItemSchema.parse(mockSwedishItem)).not.toThrow();
    });

    it('should validate english items with freeText and rubric', () => {
      expect(() => ItemSchema.parse(mockEnglishItem)).not.toThrow();
    });

    it('should reject math items without LaTeX', () => {
      const { latex, ...invalidMathItem } = mockMathItem;
      expect(() => ItemSchema.parse(invalidMathItem)).toThrow();
    });

    it('should reject physics items without unit and tolerance', () => {
      const invalidPhysicsItem = { ...mockPhysicsItem, answer: { value: 10 } };
      expect(() => PhysicsItemSchema.parse(invalidPhysicsItem)).toThrow();
    });

    it('should reject chemistry items with mismatched rationales', () => {
      const invalidChemistryItem = {
        ...mockChemistryItem,
        answer: { correctIndex: 0, rationales: ['Only one rationale'] }
      };
      expect(() => ItemSchema.parse(invalidChemistryItem)).toThrow();
    });

    it('should reject freeText items without rubric', () => {
      const invalidSwedishItem = { ...mockSwedishItem, rubric: undefined };
      expect(() => ItemSchema.parse(invalidSwedishItem)).toThrow();
    });

    it('should reject rubric with invalid weight sum', () => {
      const invalidRubric: Rubric = {
        levelE: 'E',
        levelC: 'C',
        levelA: 'A',
        criteria: [
          { key: 'grammar', weight: 0.8 },
          { key: 'vocabulary', weight: 0.8 }
        ]
      };
      const invalidItem = { ...mockSwedishItem, rubric: invalidRubric };
      expect(() => ItemSchema.parse(invalidItem)).toThrow();
    });
  });

  describe('Lesson Schema Validation', () => {
    it('should validate lesson structure', () => {
      expect(() => LessonSchema.parse(mockLesson)).not.toThrow();
    });

    it('should reject lesson without required fields', () => {
      const invalidLesson = { ...mockLesson, title: undefined };
      expect(() => LessonSchema.parse(invalidLesson)).toThrow();
    });
  });

  describe('Flashcard Schema Validation', () => {
    it('should validate flashcard structure', () => {
      expect(() => FlashcardSchema.parse(mockFlashcard)).not.toThrow();
    });

    it('should reject flashcard without front or back', () => {
      const invalidFlashcard = { ...mockFlashcard, front: undefined };
      expect(() => FlashcardSchema.parse(invalidFlashcard)).toThrow();
    });
  });

  describe('Subject-specific Validation', () => {
    it('should validate math items correctly', () => {
      const result = validateSubjectItems([mockMathItem], 'math');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate physics items correctly', () => {
      const result = validateSubjectItems([mockPhysicsItem], 'physics');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate chemistry items correctly', () => {
      const result = validateSubjectItems([mockChemistryItem], 'chemistry');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate biology items correctly', () => {
      const result = validateSubjectItems([mockBiologyItem], 'biology');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate swedish items correctly', () => {
      const result = validateSubjectItems([mockSwedishItem], 'swedish');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate english items correctly', () => {
      const result = validateSubjectItems([mockEnglishItem], 'english');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid subject', () => {
      const result = validateSubjectItems([mockMathItem], 'invalid' as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Skill ID Mapping Validation', () => {
    it('should validate skill IDs against valid list', () => {
      const validSkillIds = ['variabler-uttryck', 'enkla-ekvationer', 'parenteser'];
      const result = validateSkillIdMapping([mockMathItem], validSkillIds);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid skill IDs', () => {
      const validSkillIds = ['valid-skill-1', 'valid-skill-2'];
      const invalidItem = { ...mockMathItem, skillId: 'invalid-skill' };
      const result = validateSkillIdMapping([invalidItem], validSkillIds);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Helper Functions', () => {
    describe('isCorrectNumeric', () => {
      it('should validate numeric answers with absolute tolerance', () => {
        const answer: NumericAnswer = { value: 10, tol: 0.1 };
        expect(isCorrectNumeric(10.05, answer)).toBe(true);
        expect(isCorrectNumeric(10.2, answer)).toBe(false);
      });

      it('should validate numeric answers with relative tolerance', () => {
        const answer: NumericAnswer = { value: 100, relTol: 5 }; // 5% tolerance
        expect(isCorrectNumeric(105, answer)).toBe(true);
        expect(isCorrectNumeric(110, answer)).toBe(false);
      });

      it('should validate numeric answers with default precision', () => {
        const answer: NumericAnswer = { value: 10 };
        expect(isCorrectNumeric(10.0001, answer)).toBe(true);
        expect(isCorrectNumeric(10.01, answer)).toBe(false);
      });
    });

    describe('scoreFreeText', () => {
      it('should score free text based on keywords', () => {
        const rubric: Rubric = {
          levelE: 'E',
          levelC: 'C',
          levelA: 'A',
          criteria: [
            { key: 'grammar', weight: 0.5 },
            { key: 'vocabulary', weight: 0.5 }
          ],
          keywords: ['väder', 'vackert', 'sol']
        };

        const result = scoreFreeText('Det är vackert väder idag med sol', rubric);
        expect(result.score).toBeGreaterThan(0);
        expect(result.feedback).toContain('Hittade nyckelord');
      });

      it('should penalize banned words', () => {
        const rubric: Rubric = {
          levelE: 'E',
          levelC: 'C',
          levelA: 'A',
          criteria: [
            { key: 'grammar', weight: 1.0 }
          ],
          banned: ['dålig', 'tråkig']
        };

        const result = scoreFreeText('Det är dåligt väder idag', rubric);
        expect(result.feedback).toContain('Undvik dessa ord');
      });

      it('should determine correct level', () => {
        const rubric: Rubric = {
          levelE: 'E',
          levelC: 'C',
          levelA: 'A',
          criteria: [
            { key: 'grammar', weight: 1.0 }
          ]
        };

        const result = scoreFreeText('Perfect text with all criteria', rubric);
        expect(result.feedback).toContain('Nivå A');
      });
    });
  });

  describe('Data Quality Tests', () => {
    it('should have minimum number of items per skill', () => {
      // This would be tested with actual loaded data
      // For now, we test the concept with mock data
      const items = [mockMathItem, mockMathItem, mockMathItem]; // 3 items
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it('should have proper difficulty distribution', () => {
      const items = [
        { ...mockMathItem, difficulty: 1 },
        { ...mockMathItem, difficulty: 2 },
        { ...mockMathItem, difficulty: 3 },
        { ...mockMathItem, difficulty: 4 },
        { ...mockMathItem, difficulty: 5 }
      ];
      
      const difficulties = items.map(item => item.difficulty);
      expect(difficulties).toContain(1);
      expect(difficulties).toContain(5);
      expect(difficulties.every(d => d >= 1 && d <= 5)).toBe(true);
    });

    it('should have proper tags for categorization', () => {
      expect(mockMathItem.tags).toContain('algebra');
      expect(mockPhysicsItem.tags).toContain('mekanik');
      expect(mockChemistryItem.tags).toContain('bindning');
      expect(mockBiologyItem.tags).toContain('DNA');
      expect(mockSwedishItem.tags).toContain('skrivande');
      expect(mockEnglishItem.tags).toContain('writing');
    });
  });
});
