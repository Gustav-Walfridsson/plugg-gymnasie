'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Trophy, Star, Play, Clock, Target, CheckCircle } from 'lucide-react'
import { testGenerator, generateQuickTest, generateFullTest } from '../../../lib/test-generator'
import { getRandomItems, seedLocalStore, areFixturesLoaded } from '../../../lib/data'
import type { PracticeTest, SubjectId, QuizItem } from '../../../types/domain'

interface TestPageProps {
  params: Promise<{
    subject: string
  }>
}

interface TestResult {
  score: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number
  recommendations: string[]
}

export default function TestPage({ params }: TestPageProps) {
  const [subject, setSubject] = useState<SubjectId | null>(null)
  
  useEffect(() => {
    params.then(({ subject }) => {
      setSubject(subject as SubjectId)
    })
  }, [params])
  const [test, setTest] = useState<PracticeTest | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fixturesLoaded, setFixturesLoaded] = useState(false)

  const subjectName = subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : ''

  // Initialize fixtures when component mounts
  useEffect(() => {
    const initializeFixtures = async () => {
      if (!subject) return
      
      setIsLoading(true)
      
      try {
        // Ensure fixtures are loaded
        if (!areFixturesLoaded()) {
          await seedLocalStore()
          setFixturesLoaded(true)
        } else {
          setFixturesLoaded(true)
        }
      } catch (error) {
        console.error('Error loading fixtures:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeFixtures()
  }, [subject])

  const startTest = async (testType: 'quick' | 'full') => {
    if (!subject) return
    
    try {
      // Ensure fixtures are loaded before generating test
      if (!areFixturesLoaded()) {
        await seedLocalStore()
        setFixturesLoaded(true)
      }
      
      // Try to use fixtures data first
      const itemCount = testType === 'quick' ? 5 : 15
      const fixturesItems = getRandomItems(itemCount)
      
      let newTest: PracticeTest
      
      if (fixturesItems.length > 0) {
        // Convert Item[] to QuizItem[] format
        const quizItems: QuizItem[] = fixturesItems.map(item => ({
          id: item.id,
          skillId: item.skillId,
          question: item.prompt,
          type: item.type as 'numeric' | 'freeText' | 'mcq',
          correctAnswer: item.type === 'numeric' ? (item.answer as any).value : 
                        item.type === 'mcq' ? (item.answer as any).correctIndex :
                        (item.answer as any).modelAnswer,
          choices: item.choices || [],
          explanation: item.explanation,
          difficulty: item.difficulty === 1 ? 'enkel' : item.difficulty === 2 ? 'medel' : 'svår'
        }))
        
        // Use fixtures data
        newTest = {
          id: `test-${subject}-${Date.now()}`,
          subjectId: subject as SubjectId,
          title: `${subjectName} Träningsprov`,
          description: `Testa dina ${subjectName.toLowerCase()}-kunskaper`,
          items: quizItems,
          passingScore: 70
        }
      } else {
        // Fallback to test generator
        newTest = testType === 'quick' ? generateQuickTest(subject as SubjectId) : generateFullTest(subject as SubjectId)
      }
      
      setTest(newTest)
      setTestStarted(true)
      setStartTime(new Date())
      setCurrentQuestion(0)
      setAnswers({})
      setTestCompleted(false)
      setResult(null)
    } catch (error) {
      console.error('Error starting test:', error)
      // Fallback to test generator on error
      const newTest = testType === 'quick' ? generateQuickTest(subject as SubjectId) : generateFullTest(subject as SubjectId)
      setTest(newTest)
      setTestStarted(true)
      setStartTime(new Date())
      setCurrentQuestion(0)
      setAnswers({})
      setTestCompleted(false)
      setResult(null)
    }
  }

  const handleAnswer = (questionId: string, answer: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const nextQuestion = () => {
    if (test && currentQuestion < test.items.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitTest = () => {
    if (!test || !startTime) return

    const endTime = new Date()
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000) // seconds

    let correctAnswers = 0
    test.items.forEach(item => {
      const userAnswer = answers[item.id]
      if (userAnswer === item.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / test.items.length) * 100)
    
    // Generate recommendations based on performance
    const recommendations = generateRecommendations(score, test.items, answers)

    setResult({
      score,
      correctAnswers,
      totalQuestions: test.items.length,
      timeSpent,
      recommendations
    })
    setTestCompleted(true)
  }

  const generateRecommendations = (score: number, items: QuizItem[], answers: Record<string, string | number>): string[] => {
    const recommendations: string[] = []
    
    if (score >= 90) {
      recommendations.push('Utmärkt resultat! Du behärskar detta ämne väl.')
      recommendations.push('Överväg att gå vidare till mer avancerade ämnen.')
    } else if (score >= 70) {
      recommendations.push('Bra resultat! Du har god förståelse för ämnet.')
      recommendations.push('Fokusera på områden där du hade svårigheter.')
    } else if (score >= 50) {
      recommendations.push('Du behöver mer träning inom detta ämne.')
      recommendations.push('Gå tillbaka och studera grundläggande koncept.')
    } else {
      recommendations.push('Detta ämne behöver mer fokus.')
      recommendations.push('Börja med grundläggande lektioner och övningar.')
    }

    // Analyze wrong answers for specific recommendations
    const wrongAnswers = items.filter(item => answers[item.id] !== item.correctAnswer)
    if (wrongAnswers.length > 0) {
      const skillCounts: Record<string, number> = {}
      wrongAnswers.forEach(item => {
        skillCounts[item.skillId] = (skillCounts[item.skillId] || 0) + 1
      })
      
      const weakestSkill = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)[0]
      
      if (weakestSkill) {
        recommendations.push(`Fokusera extra på: ${weakestSkill[0]}`)
      }
    }

    return recommendations
  }

  const resetTest = () => {
    setTest(null)
    setTestStarted(false)
    setTestCompleted(false)
    setResult(null)
    setCurrentQuestion(0)
    setAnswers({})
    setStartTime(null)
  }

  if (!subject || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Laddar...</h1>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {fixturesLoaded ? 'Förbereder test...' : 'Laddar innehåll...'}
          </p>
        </div>
      </div>
    )
  }

  if (!testStarted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Träningsprov - {subjectName}</h1>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Träningsprov för {subjectName}</h2>
              <p className="text-muted-foreground">Testa dina kunskaper utan tidspress</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Snabbtest (5 frågor)
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  En kort översikt av dina kunskaper
                </p>
                <button 
                  onClick={() => startTest('quick')}
                  className="btn-primary w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Starta Snabbtest
                </button>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Fullständigt test (15 frågor)
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  En omfattande utvärdering av dina färdigheter
                </p>
                <button 
                  onClick={() => startTest('full')}
                  className="btn-primary w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Starta Fullständigt Test
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Mastery-läge
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Träningsproven har ingen tidspress. Ta din tid att tänka igenom varje fråga 
                och fokusera på att förstå materialet istället för att skynda sig.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex space-x-4">
            <Link href={`/study/${subject}`} className="btn-secondary">
              Studera {subjectName} först
            </Link>
            <Link href="/" className="btn-outline">
              Tillbaka till hem
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (testCompleted && result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Testresultat - {subjectName}</h1>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Test Slutfört!</h2>
            <p className="text-muted-foreground">
              Du fick {result.correctAnswers} av {result.totalQuestions} rätt
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {result.score}%
              </div>
              <div className="text-sm text-muted-foreground">Totalt resultat</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {result.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Rätta svar</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground">Tid</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rekommendationer</h3>
            <div className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex space-x-4">
            <button onClick={resetTest} className="btn-primary">
              <Play className="w-4 h-4 mr-2" />
              Ta ett nytt test
            </button>
            <Link href={`/study/${subject}`} className="btn-secondary">
              Studera {subjectName}
            </Link>
            <Link href="/" className="btn-outline">
              Tillbaka till hem
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!test) return null

  const currentItem = test.items[currentQuestion]
  const progress = ((currentQuestion + 1) / test.items.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{test.title}</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Fråga {currentQuestion + 1} av {test.items.length}
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Framsteg</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{currentItem.question}</h2>
            
            {currentItem.type === 'mcq' && currentItem.options && (
              <div className="space-y-2">
                {currentItem.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentItem.id}`}
                      value={option}
                      checked={answers[currentItem.id] === option}
                      onChange={(e) => handleAnswer(currentItem.id, e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {currentItem.type === 'freeText' && (
              <textarea
                value={answers[currentItem.id] || ''}
                onChange={(e) => handleAnswer(currentItem.id, e.target.value)}
                placeholder="Skriv ditt svar här..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
            )}
            
            {currentItem.type === 'numeric' && (
              <input
                type="number"
                value={answers[currentItem.id] || ''}
                onChange={(e) => handleAnswer(currentItem.id, parseFloat(e.target.value) || 0)}
                placeholder="Skriv ditt svar här..."
                className="w-full p-3 border rounded-lg"
              />
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="btn-outline disabled:opacity-50"
            >
              Föregående
            </button>
            
            {currentQuestion === test.items.length - 1 ? (
              <button
                onClick={submitTest}
                className="btn-primary"
              >
                Slutför test
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="btn-primary"
              >
                Nästa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
