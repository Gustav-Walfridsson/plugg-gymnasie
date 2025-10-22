import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkillCard } from './SkillCard'
import type { Skill } from '../../types/domain'

const mockSkill: Skill = {
  id: 'variabler-uttryck',
  name: 'Variabler och uttryck',
  description: 'Förstå och arbeta med variabler och algebraiska uttryck',
  difficulty: 'enkel',
  prerequisites: ['grundläggande-math']
}

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

describe('SkillCard', () => {
  it('should render skill information correctly', () => {
    render(
      <SkillCard
        skill={mockSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
      />
    )

    expect(screen.getByText('Variabler och uttryck')).toBeInTheDocument()
    expect(screen.getByText('Förstå och arbeta med variabler och algebraiska uttryck')).toBeInTheDocument()
    expect(screen.getByText('enkel')).toBeInTheDocument()
    expect(screen.getByText('nybörjare')).toBeInTheDocument()
  })

  it('should display difficulty badge with correct styling', () => {
    render(
      <SkillCard
        skill={mockSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
      />
    )

    const difficultyBadge = screen.getByText('enkel')
    expect(difficultyBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('should display mastery level badge', () => {
    render(
      <SkillCard
        skill={mockSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
        masteryLevel="lärande"
      />
    )

    expect(screen.getByText('lärande')).toBeInTheDocument()
  })

  it('should show completion status when completed', () => {
    render(
      <SkillCard
        skill={mockSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
        isCompleted={true}
      />
    )

    // Check for checkmark icon (CheckCircle)
    const checkIcon = screen.getByRole('link').querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })

  it('should display prerequisites when available', () => {
    render(
      <SkillCard
        skill={mockSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
      />
    )

    expect(screen.getByText('Förutsättningar:')).toBeInTheDocument()
    expect(screen.getByText('grundläggande-math')).toBeInTheDocument()
  })

  it('should display lesson and exercise counts', () => {
    render(
      <SkillCard
        skill={mockSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
      />
    )

    expect(screen.getByText('5 lektioner')).toBeInTheDocument()
    expect(screen.getByText('10 övningar')).toBeInTheDocument()
  })

  it('should calculate and display estimated time', () => {
    render(
      <SkillCard
        skill={mockSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
      />
    )

    // 5 lessons * 5 min + 10 exercises * 2 min = 45 min total
    expect(screen.getByText('~1 min')).toBeInTheDocument()
  })

  it('should have correct link href', () => {
    render(
      <SkillCard
        skill={mockSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/study/matematik/algebra-grund/variabler-uttryck')
  })

  it('should handle different difficulty levels', () => {
    const mediumSkill = { ...mockSkill, difficulty: 'medel' as const }
    
    render(
      <SkillCard
        skill={mediumSkill}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
      />
    )

    const difficultyBadge = screen.getByText('medel')
    expect(difficultyBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('should handle skill without prerequisites', () => {
    const skillWithoutPrereqs = { ...mockSkill, prerequisites: [] }
    
    render(
      <SkillCard
        skill={skillWithoutPrereqs}
        subjectId="matematik"
        topicId="algebra-grund"
        lessonCount={5}
        exerciseCount={10}
      />
    )

    expect(screen.queryByText('Förutsättningar:')).not.toBeInTheDocument()
  })
})
