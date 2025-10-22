/**
 * Data loading and management for Plugg Bot 1
 * Handles lazy loading of fixtures and localStorage integration
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
import { dataHealthMonitor } from './data-health-monitor';

// LocalStorage keys
const FIXTURES_VERSION_KEY = 'pb1_fixtures_version';
const ITEMS_PREFIX = 'pb1_items_';
const LESSONS_PREFIX = 'pb1_lessons_';
const FLASHCARDS_PREFIX = 'pb1_flashcards_';

// Current fixtures version
const FIXTURES_VERSION = '1.0.0';

// Subject ID to slug mapping
const SUBJECT_ID_TO_SLUG: Record<string, SubjectSlug> = {
  'matematik': 'math',
  'fysik': 'physics', 
  'kemi': 'chemistry',
  'biologi': 'biology',
  'svenska': 'swedish',
  'engelska': 'english'
};

// Subject to file mapping
const SUBJECT_FILES: Record<SubjectSlug, { 
  lessons: string; 
  exercises: string; 
  quiz: string; 
  flashcards?: string;
}> = {
  math: { lessons: 'algebra.lessons.json', exercises: 'algebra.exercises.json', quiz: 'algebra.quiz.json' },
  physics: { lessons: 'mechanics.lessons.json', exercises: 'mechanics.exercises.json', quiz: 'mechanics.quiz.json' },
  chemistry: { lessons: 'bonding.lessons.json', exercises: 'bonding.exercises.json', quiz: 'bonding.quiz.json' },
  biology: { lessons: 'genetics.lessons.json', exercises: 'genetics.exercises.json', quiz: 'genetics.quiz.json', flashcards: 'flashcards.json' },
  swedish: { lessons: 'writing.lessons.json', exercises: 'writing.exercises.json', quiz: 'writing.quiz.json' },
  english: { lessons: 'writing.lessons.json', exercises: 'writing.exercises.json', quiz: 'writing.quiz.json', flashcards: 'vocab.flashcards.json' }
};

// Cache for loaded data
const dataCache = new Map<string, any>();

/**
 * Load subject fixtures from JSON files
 */
