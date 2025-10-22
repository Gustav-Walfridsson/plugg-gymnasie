#!/usr/bin/env tsx
/**
 * Import Practice Content Script
 * 
 * This script imports all practice content from JSON files in the data/ directory
 * into the Supabase database tables (subjects, topics, skills, lessons, items).
 * 
 * Usage: npx tsx scripts/import-practice-content.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Types matching the database schema
interface Subject {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

interface Topic {
  id: string
  name: string
  description: string
}

interface Skill {
  id: string
  name: string
  description: string
  difficulty: 'enkel' | 'medel' | 'svår'
  prerequisites: string[]
}

interface Lesson {
  id: string
  skillId: string
  title: string
  content: string
  order: number
}

interface Item {
  id: string
  skillId: string
  type: 'numeric' | 'multiple_choice' | 'text' | 'flashcard'
  prompt: string
  latex?: string
  answer: any
  explanation: string
  difficulty: number
  tags: string[]
}

interface SkillsData {
  subjects: Array<{
    id: string
    name: string
    description: string
    color: string
    icon: string
    topics: Array<{
      id: string
      name: string
      description: string
      skills: Array<{
        id: string
        name: string
        description: string
        difficulty: 'enkel' | 'medel' | 'svår'
        prerequisites: string[]
      }>
    }>
  }>
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importContent() {
  console.log('🚀 Starting practice content import...')
  
  try {
    // 1. Import subjects and topics from skills.json
    console.log('📚 Importing subjects and topics...')
    const skillsDataPath = path.join(process.cwd(), 'data', 'skills.json')
    const skillsData: SkillsData = JSON.parse(fs.readFileSync(skillsDataPath, 'utf8'))
    
    // Import subjects
    const subjects: Subject[] = skillsData.subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      color: subject.color,
      icon: subject.icon
    }))
    
    const { error: subjectsError } = await supabase
      .from('subjects')
      .upsert(subjects, { onConflict: 'id' })
    
    if (subjectsError) {
      console.error('❌ Error importing subjects:', subjectsError)
      return
    }
    
    console.log(`✅ Imported ${subjects.length} subjects`)
    
    // Import topics
    const topics = skillsData.subjects.flatMap(subject =>
      subject.topics.map(topic => ({
        id: topic.id,
        subject_id: subject.id,
        name: topic.name,
        description: topic.description,
        display_order: 1 // Default order
      }))
    )
    
    const { error: topicsError } = await supabase
      .from('topics')
      .upsert(topics, { onConflict: 'id' })
    
    if (topicsError) {
      console.error('❌ Error importing topics:', topicsError)
      return
    }
    
    console.log(`✅ Imported ${topics.length} topics`)
    
    // Import skills
    const skills = skillsData.subjects.flatMap(subject =>
      subject.topics.flatMap(topic =>
        topic.skills.map(skill => ({
          id: skill.id,
          topic_id: topic.id,
          subject_id: subject.id,
          name: skill.name,
          description: skill.description,
          difficulty: skill.difficulty,
          prerequisites: skill.prerequisites,
          display_order: 1 // Default order
        }))
      )
    )
    
    const { error: skillsError } = await supabase
      .from('skills')
      .upsert(skills, { onConflict: 'id' })
    
    if (skillsError) {
      console.error('❌ Error importing skills:', skillsError)
      return
    }
    
    console.log(`✅ Imported ${skills.length} skills`)
    
    // 2. Import lessons from all lesson files
    console.log('📖 Importing lessons...')
    const dataDir = path.join(process.cwd(), 'data')
    const subjectDirs = fs.readdirSync(dataDir).filter(dir => 
      fs.statSync(path.join(dataDir, dir)).isDirectory() && dir !== 'README.md'
    )
    
    let totalLessons = 0
    
    for (const subjectDir of subjectDirs) {
      const subjectPath = path.join(dataDir, subjectDir)
      const files = fs.readdirSync(subjectPath)
      const lessonFiles = files.filter(file => file.endsWith('.lessons.json'))
      
      for (const lessonFile of lessonFiles) {
        const lessonPath = path.join(subjectPath, lessonFile)
        const lessons: Lesson[] = JSON.parse(fs.readFileSync(lessonPath, 'utf8'))
        
        const { error: lessonsError } = await supabase
          .from('lessons')
          .upsert(lessons.map(lesson => ({
            id: lesson.id,
            skill_id: lesson.skillId,
            title: lesson.title,
            content: lesson.content,
            order: lesson.order
          })), { onConflict: 'id' })
        
        if (lessonsError) {
          console.error(`❌ Error importing lessons from ${lessonFile}:`, lessonsError)
          continue
        }
        
        totalLessons += lessons.length
        console.log(`  ✅ Imported ${lessons.length} lessons from ${lessonFile}`)
      }
    }
    
    console.log(`✅ Total lessons imported: ${totalLessons}`)
    
    // 3. Import items from all exercise files
    console.log('🎯 Importing practice items...')
    let totalItems = 0
    
    for (const subjectDir of subjectDirs) {
      const subjectPath = path.join(dataDir, subjectDir)
      const files = fs.readdirSync(subjectPath)
      const exerciseFiles = files.filter(file => file.endsWith('.exercises.json'))
      const quizFiles = files.filter(file => file.endsWith('.quiz.json'))
      const flashcardFiles = files.filter(file => file.endsWith('.flashcards.json'))
      
      const allItemFiles = [...exerciseFiles, ...quizFiles, ...flashcardFiles]
      
      for (const itemFile of allItemFiles) {
        const itemPath = path.join(subjectPath, itemFile)
        const items: Item[] = JSON.parse(fs.readFileSync(itemPath, 'utf8'))
        
        const { error: itemsError } = await supabase
          .from('items')
          .upsert(items.map(item => ({
            id: item.id,
            skill_id: item.skillId,
            type: item.type,
            prompt: item.prompt,
            latex: item.latex || null,
            answer: item.answer,
            explanation: item.explanation,
            difficulty: item.difficulty,
            tags: item.tags,
            display_order: 1 // Default order
          })), { onConflict: 'id' })
        
        if (itemsError) {
          console.error(`❌ Error importing items from ${itemFile}:`, itemsError)
          continue
        }
        
        totalItems += items.length
        console.log(`  ✅ Imported ${items.length} items from ${itemFile}`)
      }
    }
    
    console.log(`✅ Total items imported: ${totalItems}`)
    
    // 4. Verification
    console.log('🔍 Verifying import...')
    const { data: subjectCount } = await supabase.from('subjects').select('id', { count: 'exact' })
    const { data: topicCount } = await supabase.from('topics').select('id', { count: 'exact' })
    const { data: skillCount } = await supabase.from('skills').select('id', { count: 'exact' })
    const { data: lessonCount } = await supabase.from('lessons').select('id', { count: 'exact' })
    const { data: itemCount } = await supabase.from('items').select('id', { count: 'exact' })
    
    console.log('📊 Import Summary:')
    console.log(`  Subjects: ${subjectCount?.length || 0}`)
    console.log(`  Topics: ${topicCount?.length || 0}`)
    console.log(`  Skills: ${skillCount?.length || 0}`)
    console.log(`  Lessons: ${lessonCount?.length || 0}`)
    console.log(`  Items: ${itemCount?.length || 0}`)
    
    console.log('🎉 Practice content import completed successfully!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importContent()
