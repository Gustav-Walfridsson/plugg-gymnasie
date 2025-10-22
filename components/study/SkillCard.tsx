'use client'

import Link from 'next/link'
import { ChevronRight, BookOpen, Target, Clock, CheckCircle } from 'lucide-react'
import type { Skill } from '../../types/domain'

interface SkillCardProps {
  skill: Skill
  subjectId: string
  topicId: string
  lessonCount?: number
  exerciseCount?: number
  isCompleted?: boolean
  masteryLevel?: 'nybörjare' | 'lärande' | 'behärskad'
}

const difficultyColors = {
  enkel: 'bg-green-100 text-green-800 border-green-200',
  medel: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  svår: 'bg-red-100 text-red-800 border-red-200'
}

const masteryColors = {
  nybörjare: 'bg-gray-100 text-gray-800',
  lärande: 'bg-blue-100 text-blue-800',
  behärskad: 'bg-green-100 text-green-800'
}

export function SkillCard({ 
  skill, 
  subjectId, 
  topicId, 
  lessonCount = 0, 
  exerciseCount = 0,
  isCompleted = false,
  masteryLevel = 'nybörjare'
}: SkillCardProps) {
  return (
    <Link
      href={`/study/${subjectId}/${topicId}/${skill.id}`}
      className="group block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {skill.name}
                </h3>
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${difficultyColors[skill.difficulty]}`}>
                  {skill.difficulty}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${masteryColors[masteryLevel]}`}>
                  {masteryLevel}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {skill.description}
              </p>
              
              {/* Prerequisites */}
              {skill.prerequisites && skill.prerequisites.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Förutsättningar:</p>
                  <div className="flex flex-wrap gap-1">
                    {skill.prerequisites.map((prereq, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                      >
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Stats */}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{lessonCount} lektioner</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3" />
                  <span>{exerciseCount} övningar</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>~{Math.ceil((lessonCount * 5 + exerciseCount * 2) / 60)} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </Link>
  )
}
