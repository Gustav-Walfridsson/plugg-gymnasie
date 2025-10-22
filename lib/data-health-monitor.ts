/**
 * Data Health Monitor and Auto-Fix System
 * 
 * This unique solution detects data loading issues and automatically fixes them.
 * It provides fallback data, detailed logging, and user-friendly status indicators.
 */

import type { 
  SubjectSlug, 
  Item, 
  Lesson, 
  FlashcardItem, 
  SubjectFixtures,
  Subject,
  Topic,
  Skill
} from '../types/domain';

// Health status types
export type DataHealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';

export interface DataHealthReport {
  status: DataHealthStatus;
  issues: string[];
  fixes: string[];
  stats: {
    totalSubjects: number;
    totalLessons: number;
    totalItems: number;
    totalFlashcards: number;
  };
  lastChecked: Date;
}

// Fallback data generators
const generateFallbackLessons = (skillId: string): Lesson[] => {
  const skillLessons: Record<string, Lesson[]> = {
    'variabler-uttryck': [
      {
        id: 'fallback-lesson-1',
        skillId: 'variabler-uttryck',
        title: 'Variabler och uttryck - Grundläggande',
        content: `## Vad är en variabel?

En variabel är en bokstav eller symbol som representerar ett okänt värde. I matematik använder vi ofta bokstäver som x, y, z för att representera variabler.

## Exempel på variabler:
- x = 5 (x är en variabel med värdet 5)
- y = 2x + 3 (y är en variabel som beror på x)
- a = 10, b = 7 (a och b är variabler)

## Algebraiska uttryck

Ett algebraiskt uttryck är en kombination av variabler, tal och räkneoperationer (+, -, ×, ÷).

### Exempel:
- 2x + 5
- 3y - 7
- x² + 2x - 1
- 4a + 3b - 2c

## Viktiga regler:
1. När vi multiplicerar ett tal med en variabel skriver vi talet först: 2x, inte x2
2. Vi kan addera och subtrahera termer med samma variabel: 2x + 3x = 5x
3. Vi kan inte addera termer med olika variabler: 2x + 3y kan inte förenklas

## Övning:
Förenkla uttrycket: 3x + 2x - 5 + 7

Lösning: 3x + 2x - 5 + 7 = 5x + 2`,
        order: 1
      }
    ],
    'enkla-ekvationer': [
      {
        id: 'fallback-lesson-2',
        skillId: 'enkla-ekvationer',
        title: 'Enkla ekvationer - Grundläggande',
        content: `## Vad är en ekvation?

En ekvation är en matematisk likhet som innehåller en eller flera variabler. Vi löser ekvationer genom att hitta värdet på variabeln som gör likheten sann.

## Exempel på enkla ekvationer:
- x + 3 = 7
- 2x = 10
- x - 4 = 8
- x/3 = 5

## Metod för att lösa enkla ekvationer:

### Steg 1: Identifiera operationen
Titta på vad som görs med variabeln.

### Steg 2: Använd motsatt operation
För att lösa ekvationen använder vi den motsatta operationen på båda sidor.

### Steg 3: Kontrollera svaret
Sätt in värdet i den ursprungliga ekvationen.

## Exempel 1: x + 3 = 7
1. Operation: addition (+3)
2. Motsatt operation: subtraktion (-3)
3. x + 3 - 3 = 7 - 3
4. x = 4
5. Kontroll: 4 + 3 = 7 ✓

## Exempel 2: 2x = 10
1. Operation: multiplikation (×2)
2. Motsatt operation: division (÷2)
3. 2x ÷ 2 = 10 ÷ 2
4. x = 5
5. Kontroll: 2 × 5 = 10 ✓

## Övning:
Lös ekvationen: 3x - 7 = 14

Lösning:
3x - 7 = 14
3x - 7 + 7 = 14 + 7
3x = 21
3x ÷ 3 = 21 ÷ 3
x = 7`,
        order: 2
      }
    ]
  };

  return skillLessons[skillId] || [
    {
      id: `fallback-lesson-${skillId}`,
      skillId,
      title: `Lektion för ${skillId}`,
      content: `Detta är en fallback-lektion för färdigheten ${skillId}. Den ursprungliga lektionen kunde inte laddas, men här får du grundläggande information.

## Vad du kommer att lära dig:
- Grundläggande koncept för ${skillId}
- Praktiska exempel
- Övningar för att förstärka lärandet

## Nästa steg:
Försök att ladda om sidan eller kontakta support om problemet kvarstår.`,
      order: 1
    }
  ];
};

