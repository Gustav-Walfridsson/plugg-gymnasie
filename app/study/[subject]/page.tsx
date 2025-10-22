'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TopicCard } from '../../../components/study/TopicCard'
import { useParams } from 'next/navigation'

export default function SubjectPage() {
  const params = useParams()
  const subjectId = params.subject as string

  // Static data - no loading states or complex state management
  const subjectData = {
    'matematik': {
      id: 'matematik',
      name: 'Matematik',
      description: 'Algebra och grundläggande matematik',
      color: 'bg-blue-600',
      icon: 'Calculator'
    },
    'fysik': {
      id: 'fysik',
      name: 'Fysik',
      description: 'Mekanik och grundläggande fysik',
      color: 'bg-purple-600',
      icon: 'Atom'
    },
    'svenska': {
      id: 'svenska',
      name: 'Svenska',
      description: 'Skrivande och grammatisk feedback',
      color: 'bg-green-600',
      icon: 'BookOpen'
    },
    'engelska': {
      id: 'engelska',
      name: 'Engelska',
      description: 'Writing och vocabulary feedback',
      color: 'bg-red-600',
      icon: 'Globe'
    },
    'kemi': {
      id: 'kemi',
      name: 'Kemi',
      description: 'Binding och bonding',
      color: 'bg-orange-600',
      icon: 'Beaker'
    },
    'biologi': {
      id: 'biologi',
      name: 'Biologi',
      description: 'Genetik och grundläggande biologi',
      color: 'bg-teal-600',
      icon: 'Dna'
    }
  }

  const topicsData = {
    'matematik': [
      {
        id: 'algebra',
        name: 'Algebra',
        description: 'Variabler, uttryck och ekvationer',
        skills: [
          { id: 'variabler-uttryck', name: 'Variabler och uttryck' },
          { id: 'enkla-ekvationer', name: 'Enkla ekvationer' },
          { id: 'parenteser', name: 'Parenteser' }
        ]
      }
    ],
    'fysik': [
      {
        id: 'mekanik',
        name: 'Mekanik',
        description: 'Krafter, rörelse och energi',
        skills: [
          { id: 'krafter', name: 'Krafter och rörelse' },
          { id: 'energi', name: 'Energi och arbete' }
        ]
      }
    ],
    'svenska': [
      {
        id: 'skrivande',
        name: 'Skrivande',
        description: 'Textproduktion och grammatik',
        skills: [
          { id: 'grammatik', name: 'Grammatik' },
          { id: 'stavning', name: 'Stavning' }
        ]
      }
    ],
    'engelska': [
      {
        id: 'writing',
        name: 'Writing',
        description: 'English writing and vocabulary',
        skills: [
          { id: 'vocabulary', name: 'Vocabulary' },
          { id: 'grammar', name: 'Grammar' }
        ]
      }
    ],
    'kemi': [
      {
        id: 'binding',
        name: 'Binding',
        description: 'Kemiska bindningar och strukturer',
        skills: [
          { id: 'kovalenta-bindningar', name: 'Kovalenta bindningar' },
          { id: 'jonbindningar', name: 'Jonbindningar' }
        ]
      }
    ],
    'biologi': [
      {
        id: 'genetik',
        name: 'Genetik',
        description: 'Arv, gener och DNA',
        skills: [
          { id: 'dna-struktur', name: 'DNA struktur' },
          { id: 'genetisk-kod', name: 'Genetisk kod' }
        ]
      }
    ]
  }

  const subject = subjectData[subjectId as keyof typeof subjectData] || subjectData['matematik']
  const topics = topicsData[subjectId as keyof typeof topicsData] || topicsData['matematik'] || []

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href="/" 
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">{subject.name}</h1>
      </div>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Ämnen inom {subject.name}</h2>
          <p className="text-muted-foreground">
            {subject.description}
          </p>
        </div>
        
        {topics.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              Inga ämnen tillgängliga för {subject.name} ännu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                subjectId={subject.id}
                skillCount={topic.skills.length}
                completedSkills={0} // TODO: Get from user progress
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}