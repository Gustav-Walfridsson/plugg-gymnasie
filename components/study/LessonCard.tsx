'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase-client'
import type { Lesson } from '../../types/domain'

interface LessonCardProps {
  lesson: Lesson
  isCompleted?: boolean
  onComplete?: (lessonId: string) => void
}

export function LessonCard({ lesson, isCompleted = false, onComplete }: LessonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [completionStatus, setCompletionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  // Estimate reading time (200 words per minute)
  const wordCount = lesson.content.split(' ').length
  const readingTime = Math.ceil(wordCount / 200)

  const handleComplete = async () => {
    if (!onComplete || isCompleted || isCompleting) {
      console.log('Button click ignored:', { onComplete: !!onComplete, isCompleted, isCompleting })
      return
    }

    console.log('🚀 Starting lesson completion for:', lesson.id)
    setIsCompleting(true)
    setCompletionStatus('loading')

    try {
      // Get current session and access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('❌ No session found:', sessionError?.message)
        setCompletionStatus('error')
        alert('Du måste vara inloggad för att markera lektioner som lästa.')
        return
      }

      console.log('🔑 Using access token for API call')
      
      const response = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      console.log('📡 API Response:', response.status, response.statusText)
      const data = await response.json()
      console.log('📄 Response data:', data)
      
      if (response.ok) {
        if (data.completed) {
          // Success - new completion
          setCompletionStatus('success')
          alert(data.message || 'Lektion markerad som läst! Du fick 10 XP.')
          onComplete(lesson.id)
          
          // Reset status after 2 seconds
          setTimeout(() => setCompletionStatus('idle'), 2000)
        } else {
          // Already completed - not an error, just informational
          console.log('ℹ️ Lesson already completed:', data.message)
          alert(data.message || 'Lektion redan markerad som läst')
          
          // Don't show error state, just reset to idle
          setTimeout(() => setCompletionStatus('idle'), 1000)
        }
      } else {
        // Actual error - show error state
        setCompletionStatus('error')
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        alert(data.message || data.error || 'Ett fel uppstod vid markering av lektion.')
        
        // Reset status after 3 seconds
        setTimeout(() => setCompletionStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('❌ Error completing lesson:', error)
      setCompletionStatus('error')
      
      if (error instanceof Error && error.message.includes('session')) {
        alert('Din session har gått ut. Logga in igen.')
      } else {
        alert('Ett fel uppstod. Försök igen.')
      }
      
      // Reset status after 3 seconds
      setTimeout(() => setCompletionStatus('idle'), 3000)
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={(e) => {
          // Don't expand if clicking on the complete button
          if (e.target instanceof HTMLElement && e.target.closest('button')) {
            return
          }
          setIsExpanded(!isExpanded)
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {lesson.title}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span>Lektion {lesson.order}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{readingTime} min läsning</span>
                </div>
                {isCompleted && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>Klart</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <div className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                ✓ Läst
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="pt-4">
            <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
              {lesson.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {!isCompleted && (
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={handleComplete}
                  disabled={isCompleting || !onComplete}
                  className={`
                    w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${completionStatus === 'loading' 
                      ? 'bg-blue-500 text-white cursor-wait' 
                      : completionStatus === 'success'
                      ? 'bg-green-500 text-white'
                      : completionStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                    }
                    ${(!onComplete || isCompleting) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                  `}
                >
                  {completionStatus === 'loading' && (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Sparar...
                    </span>
                  )}
                  {completionStatus === 'success' && (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Klar!
                    </span>
                  )}
                  {completionStatus === 'error' && (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Fel!
                    </span>
                  )}
                  {completionStatus === 'idle' && 'Markera som läst'}
                </button>
                
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Debug: onComplete={onComplete ? '✅' : '❌'}, isCompleted={isCompleted ? '✅' : '❌'}, isCompleting={isCompleting ? '✅' : '❌'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
