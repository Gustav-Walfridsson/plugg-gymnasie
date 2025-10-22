/**
 * Tutor Engine - Deterministic hint system for Plugg Bot 1
 * Provides step-by-step help with Swedish terminology
 */

import type { QuizItem, ItemType, DifficultyLevel } from '../types/domain'

export interface TutorHint {
  id: string
  step: number
  title: string
  content: string
  isRevealed: boolean
}

export interface TutorState {
  itemId: string
  skillId: string
  userId: string
  hints: TutorHint[]
  currentStep: number
  hasAttempted: boolean
  showSolution: boolean
  startTime: Date
}

export class TutorEngine {
  private static instance: TutorEngine
  private tutorStates: Map<string, TutorState> = new Map()

  private constructor() {}

  static getInstance(): TutorEngine {
    if (!TutorEngine.instance) {
      TutorEngine.instance = new TutorEngine()
    }
    return TutorEngine.instance
  }

  /**
   * Initialize tutor session for an item
   */
  initializeTutorSession(item: QuizItem, userId: string): TutorState {
    const key = `${userId}-${item.id}`
    
    const hints = this.generateHints(item)
    
    const tutorState: TutorState = {
      itemId: item.id,
      skillId: item.skillId,
      userId,
      hints,
      currentStep: 0,
      hasAttempted: false,
      showSolution: false,
      startTime: new Date()
    }

    this.tutorStates.set(key, tutorState)
    return tutorState
  }

  /**
   * Get current tutor state
   */
  getTutorState(itemId: string, userId: string): TutorState | null {
    const key = `${userId}-${itemId}`
    return this.tutorStates.get(key) || null
  }

  /**
   * Reveal next hint
   */
  revealNextHint(itemId: string, userId: string): TutorHint | null {
    const tutorState = this.getTutorState(itemId, userId)
    if (!tutorState) return null

    if (tutorState.currentStep < tutorState.hints.length) {
      const hint = tutorState.hints[tutorState.currentStep]
      hint.isRevealed = true
      tutorState.currentStep += 1
      
      this.tutorStates.set(`${userId}-${itemId}`, tutorState)
      return hint
    }

    return null
  }

  /**
   * Mark that user has attempted the question
   */
  markAttempted(itemId: string, userId: string): void {
    const tutorState = this.getTutorState(itemId, userId)
    if (tutorState) {
      tutorState.hasAttempted = true
      this.tutorStates.set(`${userId}-${itemId}`, tutorState)
    }
  }

  /**
   * Show full solution (only after attempt)
   */
  showSolution(itemId: string, userId: string): boolean {
    const tutorState = this.getTutorState(itemId, userId)
    if (!tutorState) return false

    if (tutorState.hasAttempted) {
      tutorState.showSolution = true
      this.tutorStates.set(`${userId}-${itemId}`, tutorState)
      return true
    }

    return false
  }

  /**
   * Generate deterministic hints based on item type and difficulty
   */
  private generateHints(item: QuizItem): TutorHint[] {
    const hints: TutorHint[] = []

    switch (item.type) {
      case 'numeric':
        hints.push(...this.generateNumericHints(item))
        break
      case 'mcq':
        hints.push(...this.generateMCQHints(item))
        break
      case 'freeText':
        hints.push(...this.generateFreeTextHints(item))
        break
      case 'flashcard':
        hints.push(...this.generateFlashcardHints(item))
        break
    }

    // Add final solution hint
    hints.push({
      id: `solution-${item.id}`,
      step: hints.length + 1,
      title: 'Fullständig lösning',
      content: `**Rätt svar:** ${item.correctAnswer}\n\n**Förklaring:** ${item.explanation}`,
      isRevealed: false
    })

    return hints
  }

  /**
   * Generate hints for numeric questions
   */
  private generateNumericHints(item: QuizItem): TutorHint[] {
    const hints: TutorHint[] = []
    const question = item.question.toLowerCase()

    // Step 1: Identify what to calculate
    hints.push({
      id: `step1-${item.id}`,
      step: 1,
      title: 'Identifiera vad som ska beräknas',
      content: this.getNumericStep1Hint(question),
      isRevealed: false
    })

    // Step 2: Break down the problem
    hints.push({
      id: `step2-${item.id}`,
      step: 2,
      title: 'Bryt ner problemet',
      content: this.getNumericStep2Hint(question),
      isRevealed: false
    })

    // Step 3: Calculation method
    hints.push({
      id: `step3-${item.id}`,
      step: 3,
      title: 'Beräkningsmetod',
      content: this.getNumericStep3Hint(question),
      isRevealed: false
    })

    return hints
  }

