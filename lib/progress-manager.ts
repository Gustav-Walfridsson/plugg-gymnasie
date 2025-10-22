'use client'

import { saveUserProgress, getUserProgress, updateUserAccount } from './supabase-data'
import { store } from './store'

export interface UserProgress {
  skillId: string
  mastery: number
  lastUpdated: string
  correctAnswers: number
  totalAttempts: number
}

export class ProgressManager {
  private static instance: ProgressManager
  private progress: Map<string, UserProgress> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager()
    }
    return ProgressManager.instance
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('plugg-bot-progress')
        if (stored) {
          const data = JSON.parse(stored)
          this.progress = new Map(data)
          console.log('📊 Loaded progress from localStorage:', this.progress.size, 'skills')
        }
      }
    } catch (error) {
      console.error('❌ Error loading progress from localStorage:', error)
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        const data = Array.from(this.progress.entries())
        localStorage.setItem('plugg-bot-progress', JSON.stringify(data))
        console.log('💾 Saved progress to localStorage')
      }
    } catch (error) {
      console.error('❌ Error saving progress to localStorage:', error)
    }
  }

  async updateProgress(userId: string, skillId: string, isCorrect: boolean): Promise<void> {
    try {
      // Get current progress
      const current = this.progress.get(skillId) || {
        skillId,
        mastery: 0,
        lastUpdated: new Date().toISOString(),
        correctAnswers: 0,
        totalAttempts: 0
      }

      // Update progress
      current.totalAttempts += 1
      if (isCorrect) {
        current.correctAnswers += 1
        // Increase mastery by 0.1 for each correct answer, max 1.0
        current.mastery = Math.min(current.mastery + 0.1, 1.0)
      }
      current.lastUpdated = new Date().toISOString()

      // Save to local storage
      this.progress.set(skillId, current)
      this.saveToStorage()

      // Update store
      store.updateMastery(skillId, current.mastery)

      // Try to save to Supabase (but don't fail if it doesn't work)
      try {
        const success = await saveUserProgress(
          userId, 
          skillId, 
          current.mastery, 
          current.correctAnswers, 
          current.totalAttempts
        )
        if (success) {
          console.log('✅ Progress saved to both localStorage and Supabase')
          
          // Also update account stats
          await this.updateAccountStats(userId)
        } else {
          console.log('⚠️ Progress saved to localStorage only (Supabase failed)')
        }
      } catch (error) {
        console.log('⚠️ Progress saved to localStorage only (Supabase exception):', error)
      }

      console.log('📈 Progress updated:', {
        skillId,
        mastery: current.mastery,
        correctAnswers: current.correctAnswers,
        totalAttempts: current.totalAttempts
      })
    } catch (error) {
      console.error('❌ Error updating progress:', error)
    }
  }

  getProgress(skillId: string): UserProgress | null {
    return this.progress.get(skillId) || null
  }

  getAllProgress(): UserProgress[] {
    return Array.from(this.progress.values())
  }

  getMasteryLevel(skillId: string): number {
    const progress = this.progress.get(skillId)
    return progress ? progress.mastery : 0
  }

  getCorrectAnswers(skillId: string): number {
    const progress = this.progress.get(skillId)
    return progress ? progress.correctAnswers : 0
  }

  getTotalAttempts(skillId: string): number {
    const progress = this.progress.get(skillId)
    return progress ? progress.totalAttempts : 0
  }

  getAccuracy(skillId: string): number {
    const progress = this.progress.get(skillId)
    if (!progress || progress.totalAttempts === 0) return 0
    return (progress.correctAnswers / progress.totalAttempts) * 100
  }

  public async updateAccountStats(userId: string): Promise<void> {
    if (!this.userId || this.userId !== userId) {
      console.warn('⚠️ Cannot update account stats: User not initialized in ProgressManager.')
      return
    }

    try {
      const allProgress = this.getAllProgress()
      
      // Calculate account statistics
      const totalCorrectAnswers = allProgress.reduce((sum, p) => sum + (p.correctAnswers || 0), 0)
      const totalAttempts = allProgress.reduce((sum, p) => sum + (p.totalAttempts || 0), 0)
      const totalXP = totalCorrectAnswers * 10 + totalAttempts * 5
      const level = Math.floor(Math.sqrt(totalXP / 100)) + 1
      
      // Calculate study streak (simplified - based on recent activity)
      const recentActivity = allProgress.filter(p => {
        const lastUpdated = new Date(p.lastUpdated)
        const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceUpdate <= 7
      })
      const studyStreak = Math.min(recentActivity.length, 7)

      // Update accounts table
      const success = await updateUserAccount(userId, level, totalXP, studyStreak)
      if (success) {
        console.log('✅ Account stats updated in Supabase:', { level, totalXP, studyStreak })
      } else {
        console.log('⚠️ Failed to update account stats in Supabase')
      }
    } catch (error) {
      console.error('❌ Error updating account stats:', error)
    }
  }

  clearProgress(): void {
    this.progress.clear()
    this.saveToStorage()
    console.log('🗑️ Progress cleared')
  }
}

export const progressManager = ProgressManager.getInstance()
