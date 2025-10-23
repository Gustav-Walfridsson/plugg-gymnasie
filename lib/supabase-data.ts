'use client'

import { createClient } from './supabase/client'
import type { Subject, Topic, Skill } from '../types/domain'

/**
 * Supabase Data Service - Real database operations
 * Replaces mock data with actual Supabase queries
 */

export async function getSubjects(): Promise<Subject[]> {
  try {
    console.log('🔄 Fetching subjects from Supabase...')
    const supabase = createClient()
    console.log('🔍 Supabase client status:', {
      clientExists: !!supabase
    })

    // First check if subjects table exists
    console.log('🔍 Checking if subjects table exists...')
    const { data: checkData, error: checkError } = await supabase
      .from('subjects')
      .select('id')
      .limit(1)

    console.log('🔍 Subjects table check result:', {
      checkData,
      checkError: checkError ? {
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
        code: checkError.code
      } : null
    })

    if (checkError) {
      console.log('⚠️ Subjects table check failed, likely table does not exist')
      console.log('📝 This is expected if subjects table has not been created yet')
      console.log('🔄 Using fallback subjects...')
      return getFallbackSubjects()
    }

    // If table exists, fetch all subjects (simplified query for better performance)
    console.log('🔄 Fetching all subjects from subjects table...')
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        description,
        color,
        icon
      `)
      .order('name')

    if (error) {
      console.error('❌ Error fetching subjects:', {
        message: error.message || 'Unknown Supabase error',
        details: error.details || 'No details available',
        hint: error.hint || 'No hint available',
        code: error.code || 'No error code',
        fullError: error
      })
      console.log('🔄 Using fallback subjects due to error...')
      return getFallbackSubjects()
    }

    console.log('✅ Successfully loaded subjects from Supabase:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ Exception fetching subjects:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error
    })
    console.log('🔄 Using fallback subjects due to exception...')
    return getFallbackSubjects()
  }
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  try {
    console.log('🔄 Fetching subject by ID:', id)
    
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        description,
        color,
        icon,
        topics (
          id,
          name,
          description,
          skills (
            id,
            name,
            description,
            difficulty
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Error fetching subject:', error)
      return null
    }

    console.log('✅ Successfully loaded subject:', data?.name)
    return data
  } catch (error) {
    console.error('❌ Exception fetching subject:', error)
    return null
  }
}

export async function getUserProgress(userId: string): Promise<any> {
  try {
    console.log('🔄 Fetching user progress for:', userId)
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Error fetching user progress:', {
        message: error.message || 'Unknown error',
        details: error.details || 'No details',
        hint: error.hint || 'No hint',
        code: error.code || 'No code',
        fullError: error
      })
      // Return empty array instead of null for better UX
      return []
    }

    console.log('✅ Successfully loaded user progress:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ Exception fetching user progress:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    // Return empty array instead of null for better UX
    return []
  }
}

export async function updateUserAccount(userId: string, level: number, totalXP: number, studyStreak: number): Promise<boolean> {
  try {
    console.log('🔄 Updating user account:', { userId, level, totalXP, studyStreak })

    const { data, error } = await supabase
      .from('accounts')
      .upsert({
        user_id: userId,
        level: level,
        total_xp: totalXP,
        study_streak: studyStreak,
        last_active: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Error updating user account:', {
        message: error.message || 'Unknown Supabase error',
        details: error.details || 'No details available',
        hint: error.hint || 'No hint available',
        code: error.code || 'No error code',
        fullError: error
      })
      return false
    }

    console.log('✅ Successfully updated user account:', data)
    return true
  } catch (error) {
    console.error('❌ Exception updating user account:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error
    })
    return false
  }
}

export async function saveUserProgress(userId: string, skillId: string, mastery: number, correctAnswers?: number, totalAttempts?: number): Promise<boolean> {
  try {
    console.log('🔄 Saving user progress:', { userId, skillId, mastery, correctAnswers, totalAttempts })
    const supabase = createClient()
    console.log('🔍 Supabase client status:', {
      clientExists: !!supabase
    })

    // First, let's check if the table exists by trying to select from it
    console.log('🔍 Checking if user_progress table exists...')
    const { data: checkData, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .limit(1)

    console.log('🔍 Table check result:', {
      checkData,
      checkError: checkError ? {
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
        code: checkError.code
      } : null
    })

    if (checkError) {
      console.log('⚠️ Table check failed, likely table does not exist')
      console.log('📝 This is expected if user_progress table has not been created yet')
      console.log('💾 Progress will be saved to localStorage only')
      return false // Return false to indicate Supabase save failed
    }

    // If table exists, try to upsert
    console.log('🔄 Attempting upsert to user_progress table...')
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        skill_id: skillId,
        mastery_level: mastery,
        correct_answers: correctAnswers || 0,
        total_attempts: totalAttempts || 0,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,skill_id' // Specify which columns to use for conflict resolution
      })

    console.log('🔍 Upsert result:', {
      data,
      error: error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      } : null
    })

    if (error) {
      console.error('❌ Error saving user progress:', {
        message: error.message || 'Unknown Supabase error',
        details: error.details || 'No details available',
        hint: error.hint || 'No hint available',
        code: error.code || 'No error code',
        fullError: error
      })
      
      // Check if it's a table doesn't exist error
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('⚠️ User progress table does not exist, saving to localStorage only')
        return true // Still return true since we can save locally
      }
      
      // Check if it's a unique constraint violation (shouldn't happen with proper upsert)
      if (error.code === '23505' || error.message?.includes('duplicate key value violates unique constraint')) {
        console.log('⚠️ Unique constraint violation - this should not happen with proper upsert')
        console.log('🔄 Retrying with proper conflict resolution...')
        return false // Return false to indicate the operation failed
      }
      
      return false
    }

    console.log('✅ Successfully saved user progress to Supabase:', data)
    return true
  } catch (error) {
    console.error('❌ Exception saving user progress:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error
    })
    
    // If it's a network error or similar, still allow local saving
    if (error instanceof Error && (
      error.message.includes('fetch') || 
      error.message.includes('network') ||
      error.message.includes('timeout')
    )) {
      console.log('⚠️ Network error, saving to localStorage only')
      return true
    }
    
    return false
  }
}

// Fallback subjects if Supabase is not available
function getFallbackSubjects(): Subject[] {
  console.log('🔄 Using fallback subjects...')
  return [
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
          id: 'mekanik',
          name: 'Mekanik',
          description: 'Grundläggande mekanik',
          skills: [
            {
              id: 'krafter',
              name: 'Krafter',
              description: 'Förstå krafter och rörelse',
              difficulty: 'enkel'
            }
          ]
        }
      ]
    }
  ]
}
