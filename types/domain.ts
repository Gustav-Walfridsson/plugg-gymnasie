/**
 * Core domain types for Plugg Bot 1
 * Swedish gymnasiet mastery-based learning system
 */

export type SubjectId = 'matematik' | 'fysik' | 'svenska' | 'engelska' | 'kemi' | 'biologi';

export type SubjectSlug = 'math' | 'physics' | 'chemistry' | 'biology' | 'swedish' | 'english';

export type DifficultyLevel = 'enkel' | 'medel' | 'svår';

export type ItemType = 'numeric' | 'mcq' | 'flashcard' | 'freeText';

export type MasteryLevel = 'nybörjare' | 'lärande' | 'behärskad';

export interface Subject {
  id: SubjectId;
  name: string;
  description: string;
  color: string;
  icon: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  subjectId: SubjectId;
  topicId: string;
  difficulty: DifficultyLevel;
  prerequisites: string[];
  lessons: Lesson[];
  exercises: Exercise[];
}

export interface Lesson {
  id: string;
  skillId: string;
  title: string;
  content: string;
  order: number;
}

// Answer types for different item types
export interface NumericAnswer {
  value: number;
  unit?: string;
  tol?: number;        // absolut tolerans
  relTol?: number;     // relativ tolerans (procent)
  canonicalUnit?: string;
  acceptedUnits?: string[];
}

export interface McqAnswer {
  correctIndex: number;
  rationales?: string[]; // en per alternativ
}

export interface FreeTextAnswer {
  modelAnswer: string;
}

export interface FlashcardAnswer {
  front: string;
  back: string;
}

export type ItemAnswer = NumericAnswer | McqAnswer | FreeTextAnswer | FlashcardAnswer;

export interface RubricCriteria {
  key: string;
  weight: number;
}

export interface Rubric {
  levelE: string;
  levelC: string;
  levelA: string;
  criteria: RubricCriteria[];
  keywords?: string[];
  banned?: string[];
}

export interface Item {
  id: string;
  skillId: string;
  type: ItemType;
  prompt: string;
  latex?: string;
  choices?: string[];      // mcq
  answer: ItemAnswer;
  explanation: string;
  hints?: string[];
  difficulty: number;      // 1-5
  tags?: string[];
  rubric?: Rubric;        // freeText only
}

export interface Exercise {
  id: string;
  skillId: string;
  title: string;
  question: string;
  type: ItemType;
  options?: string[]; // For MCQ
  correctAnswer: string | number;
  explanation: string;
  difficulty: DifficultyLevel;
  order: number;
}

export interface QuizItem {
  id: string;
  skillId: string;
  question: string;
  type: ItemType;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: DifficultyLevel;
}

export interface Attempt {
  id: string;
  itemId: string;
  skillId: string;
  userId: string;
  answer: string | number;
  isCorrect: boolean;
  timestamp: Date;
  timeSpent: number; // milliseconds
}

export interface MasteryState {
  skillId: string;
  userId: string;
  probability: number; // 0-1, mastery threshold at 0.9
  attempts: number;
  correctAttempts: number;
  lastAttempt: Date;
  lastMasteryUpdate: Date;
  isMastered: boolean;
  masteryDate?: Date;
}

export interface SpacedRepetitionItem {
  id: string;
  skillId: string;
  userId: string;
  interval: number; // hours
  repetitions: number;
  easeFactor: number;
  nextReview: Date;
  lastReview?: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  level: number;
  totalXP: number;
  badges: Badge[];
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    language: 'sv';
  };
  studyStreak: number;
  lastActive: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  subjectId?: SubjectId;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  subjectId: SubjectId;
  skillId?: string;
  itemsCompleted: number;
  correctAnswers: number;
  totalTime: number;
}

export interface AnalyticsEvent {
  type: 'start_session' | 'start_practice' | 'item_answered' | 'skill_mastered' | 'review_due';
  userId: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface PracticeTest {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  items: QuizItem[];
  timeLimit?: number; // minutes
  passingScore: number; // percentage
}

export interface WeaknessAnalysis {
  skillId: string;
  skillName: string;
  subjectId: SubjectId;
  weaknessScore: number; // 0-1, higher = weaker
  recentErrors: number;
  lastAttempt: Date;
  recommendedActions: string[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  duration: number; // minutes
  skills: string[];
  estimatedCompletion: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface FlashcardItem {
  id: string;
  type: 'flashcard';
  front: string;
  back: string;
  tags?: string[];
}

export interface SubjectFixtures {
  lessons: Lesson[];
  exercises: Item[];
  quiz: Item[];
  flashcards?: FlashcardItem[];
}
