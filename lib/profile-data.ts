import { createClient } from '@/lib/supabase/client'

export interface ProfileData {
  name: string
  level: number
  totalXP: number
  studyStreak: number
  completedLessonsCount: number
}

export async function getProfileData(accountId: string): Promise<ProfileData | null> {
  try {
    const supabase = createClient()

    const { data: account, error } = await supabase
      .from('accounts')
      .select('name, level, total_xp, study_streak, completed_lessons_count')
      .eq('id', accountId)
      .is('deleted_at', null)
      .single()

    if (error || !account) {
      console.error('Error fetching profile data:', error)
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
    console.error('Error in getProfileData:', error)
    return null
  }
}

export async function getBadgesData(accountId: string): Promise<any[]> {
  try {
    const supabase = createClient()

    const { data: badges, error } = await supabase
      .from('badges')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_earned', true)

    if (error) {
      console.error('Error fetching badges:', error)
      return []
    }

    return badges || []
  } catch (error) {
    console.error('Error in getBadgesData:', error)
    return []
  }
}

export async function getWeakAreasData(accountId: string): Promise<any[]> {
  try {
    const supabase = createClient()

    // Get user progress data to identify weak areas
    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('skill_id, mastery_level')
      .eq('account_id', accountId)

    if (error || !progress) {
      console.error('Error fetching progress:', error)
      return []
    }

    // Identify weak areas (mastery < 0.5)
    const weakAreas = progress
      .filter(p => (p.mastery_level || 0) < 0.5)
      .slice(0, 5)
      .map(p => ({
        skillId: p.skill_id,
        mastery: p.mastery_level || 0,
        name: p.skill_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))

    return weakAreas
  } catch (error) {
    console.error('Error in getWeakAreasData:', error)
    return []
  }
}
