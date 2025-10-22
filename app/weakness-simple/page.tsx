'use client'

import Link from 'next/link'
import { AlertTriangle, Clock, Target, TrendingUp, BookOpen, Calculator, Atom, Globe, Beaker, Dna } from 'lucide-react'

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

export default function WeaknessSimplePage() {
  // Static data - no loading states
  const weaknesses = [
    {
      skillId: 'variabler-uttryck',
      skillName: 'Variabler och uttryck',
      subjectId: 'matematik',
      weaknessScore: 0.8,
      recentErrors: 3,
      lastAttempt: new Date(),
      recommendedActions: [
        'Gå igenom grundläggande koncept',
        'Träna med enkla övningar',
        'Be om hjälp från tutor'
      ]
    },
    {
      skillId: 'enkla-ekvationer',
      skillName: 'Enkla ekvationer',
      subjectId: 'matematik',
      weaknessScore: 0.6,
      recentErrors: 2,
      lastAttempt: new Date(),
      recommendedActions: [
        'Repetera lösningsmetoder',
        'Öva med fler exempel',
        'Kontrollera svaren'
      ]
    },
    {
      skillId: 'parenteser',
      skillName: 'Parenteser',
      subjectId: 'matematik',
      weaknessScore: 0.4,
      recentErrors: 1,
      lastAttempt: new Date(),
      recommendedActions: [
        'Lär dig reglerna för parenteser',
        'Träna med olika typer',
        'Använd räknare för kontroll'
      ]
    }
  ]

  const getWeaknessLevel = (score: number) => {
    if (score > 0.8) return { level: 'Hög', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (score > 0.5) return { level: 'Medel', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { level: 'Låg', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
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
          <span>Dina 3 svagaste färdigheter</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weaknesses.map((weakness, index) => {
            const weaknessLevel = getWeaknessLevel(weakness.weaknessScore)
            const masteryPercentage = getMasteryPercentage(weakness.skillId)
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
      </div>

      {/* Study Plan Section */}
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
                className="p-6 rounded-lg border-2 border-transparent hover:border-primary transition-all text-left group bg-card"
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
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
