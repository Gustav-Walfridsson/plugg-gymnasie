'use client'

import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg ${sizeClasses[size]}`}>
      <Flame className={`${iconSizes[size]} text-orange-600`} />
      <span className="font-semibold text-orange-800 dark:text-orange-200">
        {streak} dagar
      </span>
    </div>
  )
}
