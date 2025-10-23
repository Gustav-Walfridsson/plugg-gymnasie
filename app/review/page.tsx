'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle, BookOpen, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useAuth } from '../../lib/auth-simple'
import { supabase } from '../../lib/supabase-client'
import { analyticsEngine } from '../../lib/analytics'

interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  difficulty: string
  skill_id: string
}

export default function ReviewPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([])
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, accountId } = useAuth()

  useEffect(() => {
    if (!accountId) {
      console.log('No accountId available, using fallback flashcards')
      // Use fallback flashcards immediately if no accountId
      const fallbackCards: Flashcard[] = [
        { id: 'fallback-1', front: 'Apple', back: 'Äpple', category: 'Engelska', difficulty: 'easy', skill_id: 'basic-vocab' },
        { id: 'fallback-2', front: 'Beautiful', back: 'Vacker', category: 'Engelska', difficulty: 'medium', skill_id: 'basic-vocab' },
        { id: 'fallback-3', front: 'Courage', back: 'Mod', category: 'Engelska', difficulty: 'medium', skill_id: 'basic-vocab' },
        { id: 'fallback-4', front: 'Mitokondrier', back: 'Cellens kraftverk - producerar ATP', category: 'Biologi', difficulty: 'hard', skill_id: 'dna-struktur' },
        { id: 'fallback-5', front: 'DNA', back: 'Deoxyribonukleinsyra - bär genetisk information', category: 'Biologi', difficulty: 'medium', skill_id: 'dna-struktur' }
      ]
      const shuffled = [...fallbackCards].sort(() => Math.random() - 0.5)
      setSessionCards(shuffled)
      setLoading(false)
      return
    }

    const fetchFlashcards = async () => {
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
            prompt as front,
            explanation as back,
            difficulty,
            tags,
            skills!inner(
              id,
              name,
              subjects!inner(
                id,
                name
              )
            )
          `)
          .eq('type', 'flashcard')
          .limit(20) // Limit to 20 cards for a session

        const { data: flashcards, error: flashcardsError } = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as any

        if (flashcardsError) {
          console.warn('Database error, using fallback flashcards:', flashcardsError)
          // Use fallback flashcards if database error occurs
          const fallbackCards: Flashcard[] = [
            { id: 'fallback-1', front: 'Apple', back: 'Äpple', category: 'Engelska', difficulty: 'easy', skill_id: 'basic-vocab' },
            { id: 'fallback-2', front: 'Beautiful', back: 'Vacker', category: 'Engelska', difficulty: 'medium', skill_id: 'basic-vocab' },
            { id: 'fallback-3', front: 'Courage', back: 'Mod', category: 'Engelska', difficulty: 'medium', skill_id: 'basic-vocab' },
            { id: 'fallback-4', front: 'Mitokondrier', back: 'Cellens kraftverk - producerar ATP', category: 'Biologi', difficulty: 'hard', skill_id: 'dna-struktur' },
            { id: 'fallback-5', front: 'DNA', back: 'Deoxyribonukleinsyra - bär genetisk information', category: 'Biologi', difficulty: 'medium', skill_id: 'dna-struktur' }
          ]
          const shuffled = [...fallbackCards].sort(() => Math.random() - 0.5)
          setSessionCards(shuffled)
          return
        }

        if (!flashcards || flashcards.length === 0) {
          console.warn('No flashcards found in database, using fallback flashcards')
          // Use fallback flashcards if no data exists
          const fallbackCards: Flashcard[] = [
            { id: 'fallback-1', front: 'Apple', back: 'Äpple', category: 'Engelska', difficulty: 'easy', skill_id: 'basic-vocab' },
            { id: 'fallback-2', front: 'Beautiful', back: 'Vacker', category: 'Engelska', difficulty: 'medium', skill_id: 'basic-vocab' },
            { id: 'fallback-3', front: 'Courage', back: 'Mod', category: 'Engelska', difficulty: 'medium', skill_id: 'basic-vocab' },
            { id: 'fallback-4', front: 'Mitokondrier', back: 'Cellens kraftverk - producerar ATP', category: 'Biologi', difficulty: 'hard', skill_id: 'dna-struktur' },
            { id: 'fallback-5', front: 'DNA', back: 'Deoxyribonukleinsyra - bär genetisk information', category: 'Biologi', difficulty: 'medium', skill_id: 'dna-struktur' }
          ]
          const shuffled = [...fallbackCards].sort(() => Math.random() - 0.5)
          setSessionCards(shuffled)
          return
        }

        // Transform data to match Flashcard interface
        const transformedCards: Flashcard[] = flashcards.map(card => ({
          id: card.id,
          front: card.front,
          back: card.back,
          category: card.skills.subjects.name,
          difficulty: card.difficulty === 1 ? 'easy' : card.difficulty === 2 ? 'medium' : 'hard',
          skill_id: card.skills.id
        }))

        // Shuffle cards
        const shuffled = [...transformedCards].sort(() => Math.random() - 0.5)
        setSessionCards(shuffled)
      } catch (err) {
        console.error('Error fetching flashcards:', err)
        console.warn('Using fallback flashcards due to error')
        
        // Use fallback flashcards if any error occurs
        const fallbackCards: Flashcard[] = [
          { id: 'fallback-1', front: 'Apple', back: 'Äpple', category: 'Engelska', difficulty: 'easy', skill_id: 'basic-vocab' },
          { id: 'fallback-2', front: 'Beautiful', back: 'Vacker', category: 'Engelska', difficulty: 'medium', skill_id: 'basic-vocab' },
          { id: 'fallback-3', front: 'Courage', back: 'Mod', category: 'Engelska', difficulty: 'medium', skill_id: 'basic-vocab' },
          { id: 'fallback-4', front: 'Mitokondrier', back: 'Cellens kraftverk - producerar ATP', category: 'Biologi', difficulty: 'hard', skill_id: 'dna-struktur' },
          { id: 'fallback-5', front: 'DNA', back: 'Deoxyribonukleinsyra - bär genetisk information', category: 'Biologi', difficulty: 'medium', skill_id: 'dna-struktur' }
        ]
        const shuffled = [...fallbackCards].sort(() => Math.random() - 0.5)
        setSessionCards(shuffled)
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcards()
  }, [accountId, supabase])

  const currentCard = sessionCards[currentCardIndex]
  const progress = sessionCards.length > 0 ? ((currentCardIndex + 1) / sessionCards.length) * 100 : 0

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentCard || !accountId) return

    try {
      // Record the attempt in the database
      const { error } = await supabase
        .from('attempts')
        .insert({
          account_id: accountId,
          skill_id: currentCard.skill_id,
          item_id: currentCard.id,
          is_correct: isCorrect,
          answer: { flashcard: true, userAnswer: isCorrect }, // Required jsonb field
          time_spent: 0, // We don't track response time for flashcards
          timestamp: new Date().toISOString()
        })

      if (error) {
        console.error('Error recording attempt:', error)
      }

      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1)
        setStreak(prev => prev + 1)
      } else {
        setStreak(0)
      }

      // Track analytics
      if (user) {
        try {
          await analyticsEngine.itemAnswered(
            user.id,
            currentCard.id,
            currentCard.skill_id,
            isCorrect,
            0 // No time tracking for flashcards
          )
          console.log('📊 Analytics tracked for flashcard answer')
        } catch (error) {
          console.error('❌ Error tracking flashcard analytics:', error)
        }
      }

      // Move to next card
      if (currentCardIndex < sessionCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1)
        setShowAnswer(false)
      } else {
        setSessionComplete(true)
      }
    } catch (err) {
      console.error('Error handling answer:', err)
    }
  }

  const resetSession = () => {
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setCorrectAnswers(0)
    setSessionComplete(false)
    setStreak(0)
    // Shuffle cards again
    const shuffled = [...sessionCards].sort(() => Math.random() - 0.5)
    setSessionCards(shuffled)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Logga in krävs</h1>
          <p className="text-gray-600 mb-6">Du måste logga in för att använda flashcards.</p>
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
          <p className="text-gray-600">Laddar flashcards...</p>
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

  if (sessionCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Inga flashcards tillgängliga</h1>
          <p className="text-gray-600 mb-6">Det finns inga flashcards att träna med just nu.</p>
          <Link href="/study" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Utforska ämnen
          </Link>
        </div>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = Math.round((correctAnswers / sessionCards.length) * 100)
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session slutförd!</h1>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Kort genomgångna:</span>
              <span className="font-semibold">{sessionCards.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rätt svar:</span>
              <span className="font-semibold text-green-600">{correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Noggrannhet:</span>
              <span className="font-semibold">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nuvarande streak:</span>
              <span className="font-semibold text-blue-600">{streak}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={resetSession}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Börja om session
            </button>
            <Link
              href="/study"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors inline-block"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Tillbaka till studier
            </Link>
          </div>
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
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentCardIndex + 1} av {sessionCards.length}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px] flex flex-col">
          {/* Card Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
                {currentCard.category}
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-8">
                {showAnswer ? currentCard.back : currentCard.front}
              </div>
            </div>

            {/* Answer Buttons */}
            {showAnswer ? (
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Fel
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Rätt
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-5 h-5 inline mr-2" />
                  Visa svar
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Rätt: {correctAnswers}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-blue-500" />
                Streak: {streak}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}