  /**
   * Generate hints for MCQ questions
   */
  private generateMCQHints(item: QuizItem): TutorHint[] {
    const hints: TutorHint[] = []

    // Step 1: Read carefully
    hints.push({
      id: `step1-${item.id}`,
      step: 1,
      title: 'Läs frågan noggrant',
      content: 'Läs frågan flera gånger och identifiera nyckelord. Vad frågar den egentligen efter?',
      isRevealed: false
    })

    // Step 2: Eliminate wrong answers
    hints.push({
      id: `step2-${item.id}`,
      step: 2,
      title: 'Eliminera felaktiga svar',
      content: 'Gå igenom varje alternativ och eliminera de som uppenbarligen är felaktiga. Vilka alternativ kan du utesluta direkt?',
      isRevealed: false
    })

    // Step 3: Compare remaining options
    hints.push({
      id: `step3-${item.id}`,
      step: 3,
      title: 'Jämför kvarvarande alternativ',
      content: 'Jämför de alternativ som kvarstår. Vilket stämmer bäst med vad frågan efterfrågar?',
      isRevealed: false
    })

    return hints
  }

  /**
   * Generate hints for free-text questions
   */
  private generateFreeTextHints(item: QuizItem): TutorHint[] {
    const hints: TutorHint[] = []

    // Step 1: Understand the question
    hints.push({
      id: `step1-${item.id}`,
      step: 1,
      title: 'Förstå frågan',
      content: 'Vad efterfrågar frågan? Vilken typ av svar förväntas sig?',
      isRevealed: false
    })

    // Step 2: Plan your answer
    hints.push({
      id: `step2-${item.id}`,
      step: 2,
      title: 'Planera ditt svar',
      content: 'Tänk igenom vilka huvudpunkter som ska inkluderas i svaret. Strukturera ditt svar logiskt.',
      isRevealed: false
    })

    // Step 3: Write clearly
    hints.push({
      id: `step3-${item.id}`,
      step: 3,
      title: 'Skriv tydligt',
      content: 'Skriv ditt svar på ett tydligt och strukturerat sätt. Använd svenska terminologi och var konkret.',
      isRevealed: false
    })

    return hints
  }

  /**
   * Generate hints for flashcard questions
   */
  private generateFlashcardHints(item: QuizItem): TutorHint[] {
    const hints: TutorHint[] = []

    // Step 1: Read the question
    hints.push({
      id: `step1-${item.id}`,
      step: 1,
      title: 'Läs frågan',
      content: 'Läs frågan noggrant och försök förstå vad som efterfrågas.',
      isRevealed: false
    })

    // Step 2: Think about related concepts
    hints.push({
      id: `step2-${item.id}`,
      step: 2,
      title: 'Tänk på relaterade begrepp',
      content: 'Vilka begrepp eller koncept är relaterade till denna fråga? Kan du komma ihåg något liknande?',
      isRevealed: false
    })

    // Step 3: Make your best guess
    hints.push({
      id: `step3-${item.id}`,
      step: 3,
      title: 'Gör ditt bästa försök',
      content: 'Baserat på vad du vet, gör ditt bästa försök att svara. Det är okej att vara osäker.',
      isRevealed: false
    })

    return hints
  }

  /**
   * Get step 1 hint for numeric questions
   */
  private getNumericStep1Hint(question: string): string {
    if (question.includes('värde') || question.includes('beräkna')) {
      return 'Du ska beräkna ett numeriskt värde. Identifiera vilka tal och operationer som ingår.'
    }
    if (question.includes('förenkla')) {
      return 'Du ska förenkla ett uttryck. Identifiera vilka termer som kan kombineras.'
    }
    if (question.includes('lösa')) {
      return 'Du ska lösa en ekvation. Identifiera variabeln och operationerna.'
    }
    return 'Identifiera vad som ska beräknas i denna matematiska uppgift.'
  }