const generateFallbackItems = (skillId: string): Item[] => {
  const skillItems: Record<string, Item[]> = {
    'variabler-uttryck': [
      {
        id: 'fallback-item-1',
        skillId: 'variabler-uttryck',
        type: 'numeric',
        prompt: 'Beräkna: 2 + 3 = ?',
        latex: '2 + 3 = ?',
        answer: { value: 5 },
        explanation: 'Förklaring för Beräkna: 2 + 3 = ?. Steg-för-steg lösning kommer här.',
        difficulty: 1,
        tags: ['algebra', 'ekvationer']
      },
      {
        id: 'fallback-item-2',
        skillId: 'variabler-uttryck',
        type: 'numeric',
        prompt: 'Vad är värdet av uttrycket 3x + 5 när x = 4?',
        latex: '3x + 5 \\text{ när } x = 4',
        answer: { value: 17 },
        explanation: 'Substituera x = 4: 3(4) + 5 = 12 + 5 = 17',
        difficulty: 2,
        tags: ['algebra', 'ekvationer']
      }
    ],
    'enkla-ekvationer': [
      {
        id: 'fallback-item-3',
        skillId: 'enkla-ekvationer',
        type: 'numeric',
        prompt: 'Lös ekvationen: 2x + 5 = 13',
        latex: '2x + 5 = 13',
        answer: { value: 4 },
        explanation: 'Förklaring för Lös ekvationen: 2x + 5 = 13. Steg-för-steg lösning kommer här.',
        difficulty: 2,
        tags: ['algebra', 'ekvationer']
      }
    ]
  };

  return skillItems[skillId] || [
    {
      id: `fallback-item-${skillId}`,
      skillId,
      type: 'numeric',
      prompt: `Fallback fråga för ${skillId}`,
      latex: `\\text{Fallback fråga för } ${skillId}`,
      answer: { value: 1 },
      explanation: `Detta är en fallback-fråga för färdigheten ${skillId}. Den ursprungliga frågan kunde inte laddas.`,
      difficulty: 1,
      tags: ['fallback']
    }
  ];
};

