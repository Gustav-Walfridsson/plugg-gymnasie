'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, Target, TrendingUp, BookOpen, Calculator, Atom, Globe, Beaker, Dna } from 'lucide-react'
import { useAuth } from '../../lib/auth-simple'
import { supabase } from '../../lib/supabase-client'

const iconMap = {
  Calculator,
  Atom,
  BookOpen,
  Globe,
  Beaker,
  Dna
}

const subjectColors = {
  matematik: 'bg-blue-600',
  fysik: 'bg-purple-600',
  svenska: 'bg-green-600',
  engelska: 'bg-red-600',
  kemi: 'bg-orange-600',
  biologi: 'bg-teal-600'
}

const subjectNames = {
  matematik: 'Matematik',
  fysik: 'Fysik',
  svenska: 'Svenska',
  engelska: 'Engelska',
  kemi: 'Kemi',
  biologi: 'Biologi'
}

interface WeaknessData {
  skillId: string
  skillName: string
  subjectId: string
  weaknessScore: number
  recentErrors: number
  lastAttempt: Date
  recommendedActions: string[]
}

export default function WeaknessPage() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [weaknesses, setWeaknesses] = useState<WeaknessData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, accountId } = useAuth()

  useEffect(() => {
    if (!accountId) return

    const fetchWeaknesses = async () => {
      try {
        setLoading(true)
        setError(null)

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )

        const fetchPromise = supabase
          .from('mastery_states')
          .select(`
            skill_id,
            probability,
            updated_at,
            skills!inner(
              id,
              name,
              subject_id,
              subjects!inner(
                id,
                name
              )
            )
          `)
          .eq('account_id', accountId)
          .lt('probability', 0.6) // Weaknesses are skills with low mastery
          .order('probability', { ascending: true })
          .limit(10)

        const { data: masteryStates, error: masteryError } = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as any

        if (masteryError) {
          console.warn('No mastery data found, using fallback weaknesses')
          // Use fallback weaknesses if no data exists
          const fallbackWeaknesses: WeaknessData[] = [
            {
              skillId: 'variabler-uttryck',
              skillName: 'Variabler och uttryck',
              subjectId: 'matematik',
              weaknessScore: 0.3,
              recentErrors: 2,
              lastAttempt: new Date(),
              recommendedActions: ['Gå igenom grundläggande koncept', 'Träna med enkla övningar', 'Be om hjälp från tutor']
            },
            {
              skillId: 'enkla-ekvationer',
              skillName: 'Enkla ekvationer',
              subjectId: 'matematik',
              weaknessScore: 0.4,
              recentErrors: 1,
              lastAttempt: new Date(),
              recommendedActions: ['Repetera teorin', 'Öva med medelsvåra problem', 'Använd flashcards']
            }
          ]
          setWeaknesses(fallbackWeaknesses)
          return
        }

        // Fetch recent errors for each weakness
        const weaknessData: WeaknessData[] = []
        
        for (const mastery of masteryStates || []) {
          // Get recent attempts for this skill
          const { data: attempts, error: attemptsError } = await supabase
            .from('attempts')
            .select('is_correct, timestamp')
            .eq('account_id', accountId)
            .eq('skill_id', mastery.skill_id)
            .order('timestamp', { ascending: false })
            .limit(10)

          if (attemptsError) {
            console.error('Error fetching attempts:', attemptsError)
            continue
          }

          const recentErrors = attempts?.filter(a => !a.is_correct).length || 0
          const lastAttempt = attempts?.[0]?.timestamp ? new Date(attempts[0].timestamp) : new Date()

          // Generate recommended actions based on weakness level
          const recommendedActions = []
          if (mastery.probability < 0.3) {
            recommendedActions.push('Gå igenom grundläggande koncept', 'Träna med enkla övningar', 'Be om hjälp från tutor')
          } else if (mastery.probability < 0.5) {
            recommendedActions.push('Repetera teorin', 'Öva med medelsvåra problem', 'Använd flashcards')
          } else {
            recommendedActions.push('Fokusera på svåra problem', 'Diskutera med klasskamrater', 'Be läraren om hjälp')
          }

          weaknessData.push({
            skillId: mastery.skill_id,
            skillName: mastery.skills.name,
            subjectId: mastery.skills.subject_id,
            weaknessScore: mastery.probability,
            recentErrors,
            lastAttempt,
            recommendedActions
          })
        }

        setWeaknesses(weaknessData)
      } catch (err) {
        console.error('Error fetching weaknesses:', err)
        setError('Kunde inte ladda svagheter. Försök igen senare.')
      } finally {
        setLoading(false)
      }
    }

    fetchWeaknesses()
  }, [accountId, supabase])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Logga in krävs</h1>
          <p className="text-gray-600 mb-6">Du måste logga in för att se dina svagheter.</p>
          <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Logga in
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar dina svagheter...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ett fel uppstod</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Försök igen
          </button>
        </div>
      </div>
    )
  }

  const getWeaknessLevel = (score: number) => {
    if (score > 0.8) return { level: 'Hög', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (score > 0.5) return { level: 'Medel', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { level: 'Låg', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
  }

  const getMasteryPercentage = (score: number) => {
    return Math.round((1 - score) * 100) // Convert weakness score to mastery percentage
  }

  const createStudyPlan = async (duration: number) => {
    try {
      const planId = `plan-${duration}-${Date.now()}`
      const plan = {
        id: planId,
        duration: duration,
        skills: weaknesses.map(w => w.skillId),
        created_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + (duration * 7 * 24 * 60 * 60 * 1000)).toISOString()
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('study_plans')
        .insert({
          id: planId,
          account_id: accountId,
          name: `${duration} min/vecka studieplan`,
          description: `Personlig studieplan för ${duration} minuter per vecka`,
          skills: plan.skills,
          duration_minutes: duration,
          created_at: plan.created_at,
          estimated_completion: plan.estimated_completion
        })

      if (error) {
        console.error('Error saving study plan:', error)
        // Fallback to localStorage
        localStorage.setItem('selectedStudyPlan', JSON.stringify(plan))
      }
      
      // Navigate to study plan
      window.location.href = `/study-plan/${planId}`
    } catch (err) {
      console.error('Error creating study plan:', err)
      // Fallback to localStorage
      const plan = {
        id: `plan-${duration}-${Date.now()}`,
        duration: duration,
        skills: weaknesses.map(w => w.skillId),
        createdAt: new Date(),
        estimatedCompletion: new Date(Date.now() + (duration * 7 * 24 * 60 * 60 * 1000))
      }
      localStorage.setItem('selectedStudyPlan', JSON.stringify(plan))
      window.location.href = `/study-plan/${plan.id}`
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-primary">
            Svagheter & Studieplan
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Identifiera dina svagaste områden och skapa en personlig studieplan för att förbättra dem.
        </p>
      </div>

      {/* Weaknesses Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center space-x-2">
          <Target className="w-6 h-6 text-primary" />
          <span>Dina svagaste färdigheter</span>
        </h2>
        
        {weaknesses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Inga svagheter hittades</h3>
            <p className="text-gray-500 mb-6">Du verkar ha bra behärskning av dina färdigheter!</p>
            <Link href="/study" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Utforska nya ämnen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weaknesses.map((weakness, index) => {
              const weaknessLevel = getWeaknessLevel(weakness.weaknessScore)
              const masteryPercentage = getMasteryPercentage(weakness.weaknessScore)
              const SubjectIcon = iconMap[weakness.subjectId as keyof typeof iconMap] || BookOpen
              
              return (
                <div key={weakness.skillId} className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${subjectColors[weakness.subjectId as keyof typeof subjectColors]} text-white`}>
                        <SubjectIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{weakness.skillName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {subjectNames[weakness.subjectId as keyof typeof subjectNames]}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${weaknessLevel.bgColor} ${weaknessLevel.color}`}>
                      {weaknessLevel.level}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Behärskning</span>
                        <span>{masteryPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${masteryPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Senaste fel: {weakness.recentErrors}</p>
                      <p>Senaste försök: {weakness.lastAttempt.toLocaleDateString('sv-SE')}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Rekommenderade åtgärder:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {weakness.recommendedActions.map((action, i) => (
                          <li key={i} className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      <Link 
                        href={`/practice/${weakness.skillId}`}
                        className="btn-primary w-full text-center"
                      >
                        Träna denna färdighet
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Study Plan Section */}
      {weaknesses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center space-x-2">
            <Clock className="w-6 h-6 text-primary" />
            <span>Skapa studieplan</span>
          </h2>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground mb-6">
              Välj en veckoplan som passar din tid och fokusera på dina svagaste områden.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { duration: 30, title: 'Snabb förbättring', description: '30 min/vecka', color: 'bg-green-600' },
                { duration: 60, title: 'Balanserad plan', description: '60 min/vecka', color: 'bg-blue-600' },
                { duration: 90, title: 'Intensiv träning', description: '90 min/vecka', color: 'bg-purple-600' }
              ].map((plan) => (
                <button
                  key={plan.duration}
                  onClick={() => createStudyPlan(plan.duration)}
                  className="p-6 rounded-lg border-2 border-transparent hover:border-primary transition-all text-left group bg-card hover:shadow-lg"
                >
                  <div className={`w-12 h-12 ${plan.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{plan.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <p>• Fokus på svagaste färdigheter</p>
                    <p>• Personliga övningar</p>
                    <p>• Progressionsspårning</p>
                  </div>
                  <div className="mt-4 text-sm font-medium text-primary">
                    Klicka för att starta planen →
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}