  /**
   * Get step 2 hint for numeric questions
   */
  private getNumericStep2Hint(question: string): string {
    if (question.includes('substituera') || question.includes('när')) {
      return 'Substituera de givna värdena i uttrycket. Ersätt variablerna med de angivna talen.'
    }
    if (question.includes('förenkla')) {
      return 'Kombinera liknande termer. Addera eller subtrahera termer med samma variabel.'
    }
    if (question.includes('ekvation')) {
      return 'Isolera variabeln genom att utföra samma operationer på båda sidor av likhetstecknet.'
    }
    return 'Bryt ner problemet i mindre steg som du kan lösa en i taget.'
  }

  /**
   * Get step 3 hint for numeric questions
   */
  private getNumericStep3Hint(question: string): string {
    if (question.includes('substituera')) {
      return 'Utför beräkningarna steg för steg: först multiplikation, sedan addition/subtraktion.'
    }
    if (question.includes('förenkla')) {
      return 'Kombinera koefficienterna för liknande termer: (a + b - c)x = (a+b-c)x'
    }
    if (question.includes('ekvation')) {
      return 'Använd inversa operationer för att isolera variabeln: addition motsvarar subtraktion, multiplikation motsvarar division.'
    }
    return 'Utför beräkningarna noggrant och kontrollera ditt svar.'
  }

  /**
   * Get contextual help based on skill
   */
  getContextualHelp(skillId: string): string {
    const skillHelp: Record<string, string> = {
      'variabler-uttryck': 'En variabel är en bokstav som representerar ett okänt värde. I uttrycket 3x + 5 är x variabeln och 3 är koefficienten.',
      'enkla-ekvationer': 'En ekvation är en likhet mellan två uttryck. För att lösa den, isolera variabeln genom att utföra samma operationer på båda sidor.',
      'parenteser': 'När du arbetar med parenteser, multiplicera varje term innanför parentesen med faktorn utanför. Kom ihåg teckenreglerna.',
      'kvadratiska-uttryck': 'Kvadratiska uttryck har formen ax² + bx + c. Du kan faktorisera dem eller använda kvadratkomplettering.',
      'kvadratiska-ekvationer': 'Kvadratiska ekvationer kan lösas med pq-formeln, kvadratkomplettering eller faktorisering.',
      'kraft-begrepp': 'Kraft är en vektorstorhet som beskriver påverkan på ett föremål. Enheten är Newton (N).',
      'newtons-lagar': 'Newtons första lag: föremål i vila stannar i vila. Andra lag: F = ma. Tredje lag: aktion = reaktion.',
      'rörelse-beskrivning': 'Hastighet är förändring av läge över tid. Acceleration är förändring av hastighet över tid.',
      'energi-begrepp': 'Energi kan inte skapas eller förstöras, bara omvandlas mellan olika former som kinetisk och potentiell energi.',
      'arbete-effekt': 'Arbete = kraft × sträcka. Effekt = arbete per tidsenhet. Enheten för arbete är Joule (J).'
    }

    return skillHelp[skillId] || 'Fokusera på att förstå grundbegreppen och tillämpa dem systematiskt.'
  }

  /**
   * Get motivational message
   */
  getMotivationalMessage(step: number): string {
    const messages = [
      'Bra början! Du är på rätt väg.',
      'Fortsätt så! Du gör framsteg.',
      'Utmärkt! Du närmar dig lösningen.',
      'Fantastiskt! Du har nästan löst det.',
      'Perfekt! Du har gjort ett bra jobb.'
    ]

    return messages[Math.min(step - 1, messages.length - 1)] || 'Fortsätt kämpa!'
  }

  /**
   * Check if solution can be shown
   */
  canShowSolution(itemId: string, userId: string): boolean {
    const tutorState = this.getTutorState(itemId, userId)
    return tutorState ? tutorState.hasAttempted : false
  }

  /**
   * Get progress percentage
   */
  getProgress(itemId: string, userId: string): number {
    const tutorState = this.getTutorState(itemId, userId)
    if (!tutorState) return 0

    const totalSteps = tutorState.hints.length
    const completedSteps = tutorState.currentStep
    return Math.round((completedSteps / totalSteps) * 100)
  }

  /**
   * Reset tutor session
   */
  resetTutorSession(itemId: string, userId: string): void {
    const key = `${userId}-${itemId}`
    this.tutorStates.delete(key)
  }
}

// Export singleton instance
export const tutorEngine = TutorEngine.getInstance()
