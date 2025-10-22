import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LessonCard } from './LessonCard'
import type { Lesson } from '../../types/domain'

const mockLesson: Lesson = {
  id: 'lesson-001',
  skillId: 'variabler-uttryck',
  title: 'Variabler och uttryck - Lektion 1',
  content: 'Detta är innehållet för Variabler och uttryck lektion 1. Här lär du dig grundläggande koncept och metoder.\n\nDetta är en andra paragraf med mer information.',
  order: 1
}

describe('LessonCard', () => {
  it('should render lesson information correctly', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={false}
      />
    )

    expect(screen.getByText('Variabler och uttryck - Lektion 1')).toBeInTheDocument()
    expect(screen.getByText('Lektion 1')).toBeInTheDocument()
  })

  it('should display reading time estimate', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={false}
      />
    )

    // Content has ~20 words, so should be ~1 min reading time
    expect(screen.getByText(/min läsning/)).toBeInTheDocument()
  })

  it('should show completion status when completed', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={true}
      />
    )

    expect(screen.getByText('Klart')).toBeInTheDocument()
  })

  it('should toggle expansion when clicked', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={false}
      />
    )

    const card = screen.getByRole('button', { name: /variabler och uttryck/i })
    
    // Initially collapsed
    expect(screen.queryByText('Detta är innehållet för Variabler och uttryck lektion 1')).not.toBeInTheDocument()
    
    // Click to expand
    fireEvent.click(card)
    expect(screen.getByText('Detta är innehållet för Variabler och uttryck lektion 1')).toBeInTheDocument()
    
    // Click to collapse
    fireEvent.click(card)
    expect(screen.queryByText('Detta är innehållet för Variabler och uttryck lektion 1')).not.toBeInTheDocument()
  })

  it('should display lesson content when expanded', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={false}
      />
    )

    const card = screen.getByRole('button', { name: /variabler och uttryck/i })
    fireEvent.click(card)

    expect(screen.getByText('Detta är innehållet för Variabler och uttryck lektion 1')).toBeInTheDocument()
    expect(screen.getByText('Detta är en andra paragraf med mer information.')).toBeInTheDocument()
  })

  it('should show complete button when not completed', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={false}
        onComplete={vi.fn()}
      />
    )

    const card = screen.getByRole('button', { name: /variabler och uttryck/i })
    fireEvent.click(card)

    expect(screen.getByText('Markera som läst')).toBeInTheDocument()
  })

  it('should show uncomplete button when completed', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={true}
        onComplete={vi.fn()}
      />
    )

    expect(screen.getByText('Markera som oläst')).toBeInTheDocument()
  })

  it('should call onComplete when complete button is clicked', () => {
    const onComplete = vi.fn()
    
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={false}
        onComplete={onComplete}
      />
    )

    const card = screen.getByRole('button', { name: /variabler och uttryck/i })
    fireEvent.click(card)

    const completeButton = screen.getByText('Markera som läst')
    fireEvent.click(completeButton)

    expect(onComplete).toHaveBeenCalledWith('lesson-001')
  })

  it('should call onComplete when uncomplete button is clicked', () => {
    const onComplete = vi.fn()
    
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={true}
        onComplete={onComplete}
      />
    )

    const uncompleteButton = screen.getByText('Markera som oläst')
    fireEvent.click(uncompleteButton)

    expect(onComplete).toHaveBeenCalledWith('lesson-001')
  })

  it('should not show complete button when onComplete is not provided', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={false}
      />
    )

    const card = screen.getByRole('button', { name: /variabler och uttryck/i })
    fireEvent.click(card)

    expect(screen.queryByText('Markera som läst')).not.toBeInTheDocument()
  })

  it('should display chevron icons correctly', () => {
    render(
      <LessonCard
        lesson={mockLesson}
        isCompleted={false}
      />
    )

    // Initially should show chevron down
    expect(screen.getByRole('button', { name: /variabler och uttryck/i }).querySelector('svg')).toBeInTheDocument()
    
    const card = screen.getByRole('button', { name: /variabler och uttryck/i })
    fireEvent.click(card)
    
    // After expansion, should show chevron up
    expect(screen.getByRole('button', { name: /variabler och uttryck/i }).querySelector('svg')).toBeInTheDocument()
  })

  it('should handle empty content gracefully', () => {
    const emptyLesson = { ...mockLesson, content: '' }
    
    render(
      <LessonCard
        lesson={emptyLesson}
        isCompleted={false}
      />
    )

    const card = screen.getByRole('button', { name: /variabler och uttryck/i })
    fireEvent.click(card)

    // Should not crash and should show empty content
    expect(screen.getByText('Variabler och uttryck - Lektion 1')).toBeInTheDocument()
  })
})
