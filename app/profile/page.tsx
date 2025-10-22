'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, User, Trophy, Star, Target, Zap, Award } from 'lucide-react'
import { useAuth } from '../../lib/auth-simple'
import { progressManager } from '../../lib/progress-manager'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    name: user?.email || 'Användare',
    level: 1,
    totalXP: 0,
    studyStreak: 0
  })
  const [badges, setBadges] = useState<any[]>([])
  const [availableBadges, setAvailableBadges] = useState<any[]>([])
  const [weakAreas, setWeakAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Load progress data
        const allProgress = progressManager.getAllProgress()
        
        // Calculate real statistics
        const totalCorrectAnswers = allProgress.reduce((sum, p) => sum + (p.correctAnswers || 0), 0)
        const totalAttempts = allProgress.reduce((sum, p) => sum + (p.totalAttempts || 0), 0)
        const totalXP = totalCorrectAnswers * 10 + totalAttempts * 5 // 10 XP per correct, 5 XP per attempt
        
        // Calculate level based on XP
        const level = Math.floor(Math.sqrt(totalXP / 100)) + 1
        const xpForCurrentLevel = Math.pow(level - 1, 2) * 100
        const xpForNextLevel = Math.pow(level, 2) * 100
        const xpToNextLevel = xpForNextLevel - totalXP
        
        // Calculate study streak (simplified - based on recent activity)
        const recentActivity = allProgress.filter(p => {
          const lastUpdated = new Date(p.lastUpdated)
          const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceUpdate <= 7
        })
        const studyStreak = Math.min(recentActivity.length, 7)
        
        // Calculate current streak (consecutive correct answers)
        const currentStreak = Math.max(...allProgress.map(p => p.correctAnswers || 0), 0)
        
        setProfile({
          name: user.email || 'Användare',
          level,
          totalXP,
          studyStreak
        })
        
        // Calculate badges based on real progress
        const earnedBadges = []
        const availableBadgesList = []
        
        if (totalAttempts > 0) {
          earnedBadges.push({
            id: 'first-session',
            name: 'Första sessionen',
            description: 'Slutförde din första studiesession',
            icon: '🎯',
            earnedAt: new Date(),
            rarity: 'common'
          })
        }
        
        if (studyStreak >= 7) {
          earnedBadges.push({
            id: 'streak-7',
            name: 'Veckostreak',
            description: 'Studerade 7 dagar i rad',
            icon: '🔥',
            earnedAt: new Date(),
            rarity: 'rare'
          })
        }
        
        if (totalCorrectAnswers >= 10) {
          earnedBadges.push({
            id: 'persistent',
            name: 'Ihållande',
            description: 'Fick 10 rätta svar',
            icon: '💪',
            earnedAt: new Date(),
            rarity: 'rare'
          })
        }
        
        if (studyStreak < 7) {
          availableBadgesList.push({
            id: 'streak-7',
            name: 'Veckostreak',
            description: 'Studera 7 dagar i rad',
            icon: '🔥',
            rarity: 'rare',
            progress: studyStreak,
            requirement: 7
          })
        }
        
        if (studyStreak < 30) {
          availableBadgesList.push({
            id: 'streak-30',
            name: 'Månadsstreak',
            description: 'Studera 30 dagar i rad',
            icon: '⭐',
            rarity: 'epic',
            progress: studyStreak,
            requirement: 30
          })
        }
        
        setBadges(earnedBadges)
        setAvailableBadges(availableBadgesList)
        
        // Calculate weak areas (skills with low mastery)
        const weakSkills = allProgress
          .filter(p => (p.mastery || 0) < 0.5)
          .sort((a, b) => (a.mastery || 0) - (b.mastery || 0))
          .slice(0, 3)
          .map(p => ({
            skillId: p.skillId,
            mastery: p.mastery || 0,
            name: p.skillId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
          }))
        
        setWeakAreas(weakSkills)
        
      } catch (error) {
        console.error('Error loading profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Profil</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const xpToNextLevel = Math.pow(profile.level, 2) * 100 - profile.totalXP
  const currentStreak = Math.max(...progressManager.getAllProgress().map(p => p.correctAnswers || 0), 0)
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href="/" 
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Profil</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Din profil</h2>
              <p className="text-muted-foreground">Statistik och framsteg</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Namn:</span>
              <span className="font-medium">{profile.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Nivå:</span>
              <span className="font-medium">{profile.level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total XP:</span>
              <span className="font-medium">{profile.totalXP}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">XP till nästa nivå:</span>
                <span className="font-medium">{xpToNextLevel}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, ((profile.totalXP - Math.pow(profile.level - 1, 2) * 100) / (Math.pow(profile.level, 2) * 100 - Math.pow(profile.level - 1, 2) * 100)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Studiestreak:</span>
              <span className="font-medium">{profile.studyStreak} dagar</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Utmärkelser:</span>
              <span className="font-medium">{badges.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Nuvarande streak:</span>
              <span className="font-medium">{currentStreak} rätta svar</span>
            </div>
          </div>
        </div>
        
        {/* Badges */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Utmärkelser</h2>
              <p className="text-muted-foreground">Dina prestationer</p>
            </div>
          </div>
          
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(badge.earnedAt).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Inga utmärkelser ännu. Börja studera för att tjäna dina första badges!
              </p>
            </div>
          )}
          
          {availableBadges.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Tillgängliga utmärkelser</h3>
              <div className="space-y-2">
                {availableBadges.slice(0, 3).map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg opacity-60">
                    <div className="text-lg">{badge.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                    </div>
                  </div>
                ))}
                {availableBadges.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{availableBadges.length - 3} fler tillgängliga
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Weaknesses */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Svaga områden</h2>
              <p className="text-muted-foreground">Fokusera på dessa färdigheter</p>
            </div>
          </div>
          
          {weakAreas.length > 0 ? (
            <div className="space-y-3">
              {weakAreas.map((area, index) => (
                <div key={area.skillId} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{area.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Behärskning: {Math.round(area.mastery * 100)}%
                    </p>
                  </div>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${area.mastery * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Inga svaga områden identifierade ännu. Börja öva för att få personliga rekommendationer!
              </p>
            </div>
          )}
        </div>
        
        {/* Study Plan */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Veckoplan</h2>
              <p className="text-muted-foreground">Personliga studierekommendationer</p>
            </div>
          </div>
          
          {weakAreas.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Rekommenderade färdigheter att träna:</h3>
              {weakAreas.slice(0, 3).map((area, index) => (
                <div key={area.skillId} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{area.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Behärskning: {Math.round(area.mastery * 100)}% - Fokusera här först
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={`/practice/${area.skillId}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Öva →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Inga studierekommendationer ännu. Börja studera för att få personliga planer!
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <Link href="/" className="btn-outline">
          Tillbaka till hem
        </Link>
      </div>
    </div>
  )
}
