'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-simple'
import { progressManager } from '../../lib/progress-manager'

export default function TestProgressPage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const allProgress = progressManager.getAllProgress()
      setProgress(allProgress)
    }
  }, [user])

  const addTestProgress = async () => {
    if (!user) {
      console.log('❌ No user logged in')
      return
    }
    
    setLoading(true)
    try {
      console.log('🔄 Adding test progress for user:', user.id)
      
      // Add some test progress
      console.log('Adding test-skill-1 (correct)')
      await progressManager.updateProgress(user.id, 'test-skill-1', true)
      
      console.log('Adding test-skill-1 (correct again)')
      await progressManager.updateProgress(user.id, 'test-skill-1', true)
      
      console.log('Adding test-skill-1 (incorrect)')
      await progressManager.updateProgress(user.id, 'test-skill-1', false)
      
      console.log('Adding test-skill-2 (correct)')
      await progressManager.updateProgress(user.id, 'test-skill-2', true)
      
      // Refresh progress
      const allProgress = progressManager.getAllProgress()
      setProgress(allProgress)
      
      console.log('✅ Test progress added. Total progress items:', allProgress.length)
    } catch (error) {
      console.error('❌ Error adding test progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearProgress = () => {
    progressManager.clearProgress()
    setProgress([])
    console.log('🗑️ Progress cleared')
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Progress Test Page</h1>
      
      <div className="mb-6">
        <p className="text-muted-foreground mb-4">
          User: {user ? user.email : 'Not logged in'}
        </p>
        
        <div className="flex space-x-4">
          <button
            onClick={addTestProgress}
            disabled={loading || !user}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Test Progress'}
          </button>
          
          <button
            onClick={clearProgress}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Clear Progress
          </button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Current Progress</h2>
        
        {progress.length === 0 ? (
          <p className="text-muted-foreground">No progress data found</p>
        ) : (
          <div className="space-y-4">
            {progress.map((p, index) => (
              <div key={index} className="border p-4 rounded">
                <h3 className="font-semibold">Skill: {p.skillId}</h3>
                <p>Mastery: {Math.round((p.mastery || 0) * 100)}%</p>
                <p>Correct Answers: {p.correctAnswers || 0}</p>
                <p>Total Attempts: {p.totalAttempts || 0}</p>
                <p>Accuracy: {Math.round(((p.correctAnswers || 0) / (p.totalAttempts || 1)) * 100)}%</p>
                <p>Last Updated: {new Date(p.lastUpdated).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
