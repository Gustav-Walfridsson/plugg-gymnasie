'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Target, CheckCircle, XCircle, RotateCcw, BookOpen, Brain } from 'lucide-react'
import { useAuth } from '../../../lib/auth-simple'
import { progressManager } from '../../../lib/progress-manager'

interface QuizItem {
  id: string
  skillId: string
  question: string
  type: 'mcq' | 'freeText' | 'numeric'
  options?: string[]
  correctAnswer: string | number
  explanation: string
  difficulty: 'enkel' | 'medel' | 'svår'
}

interface PracticePageProps {
  params: Promise<{
    skillId: string
  }>
}

// SIMPLE QUESTIONS - NO COMPLEX LOADING
const getQuestionsForSkill = (skillId: string): QuizItem[] => {
  const questions: Record<string, QuizItem[]> = {
    'variabler-uttryck': [
      {
        id: 'q1',
        skillId: 'variabler-uttryck',
        question: 'Vad är värdet av uttrycket 3x + 5 när x = 4?',
        type: 'numeric',
        correctAnswer: 17,
        explanation: 'Substituera x = 4: 3(4) + 5 = 12 + 5 = 17',
        difficulty: 'enkel'
      },
      {
        id: 'q2',
        skillId: 'variabler-uttryck',
        question: 'Vilket av följande är ett algebraiskt uttryck?',
        type: 'mcq',
        options: ['2 + 3 = 5', '3x + 2y', 'x = 5', '2 > 3'],
        correctAnswer: '3x + 2y',
        explanation: 'Ett algebraiskt uttryck innehåller variabler och operationer, men ingen likhetstecken.',
        difficulty: 'enkel'
      },
      {
        id: 'q3',
        skillId: 'variabler-uttryck',
        question: 'Förenkla uttrycket: 2x + 3x - x',
        type: 'freeText',
        correctAnswer: '4x',
        explanation: 'Kombinera liknande termer: 2x + 3x - x = (2 + 3 - 1)x = 4x',
        difficulty: 'medel'
      }
    ],
    'enkla-ekvationer': [
      {
        id: 'q1',
        skillId: 'enkla-ekvationer',
        question: 'Lös ekvationen: x + 5 = 10',
        type: 'numeric',
        correctAnswer: 5,
        explanation: 'x + 5 = 10 → x = 10 - 5 → x = 5',
        difficulty: 'enkel'
      },
      {
        id: 'q2',
        skillId: 'enkla-ekvationer',
        question: 'Lös ekvationen: 2x = 8',
        type: 'numeric',
        correctAnswer: 4,
        explanation: '2x = 8 → x = 8 ÷ 2 → x = 4',
        difficulty: 'enkel'
      }
    ],
    'parenteser': [
      {
        id: 'q1',
        skillId: 'parenteser',
        question: 'Förenkla uttrycket: 2(x + 3)',
        type: 'freeText',
        correctAnswer: '2x + 6',
        explanation: 'Multiplicera in 2: 2(x + 3) = 2·x + 2·3 = 2x + 6',
        difficulty: 'medel'
      }
    ],
    'krafter': [
      {
        id: 'q1',
        skillId: 'krafter',
        question: 'Vilka typer av krafter finns det?',
        type: 'mcq',
        options: ['Kontaktkrafter och avståndskrafter', 'Bara tyngdkraft', 'Bara friktion', 'Bara normalkraft'],
        correctAnswer: 'Kontaktkrafter och avståndskrafter',
        explanation: 'Krafter kan vara kontaktkrafter (friktion, normalkraft) eller avståndskrafter (tyngdkraft, magnetkraft).',
        difficulty: 'medel'
      }
    ],
    'energi': [
      {
        id: 'q1',
        skillId: 'energi',
        question: 'Förklara skillnaden mellan kinetisk och potentiell energi',
        type: 'freeText',
        correctAnswer: 'Kinetisk energi är rörelseenergi, potentiell energi är lägesenergi',
        explanation: 'Kinetisk energi har föremål i rörelse, potentiell energi har föremål på grund av sin position.',
        difficulty: 'svår'
      }
    ],
    'grammatik': [
      {
        id: 'q1',
        skillId: 'grammatik',
        question: 'Vad är skillnaden mellan substantiv och verb?',
        type: 'freeText',
        correctAnswer: 'Substantiv är namn på personer, djur, ting eller begrepp. Verb beskriver handlingar eller tillstånd.',
        explanation: 'Substantiv är ord som namnger något, verb är ord som beskriver vad som händer.',
        difficulty: 'enkel'
      }
    ],
    'stavning': [
      {
        id: 'q1',
        skillId: 'stavning',
        question: 'Stava rätt: "förståelse" eller "förståelse"?',
        type: 'mcq',
        options: ['förståelse', 'förståelse', 'förståelse', 'förståelse'],
        correctAnswer: 'förståelse',
        explanation: 'Rätt stavning är "förståelse" med två s.',
        difficulty: 'medel'
      }
    ],
    'vocabulary': [
      {
        id: 'q1',
        skillId: 'vocabulary',
        question: 'What does "beautiful" mean?',
        type: 'mcq',
        options: ['vacker', 'ful', 'stor', 'liten'],
        correctAnswer: 'vacker',
        explanation: '"Beautiful" means "vacker" in Swedish.',
        difficulty: 'enkel'
      }
    ],
    'grammar': [
      {
        id: 'q1',
        skillId: 'grammar',
        question: 'Choose the correct form: "I am" or "I is"?',
        type: 'mcq',
        options: ['I am', 'I is', 'I are', 'I be'],
        correctAnswer: 'I am',
        explanation: 'The correct form is "I am" - first person singular uses "am".',
        difficulty: 'enkel'
      }
    ],
    'kovalenta-bindningar': [
      {
        id: 'q1',
        skillId: 'kovalenta-bindningar',
        question: 'Vad är en kovalent bindning?',
        type: 'freeText',
        correctAnswer: 'En bindning där atomer delar elektroner',
        explanation: 'Kovalenta bindningar bildas när atomer delar elektroner för att uppnå stabil elektronkonfiguration.',
        difficulty: 'medel'
      }
    ],
    'jonbindningar': [
      {
        id: 'q1',
        skillId: 'jonbindningar',
        question: 'Förklara skillnaden mellan kovalenta och jonbindningar',
        type: 'freeText',
        correctAnswer: 'Kovalenta bindningar delar elektroner, jonbindningar överför elektroner',
        explanation: 'Kovalenta bindningar: atomer delar elektroner. Jonbindningar: metaller överför elektroner till icke-metaller.',
        difficulty: 'svår'
      }
    ],
    'dna-struktur': [
      {
        id: 'q1',
        skillId: 'dna-struktur',
        question: 'Vilka är de fyra nukleotiderna i DNA?',
        type: 'mcq',
        options: ['A, T, G, C', 'A, U, G, C', '1, 2, 3, 4', 'X, Y, Z, W'],
        correctAnswer: 'A, T, G, C',
        explanation: 'DNA består av fyra nukleotider: Adenin (A), Tymin (T), Guanin (G) och Cytosin (C).',
        difficulty: 'enkel'
      }
    ],
    'genetisk-kod': [
      {
        id: 'q1',
        skillId: 'genetisk-kod',
        question: 'Vad är en kodon?',
        type: 'freeText',
        correctAnswer: 'En triplett av nukleotider som kodar för en aminosyra',
        explanation: 'En kodon är en sekvens av tre nukleotider som kodar för en specifik aminosyra i proteinsyntes.',
        difficulty: 'svår'
      }
    ]
  }

  return questions[skillId] || [
    {
      id: 'fallback-1',
      skillId,
      question: `Övningsfråga för ${skillId}`,
      type: 'freeText',
      correctAnswer: 'Detta är ett exempel på rätt svar',
      explanation: `Detta är en fallback-fråga för färdigheten ${skillId}.`,
      difficulty: 'enkel'
    }
  ]
}