class DataHealthMonitor {
  private static instance: DataHealthMonitor;
  private healthReport: DataHealthReport | null = null;
  private lastHealthCheck: Date | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): DataHealthMonitor {
    if (!DataHealthMonitor.instance) {
      DataHealthMonitor.instance = new DataHealthMonitor();
    }
    return DataHealthMonitor.instance;
  }

  /**
   * Perform comprehensive health check
   */
  public async performHealthCheck(): Promise<DataHealthReport> {
    console.log('🔍 Starting data health check...');
    
    const issues: string[] = [];
    const fixes: string[] = [];
    let status: DataHealthStatus = 'healthy';

    try {
      // Check localStorage availability
      if (typeof window === 'undefined') {
        issues.push('localStorage not available (server-side)');
        status = 'degraded';
      } else {
        // Check if fixtures are loaded
        const fixturesVersion = localStorage.getItem('pb1_fixtures_version');
        if (!fixturesVersion) {
          issues.push('Fixtures not loaded in localStorage');
          fixes.push('Attempting to reload fixtures...');
          status = 'critical';
        }

        // Check data integrity
        const subjects = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
        let totalLessons = 0;
        let totalItems = 0;
        let totalFlashcards = 0;

        for (const subject of subjects) {
          // Check lessons
          const lessonsKey = `pb1_lessons_${subject}`;
          const lessonsData = localStorage.getItem(lessonsKey);
          if (!lessonsData) {
            issues.push(`No lessons data for ${subject}`);
            fixes.push(`Will generate fallback lessons for ${subject}`);
            status = status === 'healthy' ? 'degraded' : 'critical';
          } else {
            try {
              const lessons = JSON.parse(lessonsData);
              totalLessons += lessons.length;
            } catch (error) {
              issues.push(`Corrupted lessons data for ${subject}`);
              fixes.push(`Will regenerate lessons data for ${subject}`);
              status = 'critical';
            }
          }

          // Check exercises
          const exercisesKey = `pb1_items_${subject}_exercises`;
          const exercisesData = localStorage.getItem(exercisesKey);
          if (!exercisesData) {
            issues.push(`No exercises data for ${subject}`);
            fixes.push(`Will generate fallback exercises for ${subject}`);
            status = status === 'healthy' ? 'degraded' : 'critical';
          } else {
            try {
              const exercises = JSON.parse(exercisesData);
              totalItems += exercises.length;
            } catch (error) {
              issues.push(`Corrupted exercises data for ${subject}`);
              fixes.push(`Will regenerate exercises data for ${subject}`);
              status = 'critical';
            }
          }

          // Check quiz
          const quizKey = `pb1_items_${subject}_quiz`;
          const quizData = localStorage.getItem(quizKey);
          if (!quizData) {
            issues.push(`No quiz data for ${subject}`);
            fixes.push(`Will generate fallback quiz for ${subject}`);
            status = status === 'healthy' ? 'degraded' : 'critical';
          } else {
            try {
              const quiz = JSON.parse(quizData);
              totalItems += quiz.length;
            } catch (error) {
              issues.push(`Corrupted quiz data for ${subject}`);
              fixes.push(`Will regenerate quiz data for ${subject}`);
              status = 'critical';
            }
          }

          // Check flashcards
          const flashcardsKey = `pb1_flashcards_${subject}`;
          const flashcardsData = localStorage.getItem(flashcardsKey);
          if (flashcardsData) {
            try {
              const flashcards = JSON.parse(flashcardsData);
              totalFlashcards += flashcards.length;
            } catch (error) {
              issues.push(`Corrupted flashcards data for ${subject}`);
              fixes.push(`Will regenerate flashcards data for ${subject}`);
              status = 'critical';
            }
          }
        }

        this.healthReport = {
          status,
          issues,
          fixes,
          stats: {
            totalSubjects: subjects.length,
            totalLessons,
            totalItems,
            totalFlashcards
          },
          lastChecked: new Date()
        };

        this.lastHealthCheck = new Date();
        
        console.log('✅ Data health check completed:', this.healthReport);
        
        return this.healthReport;
      }
    } catch (error) {
      console.error('❌ Error during health check:', error);
      status = 'critical';
      issues.push(`Health check failed: ${error}`);
    }

    this.healthReport = {
      status,
      issues,
      fixes,
      stats: {
        totalSubjects: 0,
        totalLessons: 0,
        totalItems: 0,
        totalFlashcards: 0
      },
      lastChecked: new Date()
    };

    return this.healthReport;
  }

  /**
   * Get current health status
   */
  public getHealthStatus(): DataHealthReport | null {
    return this.healthReport;
  }

  /**
   * Check if health check is needed
   */
  public needsHealthCheck(): boolean {
    if (!this.lastHealthCheck) return true;
    const now = new Date();
    const diff = now.getTime() - this.lastHealthCheck.getTime();
    return diff > this.HEALTH_CHECK_INTERVAL;
  }

  /**
   * Auto-fix data issues
   */
  public async autoFix(): Promise<boolean> {
    console.log('🔧 Starting auto-fix...');
    
    if (typeof window === 'undefined') {
      console.log('⚠️ Cannot auto-fix on server-side');
      return false;
    }

    try {
      // Clear corrupted data
      const subjects = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
      
      for (const subject of subjects) {
        const keys = [
          `pb1_lessons_${subject}`,
          `pb1_items_${subject}_exercises`,
          `pb1_items_${subject}_quiz`,
          `pb1_flashcards_${subject}`
        ];

        for (const key of keys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              JSON.parse(data);
            } catch (error) {
              console.log(`🗑️ Removing corrupted data: ${key}`);
              localStorage.removeItem(key);
            }
          }
        }
      }

      // Remove version flag to force reload
      localStorage.removeItem('pb1_fixtures_version');
      
      console.log('✅ Auto-fix completed');
      return true;
    } catch (error) {
      console.error('❌ Auto-fix failed:', error);
      return false;
    }
  }

  /**
   * Get fallback lessons for a skill
   */
  public getFallbackLessons(skillId: string): Lesson[] {
    console.log(`🔄 Using fallback lessons for skill: ${skillId}`);
    return generateFallbackLessons(skillId);
  }

  /**
   * Get fallback items for a skill
   */
  public getFallbackItems(skillId: string): Item[] {
    console.log(`🔄 Using fallback items for skill: ${skillId}`);
    return generateFallbackItems(skillId);
  }

  /**
   * Generate health status message for UI
   */
  public getHealthStatusMessage(): string {
    if (!this.healthReport) return 'Data status: Unknown';

    switch (this.healthReport.status) {
      case 'healthy':
        return `✅ Data healthy (${this.healthReport.stats.totalLessons} lessons, ${this.healthReport.stats.totalItems} items)`;
      case 'degraded':
        return `⚠️ Data degraded (${this.healthReport.issues.length} issues)`;
      case 'critical':
        return `❌ Data critical (${this.healthReport.issues.length} issues)`;
      default:
        return 'Data status: Unknown';
    }
  }
}

export const dataHealthMonitor = DataHealthMonitor.getInstance();