export async function loadSubjectFixtures(subject: SubjectSlug | string): Promise<SubjectFixtures> {
  // Convert subject ID to slug if needed
  const subjectSlug = SUBJECT_ID_TO_SLUG[subject] || subject as SubjectSlug;
  const cacheKey = `fixtures_${subjectSlug}`;
  
  // Check cache first
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }
  
  try {
    const files = SUBJECT_FILES[subjectSlug];
    if (!files) {
      throw new Error(`No file mapping found for subject: ${subject}`);
    }
    
    const basePath = `/data/${subjectSlug}`;
    
    // Load lessons
    const lessonsResponse = await fetch(`${basePath}/${files.lessons}`, {
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    if (!lessonsResponse.ok) {
      throw new Error(`Failed to load lessons for ${subjectSlug}: ${lessonsResponse.statusText}`);
    }
    const lessons = await lessonsResponse.json();
    
    // Load exercises
    const exercisesResponse = await fetch(`${basePath}/${files.exercises}`, {
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    if (!exercisesResponse.ok) {
      throw new Error(`Failed to load exercises for ${subjectSlug}: ${exercisesResponse.statusText}`);
    }
    const exercises = await exercisesResponse.json();
    
    // Load quiz
    const quizResponse = await fetch(`${basePath}/${files.quiz}`, {
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    if (!quizResponse.ok) {
      throw new Error(`Failed to load quiz for ${subjectSlug}: ${quizResponse.statusText}`);
    }
    const quiz = await quizResponse.json();
    
    // Load flashcards if available
    let flashcards: FlashcardItem[] = [];
    if (files.flashcards) {
      try {
        const flashcardsResponse = await fetch(`${basePath}/${files.flashcards}`, {
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        if (flashcardsResponse.ok) {
          flashcards = await flashcardsResponse.json();
        }
      } catch (error) {
        console.warn(`Failed to load flashcards for ${subjectSlug}:`, error);
      }
    }
    
    const fixtures: SubjectFixtures = {
      lessons,
      exercises,
      quiz,
      flashcards
    };
    
    // Cache the result
    dataCache.set(cacheKey, fixtures);
    
    return fixtures;
  } catch (error) {
    console.error(`Error loading fixtures for ${subject}:`, error);
    throw error;
  }
}

/**
 * Seed localStorage with fixtures data with health monitoring
 */
export async function seedLocalStore(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    // Quick check - if fixtures are already loaded, skip loading
    const currentVersion = localStorage.getItem(FIXTURES_VERSION_KEY);
    if (currentVersion === FIXTURES_VERSION) {
      console.log('Fixtures already up to date, skipping loading');
      return;
    }
    
    console.log('Seeding localStorage with fixtures...');
    
    const subjects: string[] = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
    let successCount = 0;
    let errorCount = 0;
    
    // Load subjects in parallel with individual timeouts
    const loadPromises = subjects.map(async (subject) => {
      try {
        console.log(`📥 Loading fixtures for ${subject}...`);
        
        // Add individual timeout for each subject
        const subjectPromise = loadSubjectFixtures(subject);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout loading ${subject}`)), 3000)
        );
        
        const fixtures = await Promise.race([subjectPromise, timeoutPromise]) as any;
        
        // Store lessons
        localStorage.setItem(`${LESSONS_PREFIX}${subject}`, JSON.stringify(fixtures.lessons));
        
        // Store exercises
        localStorage.setItem(`${ITEMS_PREFIX}${subject}_exercises`, JSON.stringify(fixtures.exercises));
        
        // Store quiz
        localStorage.setItem(`${ITEMS_PREFIX}${subject}_quiz`, JSON.stringify(fixtures.quiz));
        
        // Store flashcards if available
        if (fixtures.flashcards && fixtures.flashcards.length > 0) {
          localStorage.setItem(`${FLASHCARDS_PREFIX}${subject}`, JSON.stringify(fixtures.flashcards));
        }
        
        console.log(`✅ Seeded ${subject}: ${fixtures.lessons.length} lessons, ${fixtures.exercises.length} exercises, ${fixtures.quiz.length} quiz items`);
        return { success: true, subject };
      } catch (error) {
        console.error(`❌ Failed to seed ${subject}:`, error);
        return { success: false, subject, error };
      }
    });
    
    // Wait for all subjects to complete (or timeout)
    const results = await Promise.allSettled(loadPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    });
    
    // Update version even if some subjects failed
    localStorage.setItem(FIXTURES_VERSION_KEY, FIXTURES_VERSION);
    
    console.log(`✅ LocalStorage seeding complete: ${successCount} subjects successful, ${errorCount} errors`);
    
    if (errorCount > 0) {
      console.warn(`⚠️ ${errorCount} subjects failed to load, but continuing with available data`);
    }
  } catch (error) {
    console.error('Error seeding localStorage:', error);
    // Don't throw error - just log it and continue
    console.log('Continuing without fixtures data...');
  }
}

/**
 * Get items by skill ID from localStorage with health monitoring and fallback
 */
export function getItemsBySkill(skillId: string): Item[] {
  if (typeof window === 'undefined') return [];
  
  const items: Item[] = [];
  
  // Search through all subjects
  const subjects: string[] = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
  
  for (const subject of subjects) {
    // Check exercises
    const exercisesKey = `${ITEMS_PREFIX}${subject}_exercises`;
    const exercisesData = localStorage.getItem(exercisesKey);
    if (exercisesData) {
      try {
        const exercises = JSON.parse(exercisesData);
        const skillExercises = exercises.filter((item: Item) => item.skillId === skillId);
        items.push(...skillExercises);
      } catch (error) {
        console.warn(`Failed to parse exercises for ${subject}:`, error);
      }
    }
    
    // Check quiz
    const quizKey = `${ITEMS_PREFIX}${subject}_quiz`;
    const quizData = localStorage.getItem(quizKey);
    if (quizData) {
      try {
        const quiz = JSON.parse(quizData);
        const skillQuiz = quiz.filter((item: Item) => item.skillId === skillId);
        items.push(...skillQuiz);
      } catch (error) {
        console.warn(`Failed to parse quiz for ${subject}:`, error);
      }
    }
  }
  
  // If no items found, use fallback data
  if (items.length === 0) {
    console.log(`No items found for skill ${skillId}, using fallback data`);
    return dataHealthMonitor.getFallbackItems(skillId);
  }
  
  return items;
}

/**
 * Get lessons by skill ID from localStorage with health monitoring and fallback
 */
export function getLessonsBySkill(skillId: string): Lesson[] {
  if (typeof window === 'undefined') return [];
  
  const lessons: Lesson[] = [];
  
  const subjects: string[] = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
  
  for (const subject of subjects) {
    const lessonsKey = `${LESSONS_PREFIX}${subject}`;
    const lessonsData = localStorage.getItem(lessonsKey);
    if (lessonsData) {
      try {
        const subjectLessons = JSON.parse(lessonsData);
        const skillLessons = subjectLessons.filter((lesson: Lesson) => lesson.skillId === skillId);
        lessons.push(...skillLessons);
      } catch (error) {
        console.warn(`Failed to parse lessons for ${subject}:`, error);
      }
    }
  }
  
  // If no lessons found, use fallback data
  if (lessons.length === 0) {
    console.log(`No lessons found for skill ${skillId}, using fallback data`);
    return dataHealthMonitor.getFallbackLessons(skillId);
  }
  
  return lessons;
}

/**
 * Get flashcards by subject from localStorage
 */
export function getFlashcardsBySubject(subject: SubjectSlug | string): FlashcardItem[] {
  if (typeof window === 'undefined') return [];
  
  const flashcardsKey = `${FLASHCARDS_PREFIX}${subject}`;
  const flashcardsData = localStorage.getItem(flashcardsKey);
  
  if (flashcardsData) {
    try {
      return JSON.parse(flashcardsData);
    } catch (error) {
      console.warn(`Failed to parse flashcards for ${subject}:`, error);
    }
  }
  
  return [];
}

/**
 * Get all flashcards from localStorage
 */
export function getAllFlashcards(): FlashcardItem[] {
  if (typeof window === 'undefined') return [];
  
  const flashcards: FlashcardItem[] = [];
  
  const subjects: string[] = ['biologi', 'engelska']; // Only these subjects have flashcards
  
  for (const subject of subjects) {
    const subjectFlashcards = getFlashcardsBySubject(subject);
    flashcards.push(...subjectFlashcards);
  }
  
  return flashcards;
}

/**
 * Get items by difficulty level
 */
export function getItemsByDifficulty(difficulty: number): Item[] {
  if (typeof window === 'undefined') return [];
  
  const items: Item[] = [];
  
  const subjects: string[] = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
  
  for (const subject of subjects) {
    // Check exercises
    const exercisesKey = `${ITEMS_PREFIX}${subject}_exercises`;
    const exercisesData = localStorage.getItem(exercisesKey);
    if (exercisesData) {
      try {
        const exercises = JSON.parse(exercisesData);
        const difficultyExercises = exercises.filter((item: Item) => item.difficulty === difficulty);
        items.push(...difficultyExercises);
      } catch (error) {
        console.warn(`Failed to parse exercises for ${subject}:`, error);
      }
    }
    
    // Check quiz
    const quizKey = `${ITEMS_PREFIX}${subject}_quiz`;
    const quizData = localStorage.getItem(quizKey);
    if (quizData) {
      try {
        const quiz = JSON.parse(quizData);
        const difficultyQuiz = quiz.filter((item: Item) => item.difficulty === difficulty);
        items.push(...difficultyQuiz);
      } catch (error) {
        console.warn(`Failed to parse quiz for ${subject}:`, error);
      }
    }
  }
  
  return items;
}

/**
 * Get random items for practice
 */
export function getRandomItems(count: number, skillId?: string, difficulty?: number): Item[] {
  if (typeof window === 'undefined') return [];
  
  let items: Item[] = [];
  
  if (skillId) {
    items = getItemsBySkill(skillId);
  } else {
    const subjects: string[] = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
    
    for (const subject of subjects) {
      // Get exercises
      const exercisesKey = `${ITEMS_PREFIX}${subject}_exercises`;
      const exercisesData = localStorage.getItem(exercisesKey);
      if (exercisesData) {
        try {
          const exercises = JSON.parse(exercisesData);
          items.push(...exercises);
        } catch (error) {
          console.warn(`Failed to parse exercises for ${subject}:`, error);
        }
      }
      
      // Get quiz
      const quizKey = `${ITEMS_PREFIX}${subject}_quiz`;
      const quizData = localStorage.getItem(quizKey);
      if (quizData) {
        try {
          const quiz = JSON.parse(quizData);
          items.push(...quiz);
        } catch (error) {
          console.warn(`Failed to parse quiz for ${subject}:`, error);
        }
      }
    }
  }
  
  // Filter by difficulty if specified
  if (difficulty) {
    items = items.filter(item => item.difficulty === difficulty);
  }
  
  // Shuffle and return requested count
  const shuffled = items.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Check if fixtures are loaded
 */
export function areFixturesLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  
  const currentVersion = localStorage.getItem(FIXTURES_VERSION_KEY);
  return currentVersion === FIXTURES_VERSION;
}

/**
 * Clear fixtures from localStorage
 */
export function clearFixtures(): void {
  if (typeof window === 'undefined') return;
  
  const subjects: string[] = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
  
  for (const subject of subjects) {
    localStorage.removeItem(`${LESSONS_PREFIX}${subject}`);
    localStorage.removeItem(`${ITEMS_PREFIX}${subject}_exercises`);
    localStorage.removeItem(`${ITEMS_PREFIX}${subject}_quiz`);
    localStorage.removeItem(`${FLASHCARDS_PREFIX}${subject}`);
  }
  
  localStorage.removeItem(FIXTURES_VERSION_KEY);
  dataCache.clear();
  
  console.log('Fixtures cleared from localStorage');
}

/**
 * Get fixtures statistics
 */
export function getFixturesStats(): { 
  totalItems: number; 
  totalLessons: number; 
  totalFlashcards: number;
  subjects: Record<string, { items: number; lessons: number; flashcards: number; }>;
} {
  if (typeof window === 'undefined') {
    return {
      totalItems: 0,
      totalLessons: 0,
      totalFlashcards: 0,
      subjects: {} as Record<string, { items: number; lessons: number; flashcards: number; }>
    };
  }
  
  const stats = {
    totalItems: 0,
    totalLessons: 0,
    totalFlashcards: 0,
    subjects: {} as Record<string, { items: number; lessons: number; flashcards: number; }>
  };
  
  const subjects: string[] = ['matematik', 'fysik', 'kemi', 'biologi', 'svenska', 'engelska'];
  
  for (const subject of subjects) {
    let items = 0;
    let lessons = 0;
    let flashcards = 0;
    
    // Count lessons
    const lessonsKey = `${LESSONS_PREFIX}${subject}`;
    const lessonsData = localStorage.getItem(lessonsKey);
    if (lessonsData) {
      try {
        const subjectLessons = JSON.parse(lessonsData);
        lessons = subjectLessons.length;
        stats.totalLessons += lessons;
      } catch (error) {
        console.warn(`Failed to parse lessons for ${subject}:`, error);
      }
    }
    
    // Count exercises
    const exercisesKey = `${ITEMS_PREFIX}${subject}_exercises`;
    const exercisesData = localStorage.getItem(exercisesKey);
    if (exercisesData) {
      try {
        const exercises = JSON.parse(exercisesData);
        items += exercises.length;
      } catch (error) {
        console.warn(`Failed to parse exercises for ${subject}:`, error);
      }
    }
    
    // Count quiz
    const quizKey = `${ITEMS_PREFIX}${subject}_quiz`;
    const quizData = localStorage.getItem(quizKey);
    if (quizData) {
      try {
        const quiz = JSON.parse(quizData);
        items += quiz.length;
      } catch (error) {
        console.warn(`Failed to parse quiz for ${subject}:`, error);
      }
    }
    
    // Count flashcards
    const flashcardsKey = `${FLASHCARDS_PREFIX}${subject}`;
    const flashcardsData = localStorage.getItem(flashcardsKey);
    if (flashcardsData) {
      try {
        const subjectFlashcards = JSON.parse(flashcardsData);
        flashcards = subjectFlashcards.length;
        stats.totalFlashcards += flashcards;
      } catch (error) {
        console.warn(`Failed to parse flashcards for ${subject}:`, error);
      }
    }
    
    stats.totalItems += items;
    stats.subjects[subject] = { items, lessons, flashcards };
  }
  
  return stats;
}

/**
 * Load subjects from skills.json
 */
export async function getSubjects(): Promise<Subject[]> {
  try {
    console.log('🔄 Fetching subjects from /data/skills.json...');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('/data/skills.json', {
      signal: controller.signal,
      cache: 'no-cache' // Ensure fresh data
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to load skills.json: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully loaded subjects:', data.subjects?.length || 0);
    return data.subjects || [];
  } catch (error) {
    console.error('❌ Error loading subjects:', error);
    console.log('🔄 Using fallback subjects...');
    
    // Return fallback subjects if fetch fails
    return [
      {
        id: 'matematik',
        name: 'Matematik',
        description: 'Algebra och grundläggande matematik',
        color: 'bg-blue-600',
        icon: 'Calculator',
        topics: []
      },
      {
        id: 'fysik',
        name: 'Fysik',
        description: 'Mekanik och grundläggande fysik',
        color: 'bg-purple-600',
        icon: 'Atom',
        topics: []
      },
      {
        id: 'svenska',
        name: 'Svenska',
        description: 'Skrivande och grammatisk feedback',
        color: 'bg-green-600',
        icon: 'BookOpen',
        topics: []
      },
      {
        id: 'engelska',
        name: 'Engelska',
        description: 'Writing och vocabulary feedback',
        color: 'bg-red-600',
        icon: 'Globe',
        topics: []
      },
      {
        id: 'kemi',
        name: 'Kemi',
        description: 'Binding och bonding',
        color: 'bg-orange-600',
        icon: 'Beaker',
        topics: []
      },
      {
        id: 'biologi',
        name: 'Biologi',
        description: 'Genetik och grundläggande biologi',
        color: 'bg-teal-600',
        icon: 'Dna',
        topics: []
      }
    ];
  }
}

/**
 * Get topics for a specific subject
 */
export async function getTopicsBySubject(subjectId: string): Promise<Topic[]> {
  try {
    const subjects = await getSubjects();
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.topics || [];
  } catch (error) {
    console.error(`Error loading topics for subject ${subjectId}:`, error);
    return [];
  }
}

/**
 * Get skills for a specific topic
 */
export async function getSkillsByTopic(subjectId: string, topicId: string): Promise<Skill[]> {
  try {
    const topics = await getTopicsBySubject(subjectId);
    const topic = topics.find(t => t.id === topicId);
    return topic?.skills || [];
  } catch (error) {
    console.error(`Error loading skills for topic ${topicId}:`, error);
    return [];
  }
}

/**
 * Get a specific skill by ID
 */
export async function getSkillById(subjectId: string, topicId: string, skillId: string): Promise<Skill | null> {
  try {
    const skills = await getSkillsByTopic(subjectId, topicId);
    return skills.find(s => s.id === skillId) || null;
  } catch (error) {
    console.error(`Error loading skill ${skillId}:`, error);
    return null;
  }
}

/**
 * Get subject by ID
 */
export async function getSubjectById(subjectId: string): Promise<Subject | null> {
  try {
    const subjects = await getSubjects();
    return subjects.find(s => s.id === subjectId) || null;
  } catch (error) {
    console.error(`Error loading subject ${subjectId}:`, error);
    return null;
  }
}