'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, BookOpen } from 'lucide-react'
import { analyticsEngine } from '../../lib/analytics'
import type { AnalyticsEvent } from '../../types/domain'

interface RecentAttemptsProps {
  skillId: string
  userId: string
}

export function RecentAttempts({ skillId, userId }: RecentAttemptsProps) {
  const [recentAttempts, setRecentAttempts] = useState<AnalyticsEvent[]>([])

  useEffect(() => {
    const analytics = analyticsEngine.getUserAnalytics(userId)
    const attempts = analytics.recentActivity.filter(event => 
      event.type === 'item_answered' && 
      event.data.skillId === skillId
    )
    setRecentAttempts(attempts.slice(0, 5)) // Show last 5 attempts
  }, [skillId, userId])

  if (recentAttempts.length === 0) {
    return null
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold mb-3 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Senaste försök
      </h3>
      <div className="space-y-2">
        {recentAttempts.map((attempt, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {attempt.data.isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-muted-foreground">
                {attempt.timestamp.toLocaleTimeString('sv-SE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="text-muted-foreground">
              {attempt.data.timeSpent}s
            </div>
          </div>
        ))}
      </div>
      
      {recentAttempts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button className="text-sm text-primary hover:underline flex items-center">
            <BookOpen className="w-3 h-3 mr-1" />
            Läs mikro-lektion för förbättring
          </button>
        </div>
      )}
    </div>
  )
}