export default function PracticePage({ params }: PracticePageProps) {
  const { user } = useAuth()
  const [skillId, setSkillId] = useState<string>('')
  const [questions, setQuestions] = useState<QuizItem[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<(string | number)[]>([])
  const [results, setResults] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [streak, setStreak] = useState(0)
  const [totalXP, setTotalXP] = useState(0)

  // SIMPLE LOADING - NO COMPLEX ASYNC OPERATIONS
  useEffect(() => {
    const loadData = async () => {
      try {
        const { skillId: resolvedSkillId } = await params
        setSkillId(resolvedSkillId)
        
        const skillQuestions = getQuestionsForSkill(resolvedSkillId)
        setQuestions(skillQuestions)
        setUserAnswers(new Array(skillQuestions.length).fill(''))
        setResults(new Array(skillQuestions.length).fill(false))
      } catch (error) {
        console.error('Error loading practice data:', error)
        // Set fallback data
        setSkillId('unknown')
        setQuestions([{
          id: 'error-1',
          skillId: 'unknown',
          question: 'Ett fel uppstod vid laddning av övningar.',
          type: 'freeText',
          correctAnswer: 'Försök igen',
          explanation: 'Ladda om sidan för att försöka igen.',
          difficulty: 'enkel'
        }])
        setUserAnswers([''])
        setResults([false])
      }
    }
    
    loadData()
  }, [params])

  const currentQuestion = questions[currentQuestionIndex]
  const currentResult = results[currentQuestionIndex]

  const handleAnswerSubmit = async (answer: string | number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)

    const isCorrect = checkAnswer(answer, currentQuestion)
    const newResults = [...results]
    newResults[currentQuestionIndex] = isCorrect
    setResults(newResults)

    setShowResult(true)

    if (isCorrect) {
      setStreak(prev => prev + 1)
      const xpGained = getXPForDifficulty(currentQuestion.difficulty)
      setTotalXP(prev => prev + xpGained)
      
      // Save progress using ProgressManager
      if (user) {
        try {
          console.log('💾 Saving progress for skill:', skillId)
          await progressManager.updateProgress(user.id, skillId, true)
          console.log('✅ Progress saved successfully')
        } catch (error) {
          console.error('❌ Error saving progress:', error)
        }
      }
    } else {
      setStreak(0)
      
      // Save progress for incorrect answers too
      if (user) {
        try {
          console.log('💾 Saving progress for incorrect answer:', skillId)
          await progressManager.updateProgress(user.id, skillId, false)
        } catch (error) {
          console.error('❌ Error saving progress:', error)
        }
      }
    }
  }

  const checkAnswer = (userAnswer: string | number, question: QuizItem): boolean => {
    if (question.type === 'numeric') {
      return Math.abs(Number(userAnswer) - Number(question.correctAnswer)) < 0.01
    } else if (question.type === 'freeText') {
      return userAnswer.toString().toLowerCase().trim() === question.correctAnswer.toString().toLowerCase().trim()
    } else {
      return userAnswer === question.correctAnswer
    }
  }

  const getXPForDifficulty = (difficulty: string): number => {
    switch (difficulty) {
      case 'enkel': return 10
      case 'medel': return 20
      case 'svår': return 30
      default: return 10
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowResult(false)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowResult(false)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers(new Array(questions.length).fill(''))
    setResults(new Array(questions.length).fill(false))
    setShowResult(false)
    setIsCompleted(false)
  }

  const getScore = () => {
    const correctCount = results.filter(r => r).length
    return Math.round((correctCount / questions.length) * 100)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'enkel': return 'text-green-500'
      case 'medel': return 'text-yellow-500'
      case 'svår': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  // LOADING STATE - ONLY WHILE SKILLID IS EMPTY
  if (!skillId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-accent rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Laddar...</h1>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Förbereder övningsfrågor...</p>
        </div>
      </div>
    )
  }

  // NO QUESTIONS FOUND
  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-accent rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Öva</h1>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">Inga övningar tillgängliga för denna färdighet.</p>
        </div>
      </div>
    )
  }

  // COMPLETION SCREEN
  if (isCompleted) {
    const score = getScore()
    const correctCount = results.filter(r => r).length
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-accent rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Övning slutförd</h1>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg inline-block">
              <Target className="w-8 h-8 text-primary mx-auto" />
            </div>
            <h2 className="text-2xl font-bold">Bra jobbat!</h2>
            <p className="text-muted-foreground">Du har slutfört övningen för {skillId}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{score}%</div>
              <div className="text-sm text-muted-foreground">Poäng</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{correctCount}/{questions.length}</div>
              <div className="text-sm text-muted-foreground">Rätta svar</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{totalXP}</div>
              <div className="text-sm text-muted-foreground">XP</div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button onClick={handleRestart} className="btn-primary">
              <RotateCcw className="w-4 h-4 mr-2" />
              Börja om
            </button>
            <Link href={`/lesson/${skillId}`} className="btn-secondary">
              <BookOpen className="w-4 h-4 mr-2" />
              Läs lektion
            </Link>
            <Link href="/" className="btn-outline">
              Tillbaka till hem
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // MAIN PRACTICE INTERFACE
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/" className="p-2 hover:bg-accent rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Öva</h1>
      </div>
      
      {/* Progress Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Övning för {skillId}</h2>
              <p className="text-sm text-muted-foreground">
                Fråga {currentQuestionIndex + 1} av {questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Streak</div>
              <div className="font-semibold text-orange-500">{streak}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">XP</div>
              <div className="font-semibold text-blue-500">{totalXP}</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="space-y-4">
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Fråga {currentQuestionIndex + 1}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(currentQuestion.difficulty)} bg-secondary`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getXPForDifficulty(currentQuestion.difficulty)} XP
                </span>
              </div>
            </div>
            
            {/* Question Text */}
            <div className="text-lg font-medium mb-4">
              {currentQuestion.question}
            </div>
            
            {/* Answer Options */}
            {!showResult && (
              <div className="space-y-3">
                {currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSubmit(option)}
                        className="w-full p-3 text-left border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
                
                {currentQuestion.type === 'freeText' && (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Skriv ditt svar här..."
                      className="w-full p-3 border border-border rounded-lg resize-none text-foreground bg-background"
                      style={{ color: '#000000', backgroundColor: '#ffffff' }}
                      rows={3}
                      onChange={(e) => {
                        const newAnswers = [...userAnswers]
                        newAnswers[currentQuestionIndex] = e.target.value
                        setUserAnswers(newAnswers)
                      }}
                      value={userAnswers[currentQuestionIndex] || ''}
                    />
                    <button
                      onClick={() => handleAnswerSubmit(userAnswers[currentQuestionIndex] || '')}
                      className="btn-primary"
                    >
                      Svara
                    </button>
                  </div>
                )}
                
                {currentQuestion.type === 'numeric' && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Skriv ditt svar här..."
                      className="w-full p-3 border border-border rounded-lg text-foreground bg-background"
                      style={{ color: '#000000', backgroundColor: '#ffffff' }}
                      onChange={(e) => {
                        const newAnswers = [...userAnswers]
                        newAnswers[currentQuestionIndex] = Number(e.target.value)
                        setUserAnswers(newAnswers)
                      }}
                      value={userAnswers[currentQuestionIndex] || ''}
                    />
                    <button
                      onClick={() => handleAnswerSubmit(userAnswers[currentQuestionIndex] || 0)}
                      className="btn-primary"
                    >
                      Svara
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Result Display */}
            {showResult && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${currentResult ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {currentResult ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${currentResult ? 'text-green-600' : 'text-red-600'}`}>
                      {currentResult ? 'Rätt!' : 'Fel!'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Rätt svar:</strong> {currentQuestion.correctAnswer}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    <strong>Förklaring:</strong> {currentQuestion.explanation}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Föregående
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    className="btn-primary"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Slutför' : 'Nästa'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}