'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Clock, CheckCircle } from 'lucide-react'
import type { Lesson } from '../../types/domain'

interface LessonCardProps {
  lesson: Lesson
  isCompleted?: boolean
  onComplete?: (lessonId: string) => void
}

export function LessonCard({ lesson, isCompleted = false, onComplete }: LessonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Estimate reading time (200 words per minute)
  const wordCount = lesson.content.split(' ').length
  const readingTime = Math.ceil(wordCount / 200)

  const handleComplete = () => {
    if (onComplete && !isCompleted) {
      onComplete(lesson.id)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
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
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleComplete()
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
              >
                Markera som oläst
              </button>
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
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Markera som läst
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
