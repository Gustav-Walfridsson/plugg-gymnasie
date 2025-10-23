import { supabase } from './supabase-client'
import { handleError, createErrorContext } from './error-handler'

export interface ProfileData {
  name: string
  level: number
  totalXP: number
  studyStreak: number
  completedLessonsCount: number
}

export async function getProfileData(accountId: string): Promise<ProfileData | null> {
  try {
    const { data: account, error } = await supabase
      .from('accounts')
      .select('name, level, total_xp, study_streak, completed_lessons_count')
      .eq('id', accountId)
      .is('deleted_at', null)
      .single()

    if (error || !account) {
      const context = createErrorContext('ProfileData', 'getProfileData', { accountId })
      handleError(error || new Error('No account data'), context)
      return null
    }

    return {
      name: account.name,
      level: account.level || 1,
      totalXP: account.total_xp || 0,
      studyStreak: account.study_streak || 0,
      completedLessonsCount: account.completed_lessons_count || 0
    }
  } catch (error) {
    const context = createErrorContext('ProfileData', 'getProfileData', { accountId })
    handleError(error, context)
    return null
  }
}

export async function getBadgesData(accountId: string): Promise<any[]> {
  try {
    const { data: badges, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('account_id', accountId)

    if (error) {
      const context = createErrorContext('ProfileData', 'getBadgesData', { accountId })
      handleError(error, context)
      return []
    }

    return badges || []
  } catch (error) {
    const context = createErrorContext('ProfileData', 'getBadgesData', { accountId })
    handleError(error, context)
    return []
  }
}

/**
 * Get weak areas data based on mastery probability
 * @param accountId - The account ID to fetch weak areas for
 * @returns Array of weak areas based on probability (0.0-1.0 scale)
 */
export async function getWeakAreasData(accountId: string): Promise<any[]> {
  try {
    // Get user progress data to identify weak areas
    const { data: progress, error } = await supabase
      .from('mastery_states')
      .select('skill_id, probability')
      .eq('account_id', accountId)
      .is('deleted_at', null)

    if (error || !progress) {
      const context = createErrorContext('ProfileData', 'getWeakAreasData', { accountId })
      handleError(error || new Error('No progress data'), context)
      return []
    }

    // Identify weak areas (probability < 0.5)
    const weakAreas = progress
      .filter(p => (p.probability || 0) < 0.5)
      .slice(0, 5)
      .map(p => ({
        skillId: p.skill_id,
        mastery: p.probability || 0,
        name: p.skill_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))

    return weakAreas
  } catch (error) {
    const context = createErrorContext('ProfileData', 'getWeakAreasData', { accountId })
    handleError(error, context)
    return [] // Fail gracefully, don't crash page
  }
}
