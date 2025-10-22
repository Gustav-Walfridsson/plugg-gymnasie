/**
 * Utility Functions for Plugg Bot 1
 * Common helper functions and utilities
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format time duration in a human-readable way
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Format date in Swedish format
 */
export function formatDateSwedish(date: Date): string {
  return date.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format time in Swedish format
 */
export function formatTimeSwedish(date: Date): string {
  return date.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get mastery color based on percentage
 */
export function getMasteryColor(percentage: number): string {
  if (percentage >= 90) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Get mastery text based on percentage
 */
export function getMasteryText(percentage: number): string {
  if (percentage >= 90) return 'Behärskad'
  if (percentage >= 60) return 'Lärande'
  return 'Nybörjare'
}

/**
 * Calculate study plan duration based on skill difficulty
 */
export function calculateStudyDuration(difficulty: 'enkel' | 'medel' | 'svår'): number {
  switch (difficulty) {
    case 'enkel': return 15 // 15 minutes
    case 'medel': return 30 // 30 minutes
    case 'svår': return 45 // 45 minutes
    default: return 30
  }
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Format number with Swedish locale
 */
export function formatNumberSwedish(num: number): string {
  return num.toLocaleString('sv-SE')
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

/**
 * Get subject color
 */
export function getSubjectColor(subjectId: string): string {
  const colors: Record<string, string> = {
    matematik: 'bg-blue-600',
    fysik: 'bg-purple-600',
    svenska: 'bg-green-600',
    engelska: 'bg-red-600',
    kemi: 'bg-orange-600',
    biologi: 'bg-teal-600'
  }
  return colors[subjectId] || 'bg-gray-600'
}

/**
 * Get subject icon
 */
export function getSubjectIcon(subjectId: string): string {
  const icons: Record<string, string> = {
    matematik: 'Calculator',
    fysik: 'Atom',
    svenska: 'BookOpen',
    engelska: 'Globe',
    kemi: 'Beaker',
    biologi: 'Dna'
  }
  return icons[subjectId] || 'BookOpen'
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Load JSON file
 */
export function loadJSONFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
