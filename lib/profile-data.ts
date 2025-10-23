import { createClient } from '@/lib/supabase/server'

export interface ProfileData {
  name: string
  level: number
  totalXP: number
  studyStreak: number
  completedLessonsCount: number
}

export async function getProfileData(userId: string): Promise<ProfileData | null> {
  try {
    const supabase = await createClient()
    
    const { data: account, error } = await supabase
      .from('accounts')
      .select('name, level, total_xp, study_streak, completed_lessons_count')
      .eq('user_id', userId)
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
