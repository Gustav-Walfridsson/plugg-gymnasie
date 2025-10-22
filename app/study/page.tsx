'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BookOpen, Calculator, Atom, Globe, Beaker, Dna } from 'lucide-react'
import { getSubjects } from '../../lib/data'
import type { Subject } from '../../types/domain'

// Subject color mapping
const subjectColors: Record<string, string> = {
  'matematik': 'bg-blue-600',
  'fysik': 'bg-purple-600',
  'svenska': 'bg-green-600',
  'engelska': 'bg-red-600',
  'kemi': 'bg-orange-600',
  'biologi': 'bg-teal-600'
}

export default function StudyPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const loadData = async () => {
      try {
        console.log('🔄 Loading study page data...')
        setLoading(true)
        
        const subjectsData = await getSubjects()
        console.log('📚 Loaded subjects:', subjectsData.length)
        if (subjectsData.length > 0) {
          setSubjects(subjectsData)
        }
      } catch (error) {
        console.error('❌ Error loading study page data:', error)
        // Set fallback subjects if loading fails
        setSubjects([
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
      } finally {
        setLoading(false)
      }
    }
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      loadData()
    }
  }, [])

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Välj ämne att studera
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Välj ett ämne nedan för att börja din studie.
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

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

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          Välj ämne att studera
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Välj ett ämne nedan för att börja din studie.
        </p>
      </div>

      {/* Subject Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const color = subjectColors[subject.id] || 'bg-gray-600'
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
                          <div className="mastery-fill beginner w-0"></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Nybörjare • 0% behärskad
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
    </div>
  )
}
