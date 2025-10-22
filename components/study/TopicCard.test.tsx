import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopicCard } from './TopicCard'
import type { Topic } from '../../types/domain'

const mockTopic: Topic = {
  id: 'algebra-grund',
  name: 'Algebra - Grundläggande',
  description: 'Variabler, uttryck och enkla ekvationer',
  skills: [
    {
      id: 'variabler-uttryck',
      name: 'Variabler och uttryck',
      description: 'Förstå och arbeta med variabler och algebraiska uttryck',
      difficulty: 'enkel',
      prerequisites: []
    },
    {
      id: 'enkla-ekvationer',
      name: 'Enkla ekvationer',
      description: 'Lösa enkla ekvationer med en variabel',
      difficulty: 'enkel',
      prerequisites: ['variabler-uttryck']
    }
  ]
}

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

describe('TopicCard', () => {
  it('should render topic information correctly', () => {
    render(
      <TopicCard
        topic={mockTopic}
        subjectId="matematik"
        skillCount={2}
        completedSkills={1}
      />
    )

    expect(screen.getByText('Algebra - Grundläggande')).toBeInTheDocument()
    expect(screen.getByText('Variabler, uttryck och enkla ekvationer')).toBeInTheDocument()
    expect(screen.getByText('2 färdigheter')).toBeInTheDocument()
  })

  it('should display progress correctly', () => {
    render(
      <TopicCard
        topic={mockTopic}
        subjectId="matematik"
        skillCount={4}
        completedSkills={2}
      />
    )

    expect(screen.getByText('Framsteg')).toBeInTheDocument()
    expect(screen.getByText('2/4')).toBeInTheDocument()
  })

  it('should show completion status when all skills are completed', () => {
    render(
      <TopicCard
        topic={mockTopic}
        subjectId="matematik"
        skillCount={2}
        completedSkills={2}
      />
    )

    expect(screen.getByText('Klart!')).toBeInTheDocument()
  })

  it('should have correct link href', () => {
    render(
      <TopicCard
        topic={mockTopic}
        subjectId="matematik"
        skillCount={2}
        completedSkills={1}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/study/matematik/algebra-grund')
  })

  it('should handle zero skills gracefully', () => {
    render(
      <TopicCard
        topic={mockTopic}
        subjectId="matematik"
        skillCount={0}
        completedSkills={0}
      />
    )

    expect(screen.getByText('0 färdigheter')).toBeInTheDocument()
    expect(screen.getByText('0/0')).toBeInTheDocument()
  })

  it('should apply hover effects and transitions', () => {
    render(
      <TopicCard
        topic={mockTopic}
        subjectId="matematik"
        skillCount={2}
        completedSkills={1}
      />
    )

    const card = screen.getByRole('link')
    expect(card).toHaveClass('group', 'hover:border-primary/50', 'transition-all')
  })
})
