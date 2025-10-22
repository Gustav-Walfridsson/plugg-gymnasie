'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle, Clock, Target, TrendingUp, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'
// Mock data instead of complex imports
const mockSkillsData = {
  subjects: [
    {
      id: 'matematik',
      name: 'Matematik',
      topics: [
        {
          id: 'algebra',
          name: 'Algebra',
          skills: [
            { id: 'variabler-uttryck', name: 'Variabler och uttryck', description: 'Lär dig arbeta med variabler och algebraiska uttryck' },
            { id: 'enkla-ekvationer', name: 'Enkla ekvationer', description: 'Lös enkla ekvationer med en variabel' },
            { id: 'parenteser', name: 'Parenteser', description: 'Arbeta med parenteser i algebraiska uttryck' }
          ]
        }
      ]
    }
  ]
}

interface StudyPlan {
  id: string
  duration: number
  skills: string[]
  createdAt: Date
  estimatedCompletion: Date
}

export default function StudyPlanPage() {
  const params = useParams()
  const planId = params.planId as string
  
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [completedSkills, setCompletedSkills] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId] = useState<string>('default-user')

  useEffect(() => {
    loadPlan()
  }, [planId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive])

  const loadPlan = () => {
    const savedPlan = localStorage.getItem('selectedStudyPlan')
    if (savedPlan) {
      const parsedPlan = JSON.parse(savedPlan)
      if (parsedPlan.id === planId) {
        // Convert string dates back to Date objects
        parsedPlan.estimatedCompletion = new Date(parsedPlan.estimatedCompletion)
        setPlan(parsedPlan)
      }
    }
    setIsLoading(false)
  }

  const getSkillDetails = (skillId: string) => {
    for (const subject of mockSkillsData.subjects) {
      for (const topic of subject.topics) {
        const skill = topic.skills.find(s => s.id === skillId)
        if (skill) {
          return {
            skill,
            subject: subject,
            topic: topic
          }
        }
      }
    }
    return null
  }

  const getMasteryPercentage = (skillId: string) => {
    // Mock mastery percentages
    const percentages = {
      'variabler-uttryck': 20,
      'enkla-ekvationer': 40,
      'parenteser': 60
    }
    return percentages[skillId as keyof typeof percentages] || 30
  }

  const startPlan = () => {
    setIsActive(true)
  }

  const pausePlan = () => {
    setIsActive(false)
  }

  const completeSkill = (skillId: string) => {
    if (!completedSkills.includes(skillId)) {
      setCompletedSkills(prev => [...prev, skillId])
    }
    
    // Move to next skill
    if (currentSkillIndex < plan!.skills.length - 1) {
      setCurrentSkillIndex(prev => prev + 1)
    }
  }

  const resetPlan = () => {
    setIsActive(false)
    setTimeSpent(0)
    setCurrentSkillIndex(0)
    setCompletedSkills([])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (!plan) return 0
    return Math.round((completedSkills.length / plan.skills.length) * 100)
  }

  const getEstimatedTimeRemaining = () => {
    if (!plan || completedSkills.length === 0) return plan?.duration || 0
    
    const avgTimePerSkill = timeSpent / completedSkills.length
    const remainingSkills = plan.skills.length - completedSkills.length
    return Math.round(avgTimePerSkill * remainingSkills)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Plan inte hittad</h1>
        <p className="text-muted-foreground">
          Den begärda studieplanen kunde inte hittas.
        </p>
        <Link href="/weakness" className="btn-primary">
          Tillbaka till svagheter
        </Link>
      </div>
    )
  }

  const currentSkill = plan.skills[currentSkillIndex]
  const skillDetails = getSkillDetails(currentSkill)
  const progressPercentage = getProgressPercentage()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/weakness" className="btn-outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">Studieplan</h1>
            <p className="text-muted-foreground">
              {plan.duration} minuter per vecka • {plan.skills.length} färdigheter
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{formatTime(timeSpent)}</div>
            <div className="text-sm text-muted-foreground">Tid spenderad</div>
          </div>
          <div className="flex space-x-2">
            {!isActive ? (
              <button onClick={startPlan} className="btn-primary">
                <Play className="w-4 h-4 mr-2" />
                Starta
              </button>
            ) : (
              <button onClick={pausePlan} className="btn-outline">
                <Pause className="w-4 h-4 mr-2" />
                Pausa
              </button>
            )}
            <button onClick={resetPlan} className="btn-outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Återställ
            </button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Framsteg</span>
          </h2>
          <div className="text-sm text-muted-foreground">
            {completedSkills.length} av {plan.skills.length} färdigheter slutförda
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">{progressPercentage}%</div>
              <div className="text-muted-foreground">Slutfört</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">{formatTime(timeSpent)}</div>
              <div className="text-muted-foreground">Tid spenderad</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">{formatTime(getEstimatedTimeRemaining())}</div>
              <div className="text-muted-foreground">Uppskattad tid kvar</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Färdigheter i planen</h2>
        <div className="space-y-3">
          {plan.skills.map((skillId, index) => {
            const details = getSkillDetails(skillId)
            const masteryPercentage = getMasteryPercentage(skillId)
            const isCompleted = completedSkills.includes(skillId)
            const isCurrent = index === currentSkillIndex
            
            if (!details) return null
            
            return (
              <div 
                key={skillId}
                className={`p-4 rounded-lg border transition-all ${
                  isCurrent ? 'border-primary bg-primary/5' : 
                  isCompleted ? 'border-green-200 bg-green-50' : 
                  'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isCurrent ? 'bg-primary text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{details.skill.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {details.subject.name} • {masteryPercentage}% behärskad
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right text-sm">
                      <div className="font-medium">{masteryPercentage}%</div>
                      <div className="text-muted-foreground">Behärskning</div>
                    </div>
                    
                    {isCurrent && !isCompleted && (
                      <div className="flex space-x-2">
                        <Link 
                          href={`/practice/${skillId}`}
                          className="btn-primary text-sm"
                        >
                          Träna nu
                        </Link>
                        <button 
                          onClick={() => completeSkill(skillId)}
                          className="btn-outline text-sm"
                        >
                          Markera som klar
                        </button>
                      </div>
                    )}
                    
                    {isCompleted && (
                      <div className="text-green-600 text-sm font-medium">
                        Slutförd
                      </div>
                    )}
                  </div>
                </div>
                
                {isCurrent && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      {details.skill.description}
                    </p>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/lesson/${skillId}`}
                        className="btn-outline text-sm"
                      >
                        Läs lektion
                      </Link>
                      <Link 
                        href={`/practice/${skillId}`}
                        className="btn-primary text-sm"
                      >
                        Börja träna
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Completion Message */}
      {completedSkills.length === plan.skills.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-600 mb-2">
            Grattis! Planen är slutförd
          </h3>
          <p className="text-muted-foreground mb-4">
            Du har slutfört alla färdigheter i din studieplan på {formatTime(timeSpent)}.
          </p>
          <div className="flex justify-center space-x-3">
            <Link href="/weakness" className="btn-primary">
              Skapa ny plan
            </Link>
            <Link href="/profile" className="btn-outline">
              Se profil
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
