/**
 * Centralized Error Handler Utility
 * Provides consistent error handling across the application
 */

export interface ErrorContext {
  component: string
  action: string
  userId?: string
  accountId?: string
  additionalData?: Record<string, any>
}

export interface ErrorDetails {
  message: string
  code?: string
  details?: string
  hint?: string
  context: ErrorContext
  timestamp: string
  userAgent?: string
}

/**
 * Sanitize error message for user display
 * Removes sensitive information and provides user-friendly messages
 */
export function sanitizeErrorMessage(error: any, context: ErrorContext): string {
  // Database errors
  if (error?.code === 'PGRST100') {
    return 'Databasfel: Ogiltig SQL-syntax'
  }
  if (error?.code === 'PGRST116') {
    return 'Databasfel: Tabell eller kolumn finns inte'
  }
  if (error?.code === '23505') {
    return 'Databasfel: Duplicerad data'
  }
  
  // Authentication errors
  if (error?.message?.includes('Auth session missing')) {
    return 'Din session har gått ut. Logga in igen.'
  }
  if (error?.message?.includes('Unauthorized')) {
    return 'Du har inte behörighet att utföra denna åtgärd.'
  }
  
  // Network errors
  if (error?.message?.includes('fetch')) {
    return 'Nätverksfel: Kontrollera din internetanslutning.'
  }
  if (error?.message?.includes('timeout')) {
    return 'Begäran tog för lång tid. Försök igen.'
  }
  
  // Generic fallback
  return 'Ett oväntat fel uppstod. Försök igen.'
}

/**
 * Create detailed error information for logging
 */
export function createErrorDetails(error: any, context: ErrorContext): ErrorDetails {
  return {
    message: error?.message || 'Unknown error',
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
  }
}

/**
 * Log error with context for debugging
 */
export function logError(error: any, context: ErrorContext): void {
  const errorDetails = createErrorDetails(error, context)
  const sanitizedMessage = sanitizeErrorMessage(error, context)
  
  console.error(`❌ Error in ${context.component}.${context.action}:`, {
    ...errorDetails,
    sanitizedMessage,
    originalError: error
  })
  
  // In production, you would send this to an error reporting service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorReporting(errorDetails)
  }
}

/**
 * Handle error with user-friendly message and logging
 */
export function handleError(error: any, context: ErrorContext): string {
  logError(error, context)
  return sanitizeErrorMessage(error, context)
}

/**
 * Create error context for a component
 */
export function createErrorContext(component: string, action: string, additionalData?: Record<string, any>): ErrorContext {
  return {
    component,
    action,
    additionalData
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallback?: T
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    const message = handleError(error, context)
    console.error(`Safe async operation failed: ${message}`)
    return fallback || null
  }
}

/**
 * Error boundary helper for React components
 */
export function createErrorState(error: any, context: ErrorContext) {
  return {
    hasError: true,
    errorMessage: sanitizeErrorMessage(error, context),
    errorDetails: createErrorDetails(error, context)
  }
}
