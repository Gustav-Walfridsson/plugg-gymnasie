'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BookOpen, Calculator, Atom, Globe, Beaker, Dna } from 'lucide-react'
import { StreakBadge } from '../components/StreakBadge'
import { DataHealthStatus } from '../components/DataHealthStatus'
import { store } from '../lib/store'
import { getSubjects, getUserProgress } from '../lib/supabase-data'
import { useAuth } from '../lib/auth-simple'
import { progressManager } from '../lib/progress-manager'
import type { Subject } from '../types/domain'

// Subject color mapping
const subjectColors: Record<string, string> = {
  'matematik': 'bg-blue-600',
  'fysik': 'bg-purple-600',
  'svenska': 'bg-green-600',
  'engelska': 'bg-red-600',
  'kemi': 'bg-orange-600',
  'biologi': 'bg-teal-600'
}

export default function HomePage() {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [userProgress, setUserProgress] = useState<any[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 'matematik',
      name: 'Matematik',
      description: 'Algebra och grundläggande matematik',
      color: 'bg-blue-600',
      icon: 'Calculator',
      topics: []
    },
    {
      id: 'fysik',
      name: 'Fysik',
      description: 'Mekanik och grundläggande fysik',
      color: 'bg-purple-600',
      icon: 'Atom',
      topics: []
    },
    {
      id: 'svenska',
      name: 'Svenska',
      description: 'Skrivande och grammatisk feedback',
      color: 'bg-green-600',
      icon: 'BookOpen',
      topics: []
    },
    {
      id: 'engelska',
      name: 'Engelska',
      description: 'Writing och vocabulary feedback',
      color: 'bg-red-600',
      icon: 'Globe',
      topics: []
    },
    {
      id: 'kemi',
      name: 'Kemi',
      description: 'Binding och bonding',
      color: 'bg-orange-600',
      icon: 'Beaker',
      topics: []
    },
    {
      id: 'biologi',
      name: 'Biologi',
      description: 'Genetik och grundläggande biologi',
      color: 'bg-teal-600',
      icon: 'Dna',
      topics: []
    }
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading homepage data...')
        setLoading(true)
        
        // Load subjects from Supabase
        const subjectsData = await getSubjects()
        console.log('📚 Loaded subjects:', subjectsData.length)
        if (subjectsData.length > 0) {
          setSubjects(subjectsData)
        }
        
        // Load user progress if logged in
        if (user) {
          console.log('👤 Loading user progress for:', user.email)
          
          // Load from ProgressManager (localStorage + Supabase)
          const localProgress = progressManager.getAllProgress()
          setUserProgress(localProgress)
          
          // Also try to load from Supabase
          try {
            const supabaseProgress = await getUserProgress(user.id)
            if (supabaseProgress && supabaseProgress.length > 0) {
              console.log('📊 Found Supabase progress:', supabaseProgress.length)
              setUserProgress(supabaseProgress)
            }
          } catch (error) {
            console.log('⚠️ Using local progress only')
          }
          
          // Load streak from store
          if (typeof window !== 'undefined') {
            const profile = store.getProfile()
            setStreak(profile.studyStreak)
          }
        }
      } catch (error) {
        console.error('❌ Error loading homepage data:', error)
        // Keep the default subjects that are already set
      } finally {
        setLoading(false)
      }
    }
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      loadData()
    }
  }, [user])

  // Always render the content - no hydration blocking

  return (
    <div className="space-y-8">
      {/* Loading Indicator */}
      {loading && (
        <div className="fixed top-4 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Laddar data...</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <h1 className="text-4xl font-bold text-primary">
            Välkommen till Plugg Bot 1
          </h1>
          {streak > 0 && <StreakBadge streak={streak} size="sm" />}
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Minska din studietid med 50% genom mastery-baserat lärande, 
          omedelbar feedback och smart repetition.
        </p>
        
        {/* Data Health Status */}
        <div className="flex justify-center">
          <DataHealthStatus showDetails={false} />
        </div>
        
        <div className="flex justify-center space-x-4 mt-6">
          <Link href="/study" className="btn-primary">
            Börja studera
          </Link>
          <Link href="/weakness" className="btn-outline">
            Se svagheter
          </Link>
          <Link href="/tutor" className="btn-outline">
            Prova tutor
          </Link>
          <Link href="/review" className="btn-outline">
            Repetition
          </Link>
        </div>
      </div>

      {/* Continue where you left off */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Fortsätt där du slutade</h2>
        {user ? (
          <div className="text-muted-foreground">
            {userProgress.length > 0 ? (
              <div>
                <p>Du har {userProgress.length} pågående sessioner.</p>
                <p className="text-sm mt-2">
                  Fortsätt med dina studier eller välj ett nytt ämne nedan.
                </p>
              </div>
            ) : (
              <div>
                <p>Välkommen {user.email}! Du har inga pågående sessioner ännu.</p>
                <p className="text-sm mt-2">
                  Välj ett ämne nedan för att börja din första lektion.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">
            <p>Logga in för att spara din framgång och fortsätta där du slutade.</p>
            <p className="text-sm mt-2">
              Välj ett ämne nedan för att börja din första lektion.
            </p>
          </div>
        )}
      </div>

      {/* Subject Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Välj ämne</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const color = subjectColors[subject.id] || 'bg-gray-600'
              
              // Get progress for this subject
              const subjectProgress = userProgress.filter(p => 
                p.skillId && p.skillId.startsWith(subject.id)
              )
              const totalMastery = subjectProgress.reduce((sum, p) => sum + (p.mastery || 0), 0)
              const averageMastery = subjectProgress.length > 0 ? totalMastery / subjectProgress.length : 0
              const masteryPercentage = Math.round(averageMastery * 100)
              
              // Determine mastery level
              let masteryLevel = 'Nybörjare'
              let masteryClass = 'beginner'
              if (masteryPercentage >= 80) {
                masteryLevel = 'Expert'
                masteryClass = 'expert'
              } else if (masteryPercentage >= 60) {
                masteryLevel = 'Avancerad'
                masteryClass = 'advanced'
              } else if (masteryPercentage >= 40) {
                masteryLevel = 'Medel'
                masteryClass = 'intermediate'
              } else if (masteryPercentage >= 20) {
                masteryLevel = 'Nybörjare+'
                masteryClass = 'beginner-plus'
              }
              
              return (
                <Link
                  key={subject.id}
                  href={`/study/${subject.id}`}
                  className="subject-card group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${color} text-white`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {subject.description}
                      </p>
                      <div className="mt-4">
                        <div className="mastery-indicator">
                          <div 
                            className={`mastery-fill ${masteryClass}`}
                            style={{ width: `${masteryPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {masteryLevel} • {masteryPercentage}% behärskad
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Mastery-baserat lärande</h3>
          <p className="text-sm text-muted-foreground">
            Behärska varje färdighet innan du går vidare. 
            Ingen tid slösas på saker du redan kan.
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Omedelbar feedback</h3>
          <p className="text-sm text-muted-foreground">
            Få direkt feedback på dina svar med fullständiga 
            lösningar och förklaringar.
          </p>
        </div>
        
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <Atom className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Smart repetition</h3>
          <p className="text-sm text-muted-foreground">
            Repetition baserad på vetenskap. 
            Träna när du behöver det mest.
          </p>
        </div>
      </div>
    </div>
  )
}
