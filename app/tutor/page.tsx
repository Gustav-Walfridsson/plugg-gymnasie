'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bot, Lightbulb, Eye, EyeOff, CheckCircle, XCircle, Clock, Target, BookOpen } from 'lucide-react'
import { tutorEngine } from '../../lib/tutor'
import { masteryEngine } from '../../lib/mastery'
import { useAuth } from '../../lib/auth-simple'
import { supabase } from '../../lib/supabase-client'
import { analyticsEngine } from '../../lib/analytics'
import type { QuizItem } from '../../types/domain'
import type { TutorState, TutorHint } from '../../lib/tutor'

export default function TutorPage() {
  const [tutorState, setTutorState] = useState<TutorState | null>(null)
  const [currentHint, setCurrentHint] = useState<TutorHint | null>(null)
  const [hasAttempted, setHasAttempted] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [userAnswer, setUserAnswer] = useState<string | number>('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [currentItem, setCurrentItem] = useState<QuizItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, accountId } = useAuth()

  useEffect(() => {
    if (!accountId) {
      console.log('No accountId available, using fallback item')
      // Use fallback item immediately if no accountId
      const fallbackItem: QuizItem = {
        id: 'fallback-tutor-item',
        skillId: 'variabler-uttryck',
        question: 'Vad är värdet av uttrycket 3x + 5 när x = 4?',
        type: 'numeric',
        correctAnswer: 17,
        explanation: 'Substituera x = 4: 3(4) + 5 = 12 + 5 = 17',
        difficulty: 'enkel'
      }
      setCurrentItem(fallbackItem)
      const state = tutorEngine.initializeTutorSession(fallbackItem, 'fallback-user')
      setTutorState(state)
      setLoading(false)
      return
    }

    const fetchPracticeItem = async () => {
      try {
        setLoading(true)
        setError(null)

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )

        const fetchPromise = supabase
          .from('items')
          .select(`
            id,
            skill_id,
            type,
            prompt,
            latex,
            answer,
            explanation,
            difficulty,
            skills!inner(
              id,
              name,
              difficulty as skill_difficulty
            )
          `)
          .in('type', ['numeric', 'multiple_choice', 'text'])
          .limit(20) // Fetch more items for better randomization

        const { data: items, error: itemsError } = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as any

        if (itemsError) {
          console.warn('Database error, using fallback item:', itemsError)
          // Use fallback practice item if database error occurs
          const fallbackItem: QuizItem = {
            id: 'fallback-tutor-item',
            skillId: 'variabler-uttryck',
            question: 'Vad är värdet av uttrycket 3x + 5 när x = 4?',
            type: 'numeric',
            correctAnswer: 17,
            explanation: 'Substituera x = 4: 3(4) + 5 = 12 + 5 = 17',
            difficulty: 'enkel'
          }
          setCurrentItem(fallbackItem)
          const state = tutorEngine.initializeTutorSession(fallbackItem, accountId!)
          setTutorState(state)
          return
        }

        if (!items || items.length === 0) {
          console.warn('No practice items found in database, using fallback item')
          // Use fallback practice item if no data exists
          const fallbackItem: QuizItem = {
            id: 'fallback-tutor-item',
            skillId: 'variabler-uttryck',
            question: 'Vad är värdet av uttrycket 3x + 5 när x = 4?',
            type: 'numeric',
            correctAnswer: 17,
            explanation: 'Substituera x = 4: 3(4) + 5 = 12 + 5 = 17',
            difficulty: 'enkel'
          }
          setCurrentItem(fallbackItem)
          const state = tutorEngine.initializeTutorSession(fallbackItem, accountId!)
          setTutorState(state)
          return
        }

        // Client-side shuffle for random selection
        const shuffled = [...items].sort(() => Math.random() - 0.5)
        const item = shuffled[0]
        
        // Transform database item to QuizItem format
        const quizItem: QuizItem = {
          id: item.id,
          skillId: item.skill_id,
          question: item.prompt,
          type: item.type as 'numeric' | 'multiple_choice' | 'text',
          correctAnswer: item.answer.value || item.answer,
          explanation: item.explanation,
          difficulty: item.skills.skill_difficulty
        }

        setCurrentItem(quizItem)

        // Initialize tutor session
        const state = tutorEngine.initializeTutorSession(quizItem, accountId)
        setTutorState(state)
      } catch (err) {
        console.error('Error fetching practice item:', err)
        console.warn('Using fallback practice item due to error')
        
        // Use fallback practice item if any error occurs
        const fallbackItem: QuizItem = {
          id: 'fallback-tutor-item',
          skillId: 'variabler-uttryck',
          question: 'Vad är värdet av uttrycket 3x + 5 när x = 4?',
          type: 'numeric',
          correctAnswer: 17,
          explanation: 'Substituera x = 4: 3(4) + 5 = 12 + 5 = 17',
          difficulty: 'enkel'
        }
        setCurrentItem(fallbackItem)
        const state = tutorEngine.initializeTutorSession(fallbackItem, accountId!)
        setTutorState(state)
      } finally {
        setLoading(false)
      }
    }

    fetchPracticeItem()
  }, [accountId, supabase])

  const handleRevealHint = () => {
    if (tutorState && currentItem) {
      const hint = tutorEngine.revealNextHint(currentItem.id, accountId!)
      if (hint) {
        setCurrentHint(hint)
        setTutorState(tutorEngine.getTutorState(currentItem.id, accountId!))
      }
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentItem || !accountId || userAnswer === '') return

    const correct = Number(userAnswer) === Number(currentItem.correctAnswer)
    setIsCorrect(correct)
    setHasAttempted(true)

    try {
      // Record the attempt in the database
      const { error } = await supabase
        .from('attempts')
        .insert({
          account_id: accountId,
          skill_id: currentItem.skillId,
          item_id: currentItem.id,
          is_correct: correct,
          time_spent: 0, // We don't track response time for tutor
          timestamp: new Date().toISOString()
        })

      if (error) {
        console.error('Error recording attempt:', error)
      }

      // Update mastery state
      if (correct) {
        const newMastery = masteryEngine.updateMastery(
          currentItem.skillId,
          accountId,
          true,
          0 // No response time for tutor
        )
        
        // Save mastery state to database
        const { error: masteryError } = await supabase
          .from('mastery_states')
          .upsert({
            account_id: accountId,
            skill_id: currentItem.skillId,
            probability: newMastery.probability,
            updated_at: new Date().toISOString()
          })

        if (masteryError) {
          console.error('Error updating mastery:', masteryError)
        }
      }

      // Update tutor state
      if (tutorState) {
        const updatedState = tutorEngine.recordAttempt(currentItem.id, accountId, correct)
        setTutorState(updatedState)
      }
      
      // Track analytics
      if (user) {
        try {
          await analyticsEngine.itemAnswered(
            user.id,
            currentItem.id,
            currentItem.skillId,
            correct,
            0 // No time tracking for tutor
          )
          console.log('📊 Analytics tracked for tutor answer')
        } catch (error) {
          console.error('❌ Error tracking tutor analytics:', error)
        }
      }
    } catch (err) {
      console.error('Error handling answer submission:', err)
    }
  }

  const handleNextQuestion = () => {
    // Reset state for next question
    setHasAttempted(false)
    setShowSolution(false)
    setUserAnswer('')
    setIsCorrect(false)
    setCurrentHint(null)
    
    // Fetch a new question
    window.location.reload()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Logga in krävs</h1>
          <p className="text-gray-600 mb-6">Du måste logga in för att använda tutorn.</p>
          <Link href="/auth/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Logga in
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar övningsuppgift...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ett fel uppstod</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Försök igen
          </button>
        </div>
      </div>
    )
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ingen övningsuppgift tillgänglig</h1>
          <p className="text-gray-600 mb-6">Det finns inga övningsuppgifter att träna med just nu.</p>
          <Link href="/study" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Utforska ämnen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/study" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Tillbaka
            </Link>
            
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold">AI Tutor</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Övningsuppgift</h2>
                  <div className="text-sm text-gray-500">
                    Svårighetsgrad: {currentItem.difficulty}
                  </div>
                </div>
                
                <div className="text-lg mb-6">
                  {currentItem.question}
                </div>

                {/* Answer Input */}
                <div className="mb-6">
                  <input
                    type={currentItem.type === 'numeric' ? 'number' : 'text'}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Ditt svar..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={hasAttempted}
                  />
                </div>

                {/* Submit Button */}
                {!hasAttempted && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={userAnswer === ''}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Skicka svar
                  </button>
                )}

                {/* Answer Feedback */}
                {hasAttempted && (
                  <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="flex items-center mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 mr-2" />
                      )}
                      <span className="font-semibold">
                        {isCorrect ? 'Rätt!' : 'Fel svar'}
                      </span>
                    </div>
                    <p className="text-sm">
                      {isCorrect ? 'Bra jobbat!' : `Rätt svar: ${currentItem.correctAnswer}`}
                    </p>
                    <p className="text-sm mt-2">{currentItem.explanation}</p>
                  </div>
                )}

                {/* Next Question Button */}
                {hasAttempted && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Nästa fråga
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tutor Panel */}
          <div className="space-y-6">
            {/* Hint Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Hjälp & Tips
              </h3>
              
              {currentHint ? (
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">{currentHint.content}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tips {tutorState?.hintsRevealed || 0} av {tutorState?.totalHints || 0}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">Behöver du hjälp?</p>
                  <button
                    onClick={handleRevealHint}
                    disabled={hasAttempted || (tutorState?.hintsRevealed || 0) >= (tutorState?.totalHints || 0)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Visa tips
                  </button>
                </div>
              )}
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-500" />
                Framsteg
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Behärskning</span>
                    <span>{Math.round((tutorState?.masteryLevel || 0) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(tutorState?.masteryLevel || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Försök: {tutorState?.attempts || 0}</p>
                  <p>Tips använda: {tutorState?.hintsRevealed || 0}</p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                Statistik
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Rätt svar:</span>
                  <span className="font-semibold text-green-600">
                    {tutorState?.correctAttempts || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fel svar:</span>
                  <span className="font-semibold text-red-600">
                    {(tutorState?.attempts || 0) - (tutorState?.correctAttempts || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Noggrannhet:</span>
                  <span className="font-semibold">
                    {tutorState?.attempts ? Math.round(((tutorState.correctAttempts || 0) / tutorState.attempts) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}