'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, BarChart3, Clock, Target, TrendingUp, Activity, Download, Trash2 } from 'lucide-react'
import { useAuth } from '../../lib/auth-simple'
import { progressManager } from '../../lib/progress-manager'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState({
    totalSessions: 0,
    totalTime: 0,
    totalItems: 0,
    correctAnswers: 0,
    skillsMastered: 0,
    accuracy: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        
        if (user) {
          // Load real data from ProgressManager
          const allProgress = progressManager.getAllProgress()
          
          // Calculate real analytics
          const totalSessions = allProgress.length
          const totalTime = allProgress.reduce((sum, p) => sum + (p.totalAttempts || 0) * 30, 0) // Estimate 30s per attempt
          const totalItems = allProgress.reduce((sum, p) => sum + (p.totalAttempts || 0), 0)
          const correctAnswers = allProgress.reduce((sum, p) => sum + (p.correctAnswers || 0), 0)
          const skillsMastered = allProgress.filter(p => (p.mastery || 0) >= 0.8).length
          const accuracy = totalItems > 0 ? (correctAnswers / totalItems) * 100 : 0
          
          // Get recent activity from progress
          const recentActivity = allProgress
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
            .slice(0, 5)
            .map(progress => ({
              type: 'start_session',
              timestamp: new Date(progress.lastUpdated),
              data: { skillId: progress.skillId || 'unknown' }
            }))
          
          setAnalyticsData({
            totalSessions,
            totalTime,
            totalItems,
            correctAnswers,
            skillsMastered,
            accuracy,
            recentActivity
          })
        } else {
          // No user logged in
          setAnalyticsData({
            totalSessions: 0,
            totalTime: 0,
            totalItems: 0,
            correctAnswers: 0,
            skillsMastered: 0,
            accuracy: 0,
            recentActivity: []
          })
        }
      } catch (error) {
        console.error('❌ Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAnalytics()
  }, [user])

  const storageInfo = {
    available: true,
    used: 2048,
    percentage: 12.5
  }

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'start_session': return <Activity className="w-4 h-4" />
      case 'start_practice': return <Target className="w-4 h-4" />
      case 'item_answered': return <TrendingUp className="w-4 h-4" />
      case 'skill_mastered': return <Target className="w-4 h-4" />
      case 'review_due': return <Clock className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'start_session': return 'text-blue-500'
      case 'start_practice': return 'text-green-500'
      case 'item_answered': return 'text-purple-500'
      case 'skill_mastered': return 'text-yellow-500'
      case 'review_due': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="btn-outline text-sm">
            <Download className="w-4 h-4 mr-2" />
            Exportera data
          </button>
          <button className="btn-outline text-sm text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Rensa data
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Totalt antal sessioner</p>
              <p className="text-2xl font-bold">{analyticsData.totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total studietid</p>
              <p className="text-2xl font-bold">{formatTime(analyticsData.totalTime)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Totalt antal frågor</p>
              <p className="text-2xl font-bold">{analyticsData.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Träffsäkerhet</p>
              <p className="text-2xl font-bold">{analyticsData.accuracy.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Prestanda</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Rätta svar:</span>
              <span className="font-medium">{analyticsData.correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Behärskade färdigheter:</span>
              <span className="font-medium">{analyticsData.skillsMastered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Genomsnittlig tid per fråga:</span>
              <span className="font-medium">
                {analyticsData.totalItems > 0 
                  ? formatTime(analyticsData.totalTime / analyticsData.totalItems)
                  : '0m'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Lagring</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`font-medium ${storageInfo.available ? 'text-green-500' : 'text-red-500'}`}>
                {storageInfo.available ? 'Tillgänglig' : 'Ej tillgänglig'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Använt:</span>
              <span className="font-medium">
                {(storageInfo.used / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Procent:</span>
              <span className="font-medium">
                {storageInfo.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Senaste aktivitet</h3>
        
        <div className="space-y-3">
          {analyticsData.recentActivity.map((event, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {event.type === 'start_session' && 'Startade session'}
                    {event.type === 'start_practice' && 'Startade övning'}
                    {event.type === 'item_answered' && 'Besvarade fråga'}
                    {event.type === 'skill_mastered' && 'Behärskade färdighet'}
                    {event.type === 'review_due' && 'Repetition förfallen'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(event.timestamp)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {event.data.skillId && `Färdighet: ${event.data.skillId}`}
                  {event.data.isCorrect !== undefined && ` - ${event.data.isCorrect ? 'Rätt' : 'Fel'}`}
                  {event.data.timeSpent && ` - ${formatTime(event.data.timeSpent)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}




