'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react'
import type { QuizItem, ItemType } from '../../types/domain'

interface ItemRendererProps {
  item: QuizItem
  onSubmit: (answer: string | number) => void
  showResult?: boolean
  userAnswer?: string | number
  isCorrect?: boolean
  timeSpent?: number
}

export function ItemRenderer({ 
  item, 
  onSubmit, 
  showResult = false, 
  userAnswer, 
  isCorrect, 
  timeSpent 
}: ItemRendererProps) {
  const [answer, setAnswer] = useState<string | number>('')
  const [startTime] = useState(Date.now())

  const handleSubmit = () => {
    if (answer !== '') {
      onSubmit(answer)
    }
  }

  const getTimeSpent = () => {
    return Math.round((Date.now() - startTime) / 1000)
  }

  const renderQuestionType = () => {
    switch (item.type) {
      case 'numeric':
        return (
          <NumericQuestion 
            item={item}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={handleSubmit}
            showResult={showResult}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
          />
        )
      
      case 'mcq':
        return (
          <MCQQuestion 
            item={item}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={handleSubmit}
            showResult={showResult}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
          />
        )
      
      case 'flashcard':
        return (
          <FlashcardQuestion 
            item={item}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={handleSubmit}
            showResult={showResult}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
          />
        )
      
      case 'freeText':
        return (
          <FreeTextQuestion 
            item={item}
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={handleSubmit}
            showResult={showResult}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
          />
        )
      
      default:
        return <div>Okänd frågetyp</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Fråga</h3>
              <p className="text-sm text-muted-foreground">
                {item.type === 'numeric' && 'Numerisk fråga'}
                {item.type === 'mcq' && 'Flervalsfråga'}
                {item.type === 'flashcard' && 'Flashcard'}
                {item.type === 'freeText' && 'Fritextfråga'}
              </p>
            </div>
          </div>
          {timeSpent && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{timeSpent}s</span>
            </div>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none">
          <p className="text-base leading-relaxed">{item.question}</p>
        </div>
      </div>

      {/* Question Content */}
      {renderQuestionType()}

      {/* Result Display */}
      {showResult && (
        <div className={`border rounded-lg p-4 ${
          isCorrect 
            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
        }`}>
          <div className="flex items-start space-x-3">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {isCorrect ? 'Rätt!' : 'Fel svar'}
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Ditt svar:</span> {userAnswer}
                </div>
                <div>
                  <span className="font-medium">Rätt svar:</span> {item.correctAnswer}
                </div>
                <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded border">
                  <span className="font-medium">Förklaring:</span>
                  <p className="mt-1">{item.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Numeric Question Component
function NumericQuestion({ 
  item, 
  answer, 
  setAnswer, 
  onSubmit, 
  showResult, 
  userAnswer, 
  isCorrect 
}: any) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="numeric-answer" className="block text-sm font-medium mb-2">
            Ange ditt svar:
          </label>
          <input
            id="numeric-answer"
            type="number"
            step="any"
            value={answer}
            onChange={(e) => setAnswer(parseFloat(e.target.value) || '')}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ange ett tal..."
            disabled={showResult}
          />
        </div>
        
        {!showResult && (
          <button
            onClick={onSubmit}
            disabled={answer === ''}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skicka svar
          </button>
        )}
      </div>
    </div>
  )
}

// MCQ Question Component
function MCQQuestion({ 
  item, 
  answer, 
  setAnswer, 
  onSubmit, 
  showResult, 
  userAnswer, 
  isCorrect 
}: any) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-3">
            Välj ditt svar:
          </label>
          <div className="space-y-2">
            {item.options?.map((option: string, index: number) => (
              <label
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  showResult
                    ? option === item.correctAnswer
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : option === userAnswer && !isCorrect
                      ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    : answer === option
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent border-border'
                }`}
              >
                <input
                  type="radio"
                  name="mcq-answer"
                  value={option}
                  checked={answer === option}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={showResult}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  showResult
                    ? option === item.correctAnswer
                      ? 'border-green-600 bg-green-600'
                      : option === userAnswer && !isCorrect
                      ? 'border-red-600 bg-red-600'
                      : 'border-gray-300'
                    : answer === option
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {answer === option && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="flex-1">{option}</span>
                {showResult && option === item.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {showResult && option === userAnswer && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </label>
            ))}
          </div>
        </div>
        
        {!showResult && (
          <button
            onClick={onSubmit}
            disabled={answer === ''}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skicka svar
          </button>
        )}
      </div>
    </div>
  )
}

// Flashcard Question Component
function FlashcardQuestion({ 
  item, 
  answer, 
  setAnswer, 
  onSubmit, 
  showResult, 
  userAnswer, 
  isCorrect 
}: any) {
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-4">
        <div className="text-center">
          <div className="bg-primary/10 rounded-lg p-6 mb-4">
            <h4 className="text-lg font-semibold mb-2">Fråga</h4>
            <p className="text-base">{item.question}</p>
          </div>
          
          {showAnswer && (
            <div className="bg-secondary/50 rounded-lg p-6 mb-4">
              <h4 className="text-lg font-semibold mb-2">Svar</h4>
              <p className="text-base">{item.correctAnswer}</p>
            </div>
          )}
        </div>
        
        {!showResult && (
          <div className="space-y-3">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="btn-secondary w-full"
              >
                Visa svar
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="flashcard-answer" className="block text-sm font-medium mb-2">
                    Hur väl kunde du svara på frågan?
                  </label>
                  <select
                    id="flashcard-answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Välj...</option>
                    <option value="perfect">Perfekt - kunde svara direkt</option>
                    <option value="good">Bra - kunde svara efter lite tänkande</option>
                    <option value="okay">Okej - kunde svara med hjälp</option>
                    <option value="poor">Dåligt - kunde inte svara</option>
                  </select>
                </div>
                <button
                  onClick={onSubmit}
                  disabled={answer === ''}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skicka bedömning
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Free Text Question Component
function FreeTextQuestion({ 
  item, 
  answer, 
  setAnswer, 
  onSubmit, 
  showResult, 
  userAnswer, 
  isCorrect 
}: any) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="freetext-answer" className="block text-sm font-medium mb-2">
            Skriv ditt svar:
          </label>
          <textarea
            id="freetext-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-vertical"
            placeholder="Skriv ditt svar här..."
            disabled={showResult}
          />
        </div>
        
        {!showResult && (
          <button
            onClick={onSubmit}
            disabled={answer.trim() === ''}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skicka svar
          </button>
        )}
      </div>
    </div>
  )
}
