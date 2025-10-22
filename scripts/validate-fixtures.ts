#!/usr/bin/env ts-node

/**
 * Validate fixtures script for Plugg Bot 1
 * Validates all JSON fixtures using Zod schemas
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { 
  SubjectSlugSchema, 
  ItemSchema, 
  LessonSchema, 
  FlashcardSchema,
  validateSubjectItems,
  validateSkillIdMapping
} from '../lib/schemas';
import type { Item, Lesson, FlashcardItem, SubjectSlug } from '../types/domain';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load skills.json to get valid skill IDs
const skillsPath = join(__dirname, '../data/skills.json');
const skillsData = JSON.parse(readFileSync(skillsPath, 'utf-8'));
const validSkillIds = new Set<string>();

// Extract all skill IDs from skills.json
skillsData.subjects.forEach((subject: any) => {
  subject.topics.forEach((topic: any) => {
    topic.skills.forEach((skill: any) => {
      validSkillIds.add(skill.id);
    });
  });
});

console.log('🔍 Validating Plugg Bot 1 fixtures...\n');

const subjects: SubjectSlug[] = ['math', 'physics', 'chemistry', 'biology', 'swedish', 'english'];
let totalItems = 0;
let totalLessons = 0;
let totalFlashcards = 0;
let allValid = true;
const errors: string[] = [];

// Subject to Swedish name mapping
const subjectNames: Record<SubjectSlug, string> = {
  math: 'Matematik',
  physics: 'Fysik', 
  chemistry: 'Kemi',
  biology: 'Biologi',
  swedish: 'Svenska',
  english: 'Engelska'
};

for (const subject of subjects) {
  console.log(`📚 ${subjectNames[subject]}:`);
  
  const subjectDir = join(__dirname, '../data', subject);
  let subjectItems = 0;
  let subjectLessons = 0;
  let subjectFlashcards = 0;
  let subjectValid = true;
  
  // Validate lessons
  const lessonsPath = join(subjectDir, `${subject === 'math' ? 'algebra' : 
                                      subject === 'physics' ? 'mechanics' :
                                      subject === 'chemistry' ? 'bonding' :
                                      subject === 'biology' ? 'genetics' :
                                      subject === 'swedish' ? 'writing' : 'writing'}.lessons.json`);
  
  if (existsSync(lessonsPath)) {
    try {
      const lessonsData = JSON.parse(readFileSync(lessonsPath, 'utf-8'));
      const lessons = z.array(LessonSchema).parse(lessonsData);
      subjectLessons = lessons.length;
      totalLessons += subjectLessons;
      console.log(`  ✅ Lektioner: ${subjectLessons}`);
    } catch (error) {
      console.log(`  ❌ Lektioner: ${error}`);
      subjectValid = false;
      allValid = false;
    }
  } else {
    console.log(`  ⚠️  Lektioner: Fil saknas`);
  }
  
  // Validate exercises
  const exercisesPath = join(subjectDir, `${subject === 'math' ? 'algebra' : 
                                         subject === 'physics' ? 'mechanics' :
                                         subject === 'chemistry' ? 'bonding' :
                                         subject === 'biology' ? 'genetics' :
                                         subject === 'swedish' ? 'writing' : 'writing'}.exercises.json`);
  
  if (existsSync(exercisesPath)) {
    try {
      const exercisesData = JSON.parse(readFileSync(exercisesPath, 'utf-8'));
      const exercises = z.array(ItemSchema).parse(exercisesData);
      
      // Validate subject-specific rules
      const validation = validateSubjectItems(exercises, subject);
      if (!validation.valid) {
        console.log(`  ❌ Övningar: ${validation.errors.join(', ')}`);
        subjectValid = false;
        allValid = false;
        errors.push(...validation.errors.map(e => `${subjectNames[subject]} övningar: ${e}`));
      } else {
        subjectItems += exercises.length;
        console.log(`  ✅ Övningar: ${exercises.length}`);
      }
    } catch (error) {
      console.log(`  ❌ Övningar: ${error}`);
      subjectValid = false;
      allValid = false;
    }
  } else {
    console.log(`  ⚠️  Övningar: Fil saknas`);
  }
  
  // Validate quiz
  const quizPath = join(subjectDir, `${subject === 'math' ? 'algebra' : 
                                    subject === 'physics' ? 'mechanics' :
                                    subject === 'chemistry' ? 'bonding' :
                                    subject === 'biology' ? 'genetics' :
                                    subject === 'swedish' ? 'writing' : 'writing'}.quiz.json`);
  
  if (existsSync(quizPath)) {
    try {
      const quizData = JSON.parse(readFileSync(quizPath, 'utf-8'));
      const quiz = z.array(ItemSchema).parse(quizData);
      
      // Validate subject-specific rules
      const validation = validateSubjectItems(quiz, subject);
      if (!validation.valid) {
        console.log(`  ❌ Quiz: ${validation.errors.join(', ')}`);
        subjectValid = false;
        allValid = false;
        errors.push(...validation.errors.map(e => `${subjectNames[subject]} quiz: ${e}`));
      } else {
        subjectItems += quiz.length;
        console.log(`  ✅ Quiz: ${quiz.length}`);
      }
    } catch (error) {
      console.log(`  ❌ Quiz: ${error}`);
      subjectValid = false;
      allValid = false;
    }
  } else {
    console.log(`  ⚠️  Quiz: Fil saknas`);
  }
  
  // Validate flashcards (only for biology and english)
  if (subject === 'biology' || subject === 'english') {
    const flashcardsPath = join(subjectDir, subject === 'biology' ? 'flashcards.json' : 'vocab.flashcards.json');
    
    if (existsSync(flashcardsPath)) {
      try {
        const flashcardsData = JSON.parse(readFileSync(flashcardsPath, 'utf-8'));
        const flashcards = z.array(FlashcardSchema).parse(flashcardsData);
        subjectFlashcards = flashcards.length;
        totalFlashcards += subjectFlashcards;
        console.log(`  ✅ Flashcards: ${subjectFlashcards}`);
      } catch (error) {
        console.log(`  ❌ Flashcards: ${error}`);
        subjectValid = false;
        allValid = false;
      }
    } else {
      console.log(`  ⚠️  Flashcards: Fil saknas`);
    }
  }
  
  totalItems += subjectItems;
  console.log(`  📊 Totalt: ${subjectItems} items`);
  console.log(`  ${subjectValid ? '✅' : '❌'} Status: ${subjectValid ? 'OK' : 'FEL'}\n`);
}

// Validate skill ID mapping
console.log('🔗 Validerar skill ID-mappning...');
const skillValidation = validateSkillIdMapping([], Array.from(validSkillIds));
if (!skillValidation.valid) {
  console.log(`❌ Skill ID-validering: ${skillValidation.errors.join(', ')}`);
  allValid = false;
  errors.push(...skillValidation.errors);
} else {
  console.log(`✅ Skill ID-validering: OK`);
}

// Summary
console.log('\n📊 SAMMANFATTNING:');
console.log(`📚 Ämnen: ${subjects.length}`);
console.log(`📖 Lektioner: ${totalLessons}`);
console.log(`🎯 Items: ${totalItems}`);
console.log(`🃏 Flashcards: ${totalFlashcards}`);
console.log(`🎯 Mål: 450 items (75 per ämne)`);

if (totalItems === 450) {
  console.log('✅ Antal items: MÅL UPPNÅTT');
} else {
  console.log(`⚠️  Antal items: ${totalItems}/450 (${Math.round(totalItems/450*100)}%)`);
}

if (allValid) {
  console.log('\n🎉 ALLA VALIDERINGAR PASSERADE!');
  process.exit(0);
} else {
  console.log('\n❌ VALIDERING MISSLYCKADES:');
  errors.forEach(error => console.log(`  • ${error}`));
  process.exit(1);
}
