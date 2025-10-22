'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getLessonsBySkill, areFixturesLoaded, seedLocalStore } from '../../../lib/data'
import type { Lesson } from '../../../types/domain'

interface LessonPageProps {
  params: Promise<{
    skillId: string
  }>
}

export default function LessonPage({ params }: LessonPageProps) {
  const [skillId, setSkillId] = useState<string>('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true)
        const resolvedParams = await params
        const { skillId: resolvedSkillId } = resolvedParams
        setSkillId(resolvedSkillId)
        
        // Ensure fixtures are loaded
        if (!areFixturesLoaded()) {
          console.log('Loading fixtures for lessons...')
          await seedLocalStore()
        }
        
        // Load lessons for the skill
        const skillLessons = getLessonsBySkill(resolvedSkillId)
        setLessons(skillLessons)
        
        if (skillLessons.length === 0) {
          setError('Inga lektioner tillgängliga för denna färdighet ännu.')
        }
      } catch (err) {
        console.error('Error loading lessons:', err)
        setError('Ett fel uppstod vid laddning av lektioner')
      } finally {
        setLoading(false)
      }
    }
    
    loadLessons()
  }, [params])

  const currentLesson = lessons[currentLessonIndex]
  const canGoPrevious = currentLessonIndex > 0
  const canGoNext = currentLessonIndex < lessons.length - 1

  const goToPreviousLesson = () => {
    if (canGoPrevious) {
      setCurrentLessonIndex(currentLessonIndex - 1)
    }
  }

  const goToNextLesson = () => {
    if (canGoNext) {
      setCurrentLessonIndex(currentLessonIndex + 1)
    }
  }

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
          <h1 className="text-3xl font-bold">Laddar lektioner...</h1>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || lessons.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Lektioner</h1>
        </div>
        
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Inga lektioner tillgängliga</h2>
          <p className="text-destructive/80">
            {error || 'Det finns inga lektioner tillgängliga för denna färdighet ännu.'}
          </p>
          <div className="mt-4">
            <Link href="/" className="btn-outline">
              Tillbaka till hem
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href="/" 
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Lektioner</h1>
      </div>
      
      {/* Lesson Navigation */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Lektion {currentLessonIndex + 1} av {lessons.length}
            </span>
            <h2 className="text-lg font-semibold">{currentLesson.title}</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousLesson}
              disabled={!canGoPrevious}
              className="p-2 hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextLesson}
              disabled={!canGoNext}
              className="p-2 hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Lesson Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
            <p className="text-muted-foreground">Lär dig grunderna innan du börjar öva</p>
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <div className="text-foreground">
            {(() => {
              const lines = currentLesson.content.split('\n')
              const elements = []
              let i = 0
              
              while (i < lines.length) {
                const line = lines[i]
                
                // Handle headers
                if (line.startsWith('## ')) {
                  elements.push(
                    <h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-foreground">
                      {line.substring(3)}
                    </h2>
                  )
                } else if (line.startsWith('### ')) {
                  elements.push(
                    <h3 key={i} className="text-lg font-medium mt-4 mb-2 text-foreground">
                      {line.substring(4)}
                    </h3>
                  )
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  elements.push(
                    <p key={i} className="font-semibold my-2 text-foreground">
                      {line.substring(2, line.length - 2)}
                    </p>
                  )
                } else if (line.startsWith('- ')) {
                  // Handle bullet list
                  const listItems = []
                  while (i < lines.length && lines[i].startsWith('- ')) {
                    listItems.push(
                      <li key={i} className="my-1 text-foreground">
                        {lines[i].substring(2)}
                      </li>
                    )
                    i++
                  }
                  elements.push(
                    <ul key={`ul-${i}`} className="ml-4 my-2 list-disc">
                      {listItems}
                    </ul>
                  )
                  i-- // Adjust for the outer loop increment
                } else if (/^\d+\.\s/.test(line)) {
                  // Handle numbered list
                  const listItems = []
                  while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                    listItems.push(
                      <li key={i} className="my-1 text-foreground">
                        {lines[i]}
                      </li>
                    )
                    i++
                  }
                  elements.push(
                    <ol key={`ol-${i}`} className="ml-4 my-2 list-decimal">
                      {listItems}
                    </ol>
                  )
                  i-- // Adjust for the outer loop increment
                } else if (line.startsWith('**') && !line.endsWith('**')) {
                  elements.push(
                    <div key={i} className="bg-muted p-3 rounded-md my-2 font-mono text-sm">
                      {line.substring(2)}
                    </div>
                  )
                } else if (line.trim() === '') {
                  elements.push(<br key={i} />)
                } else {
                  elements.push(
                    <p key={i} className="my-2 text-foreground">
                      {line}
                    </p>
                  )
                }
                i++
              }
              
              return elements
            })()}
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <div className="flex space-x-4">
            <button
              onClick={goToPreviousLesson}
              disabled={!canGoPrevious}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Föregående
            </button>
            <button
              onClick={goToNextLesson}
              disabled={!canGoNext}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Nästa
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
          
          <div className="flex space-x-4">
            <Link href={`/practice/${skillId}`} className="btn-primary">
              Börja öva
            </Link>
            <Link href="/" className="btn-outline">
              Tillbaka till hem
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
