/**
 * Storage Utility - Safe localStorage operations for Plugg Bot 1
 * Handles serialization, error recovery, and data validation
 */

export class StorageManager {
  private static instance: StorageManager
  private readonly prefix = 'plugg-bot-'

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  /**
   * Set data in localStorage with error handling
   */
  setItem(key: string, value: any): boolean {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(this.prefix + key, serializedValue)
      return true
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error)
      return false
    }
  }

  /**
   * Get data from localStorage with error handling
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (item === null) {
        return defaultValue || null
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error)
      return defaultValue || null
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error)
      return false
    }
  }

  /**
   * Clear all Plugg Bot data
   */
  clearAll(): boolean {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__plugg_bot_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): {
    available: boolean
    used: number
    total: number
    percentage: number
  } {
    const available = this.isAvailable()
    
    if (!available) {
      return { available: false, used: 0, total: 0, percentage: 0 }
    }

    try {
      let used = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
          used += localStorage[key].length
        }
      }

      // Estimate total storage (most browsers give ~5-10MB)
      const total = 5 * 1024 * 1024 // 5MB estimate
      const percentage = (used / total) * 100

      return { available, used, total, percentage }
    } catch (error) {
      return { available: true, used: 0, total: 0, percentage: 0 }
    }
  }

  /**
   * Export all data for backup
   */
  exportData(): string {
    try {
      const data: Record<string, any> = {}
      const keys = Object.keys(localStorage)
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '')
          data[cleanKey] = JSON.parse(localStorage[key])
        }
      })
      
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      return '{}'
    }
  }

  /**
   * Import data from backup
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      Object.keys(data).forEach(key => {
        this.setItem(key, data[key])
      })
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance()

/**
 * User Profile Management
 */
export class UserProfileManager {
  private storage = storageManager

  /**
   * Get current user profile
   */
  getProfile(): {
    id: string
    name: string
    level: number
    totalXP: number
    badges: any[]
    preferences: {
      darkMode: boolean
      notifications: boolean
      language: 'sv'
    }
    studyStreak: number
    lastActive: Date
  } {
    const defaultProfile = {
      id: 'default-user',
      name: 'Student',
      level: 1,
      totalXP: 0,
      badges: [],
      preferences: {
        darkMode: true,
        notifications: true,
        language: 'sv' as const
      },
      studyStreak: 0,
      lastActive: new Date()
    }

    return this.storage.getItem('user-profile', defaultProfile) || defaultProfile
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<ReturnType<UserProfileManager['getProfile']>>): boolean {
    const currentProfile = this.getProfile()
    const updatedProfile = { ...currentProfile, ...updates }
    updatedProfile.lastActive = new Date()
    
    return this.storage.setItem('user-profile', updatedProfile)
  }

  /**
   * Add XP to user
   */
  addXP(amount: number): boolean {
    const profile = this.getProfile()
    const newXP = profile.totalXP + amount
    const newLevel = Math.floor(newXP / 1000) + 1 // Level up every 1000 XP
    
    return this.updateProfile({
      totalXP: newXP,
      level: newLevel
    })
  }

  /**
   * Add badge to user
   */
  addBadge(badge: {
    id: string
    name: string
    description: string
    icon: string
    earnedAt: Date
    subjectId?: string
  }): boolean {
    const profile = this.getProfile()
    const badges = [...profile.badges, badge]
    
    return this.updateProfile({ badges })
  }
}

// Export singleton instance
export const userProfileManager = new UserProfileManager()

/**
 * Progress Tracking for Lessons and Skills
 */
export class ProgressManager {
  private storage = storageManager

  /**
   * Mark a lesson as completed
   */
  markLessonCompleted(lessonId: string): boolean {
    const completedLessons = this.getCompletedLessons()
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId)
      return this.storage.setItem('completed-lessons', completedLessons)
    }
    return true
  }

  /**
   * Mark a lesson as not completed
   */
  markLessonIncomplete(lessonId: string): boolean {
    const completedLessons = this.getCompletedLessons()
    const filtered = completedLessons.filter(id => id !== lessonId)
    return this.storage.setItem('completed-lessons', filtered)
  }

  /**
   * Get all completed lesson IDs
   */
  getCompletedLessons(): string[] {
    return this.storage.getItem('completed-lessons', []) || []
  }

  /**
   * Check if a lesson is completed
   */
  isLessonCompleted(lessonId: string): boolean {
    return this.getCompletedLessons().includes(lessonId)
  }

  /**
   * Get completion count for a list of lessons
   */
  getLessonCompletionCount(lessonIds: string[]): number {
    const completedLessons = this.getCompletedLessons()
    return lessonIds.filter(id => completedLessons.includes(id)).length
  }

  /**
   * Mark a skill as completed
   */
  markSkillCompleted(skillId: string): boolean {
    const completedSkills = this.getCompletedSkills()
    if (!completedSkills.includes(skillId)) {
      completedSkills.push(skillId)
      return this.storage.setItem('completed-skills', completedSkills)
    }
    return true
  }

  /**
   * Get all completed skill IDs
   */
  getCompletedSkills(): string[] {
    return this.storage.getItem('completed-skills', []) || []
  }

  /**
   * Check if a skill is completed
   */
  isSkillCompleted(skillId: string): boolean {
    return this.getCompletedSkills().includes(skillId)
  }
}

// Export singleton instance
export const progressManager = new ProgressManager()