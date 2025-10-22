'use client'

import Link from 'next/link'
import { ChevronRight, BookOpen, Target } from 'lucide-react'
import type { Topic } from '../../types/domain'

interface TopicCardProps {
  topic: Topic
  subjectId: string
  skillCount?: number
  completedSkills?: number
}

export function TopicCard({ topic, subjectId, skillCount = 0, completedSkills = 0 }: TopicCardProps) {
  const progressPercentage = skillCount > 0 ? (completedSkills / skillCount) * 100 : 0
  const isCompleted = completedSkills === skillCount && skillCount > 0

  return (
    <Link
      href={`/study/${subjectId}/${topic.id}`}
      className="group block bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {topic.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {skillCount} färdigheter
              </p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {topic.description}
          </p>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Framsteg</span>
              <span>{completedSkills}/{skillCount}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : progressPercentage > 0 
                      ? 'bg-primary' 
                      : 'bg-muted-foreground/20'
                }`}
                style={{ width: `${Math.max(progressPercentage, 2)}%` }}
              />
            </div>
            {isCompleted && (
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <Target className="w-3 h-3" />
                <span>Klart!</span>
              </div>
            )}
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </Link>
  )
}
