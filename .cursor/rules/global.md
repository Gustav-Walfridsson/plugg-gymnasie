# Plugg Bot 1 - Global Build Rules

## Project Overview
Swedish gymnasiet MVP for mastery-based learning. Target: reduce study time by ≥50% for NA Åk 1 students.

## Folder Layout
```
app/                    # Next.js App Router pages
components/             # Reusable UI components
lib/                   # Core business logic
types/                 # TypeScript definitions
data/                  # JSON fixtures and content
public/                # Static assets
```

## Swedish Terminology Standards
- **UI Copy**: Relaxed youth Swedish, no slang/grammar errors
- **Code/Comments**: Precise English
- **Subject Names**: Matematik, Fysik, Svenska, Engelska, Kemi, Biologi
- **Learning Terms**: 
  - "Öva" (Practice)
  - "Lektion" (Lesson) 
  - "Färdighet" (Skill)
  - "Behärska" (Master)
  - "Repetition" (Review)
  - "Träningsprov" (Practice Test)

## Acceptance Checks
- [ ] All pages render without errors
- [ ] Dark mode default works
- [ ] Swedish-only UI (no English text visible)
- [ ] Mastery engine updates correctly
- [ ] Instant feedback shows after attempts
- [ ] localStorage persists state
- [ ] Lighthouse desktop score ≈90

## Pause at Checkpoints Policy
- **M1**: Scaffold complete - PAUSE_FOR_REVIEW
- **M5**: Tutor mock complete - PAUSE_FOR_REVIEW
- **M10**: Review & QA complete - PAUSE_FOR_REVIEW

## Technical Standards
- TypeScript strict mode
- Tailwind CSS for styling
- localStorage for state persistence
- JSON fixtures for content
- No external APIs or databases
- Semantic HTML with accessibility
- Mobile-first responsive design

## Code Quality
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Follow Next.js App Router conventions
- Implement proper error boundaries
- Use TypeScript strict typing
