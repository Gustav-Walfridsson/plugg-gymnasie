'use client'

import { supabase } from './supabase-client'
import type { Subject, Topic, Skill } from '../types/domain'

/**
 * Supabase Data Service - Real database operations
 * Replaces mock data with actual Supabase queries
 */

export async function getSubjects(): Promise<Subject[]> {
  try {
    console.log('🔄 Fetching subjects from Supabase...')
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

    // Get user email for the name field
    const { data: userData, error: userError } = await supabase.auth.getUser()
    const userName = userData?.user?.email || `User-${userId.slice(0, 8)}`

    const { data, error } = await supabase
      .from('accounts')
      .upsert({
        user_id: userId,
        name: userName,
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

/**
 * Save mastery state to the modern mastery_states table
 * @deprecated This function is deprecated. Use saveMasteryState instead.
 */
export async function saveUserProgress(userId: string, skillId: string, mastery: number, correctAnswers?: number, totalAttempts?: number): Promise<boolean> {
  console.warn('⚠️ saveUserProgress is deprecated. Use saveMasteryState instead.')
  
  // For backward compatibility, try to save to mastery_states table
  try {
    console.log('🔄 Saving mastery state (deprecated function):', { userId, skillId, mastery, correctAnswers, totalAttempts })
    
    // First get the account_id from user_id
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (accountError || !account) {
      console.error('❌ Account not found for user:', userId)
      return false
    }

    const { error } = await supabase
      .from('mastery_states')
      .upsert({
        account_id: account.id,
        skill_id: skillId,
        probability: mastery, // Convert mastery_level to probability
        attempts: totalAttempts || 0,
        correct_attempts: correctAnswers || 0,
        last_attempt: new Date().toISOString(),
        last_mastery_update: new Date().toISOString()
      }, {
        onConflict: 'account_id,skill_id'
      })

    if (error) {
      console.error('❌ Error saving mastery state:', error)
      return false
    }

    console.log('✅ Successfully saved mastery state')
    return true
  } catch (error) {
    console.error('❌ Exception saving mastery state:', error)
    return false
  }
}

/**
 * Save mastery state to the modern mastery_states table
 * @param accountId - The account ID
 * @param skillId - The skill ID
 * @param probability - Mastery probability (0.0-1.0)
 * @param attempts - Total attempts
 * @param correctAttempts - Correct attempts
 */
export async function saveMasteryState(
  accountId: string,
  skillId: string,
  probability: number,
  attempts: number,
  correctAttempts: number
): Promise<boolean> {
  try {
    console.log('🔄 Saving mastery state:', { accountId, skillId, probability, attempts, correctAttempts })

    const { error } = await supabase
      .from('mastery_states')
      .upsert({
        account_id: accountId,
        skill_id: skillId,
        probability: probability,
        attempts: attempts,
        correct_attempts: correctAttempts,
        last_attempt: new Date().toISOString(),
        last_mastery_update: new Date().toISOString()
      }, {
        onConflict: 'account_id,skill_id'
      })

    if (error) {
      console.error('❌ Error saving mastery state:', error)
      return false
    }

    console.log('✅ Successfully saved mastery state')
    return true
  } catch (error) {
    console.error('❌ Exception saving mastery state:', error)
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
