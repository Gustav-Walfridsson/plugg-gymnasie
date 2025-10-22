'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SkillCard } from '../../../../components/study/SkillCard'
import { useParams } from 'next/navigation'

export default function TopicPage() {
  const params = useParams()
  const subjectId = params.subject as string
  const topicId = params.topic as string

  // Static data - no loading states or complex state management
  const subjectData = {
    'matematik': {
      id: 'matematik',
      name: 'Matematik',
      description: 'Algebra och grundläggande matematik'
    },
    'fysik': {
      id: 'fysik',
      name: 'Fysik',
      description: 'Mekanik och grundläggande fysik'
    },
    'svenska': {
      id: 'svenska',
      name: 'Svenska',
      description: 'Skrivande och grammatisk feedback'
    },
    'engelska': {
      id: 'engelska',
      name: 'Engelska',
      description: 'Writing och vocabulary feedback'
    },
    'kemi': {
      id: 'kemi',
      name: 'Kemi',
      description: 'Binding och bonding'
    },
    'biologi': {
      id: 'biologi',
      name: 'Biologi',
      description: 'Genetik och grundläggande biologi'
    }
  }

  const topicsData = {
    'matematik': {
      'algebra': {
        id: 'algebra',
        name: 'Algebra',
        description: 'Variabler, uttryck och ekvationer',
        skills: [
          {
            id: 'variabler-uttryck',
            name: 'Variabler och uttryck',
            description: 'Lär dig grundläggande algebraiska uttryck',
            difficulty: 'lätt' as const,
            prerequisites: []
          },
          {
            id: 'enkla-ekvationer',
            name: 'Enkla ekvationer',
            description: 'Lös enkla ekvationer med en obekant',
            difficulty: 'medel' as const,
            prerequisites: ['variabler-uttryck']
          },
          {
            id: 'parenteser',
            name: 'Parenteser',
            description: 'Arbeta med parenteser i algebraiska uttryck',
            difficulty: 'medel' as const,
            prerequisites: ['variabler-uttryck']
          }
        ]
      }
    },
    'fysik': {
      'mekanik': {
        id: 'mekanik',
        name: 'Mekanik',
        description: 'Krafter, rörelse och energi',
        skills: [
          {
            id: 'krafter',
            name: 'Krafter och rörelse',
            description: 'Förstå hur krafter påverkar rörelse',
            difficulty: 'medel' as const,
            prerequisites: []
          },
          {
            id: 'energi',
            name: 'Energi och arbete',
            description: 'Lär dig om olika energiformer',
            difficulty: 'svår' as const,
            prerequisites: ['krafter']
          }
        ]
      }
    },
    'svenska': {
      'skrivande': {
        id: 'skrivande',
        name: 'Skrivande',
        description: 'Textproduktion och grammatik',
        skills: [
          {
            id: 'grammatik',
            name: 'Grammatik',
            description: 'Grundläggande grammatiska regler',
            difficulty: 'lätt' as const,
            prerequisites: []
          },
          {
            id: 'stavning',
            name: 'Stavning',
            description: 'Rättstavning och språkregler',
            difficulty: 'medel' as const,
            prerequisites: []
          }
        ]
      }
    },
    'engelska': {
      'writing': {
        id: 'writing',
        name: 'Writing',
        description: 'English writing and vocabulary',
        skills: [
          {
            id: 'vocabulary',
            name: 'Vocabulary',
            description: 'Expand your English vocabulary',
            difficulty: 'lätt' as const,
            prerequisites: []
          },
          {
            id: 'grammar',
            name: 'Grammar',
            description: 'English grammar rules and usage',
            difficulty: 'medel' as const,
            prerequisites: []
          }
        ]
      }
    },
    'kemi': {
      'binding': {
        id: 'binding',
        name: 'Binding',
        description: 'Kemiska bindningar och strukturer',
        skills: [
          {
            id: 'kovalenta-bindningar',
            name: 'Kovalenta bindningar',
            description: 'Förstå kovalenta bindningar',
            difficulty: 'medel' as const,
            prerequisites: []
          },
          {
            id: 'jonbindningar',
            name: 'Jonbindningar',
            description: 'Lär dig om jonbindningar',
            difficulty: 'svår' as const,
            prerequisites: ['kovalenta-bindningar']
          }
        ]
      }
    },
    'biologi': {
      'genetik': {
        id: 'genetik',
        name: 'Genetik',
        description: 'Arv, gener och DNA',
        skills: [
          {
            id: 'dna-struktur',
            name: 'DNA struktur',
            description: 'Lär dig om DNA:s byggstenar och struktur',
            difficulty: 'medel' as const,
            prerequisites: []
          },
          {
            id: 'genetisk-kod',
            name: 'Genetisk kod',
            description: 'Förstå hur genetisk information översätts',
            difficulty: 'svår' as const,
            prerequisites: ['dna-struktur']
          }
        ]
      }
    }
  }

  const skillCountsData = {
    'matematik': {
      'algebra': {
        'variabler-uttryck': { lessons: 3, exercises: 8 },
        'enkla-ekvationer': { lessons: 4, exercises: 10 },
        'parenteser': { lessons: 2, exercises: 6 }
      }
    },
    'fysik': {
      'mekanik': {
        'krafter': { lessons: 3, exercises: 8 },
        'energi': { lessons: 4, exercises: 10 }
      }
    },
    'svenska': {
      'skrivande': {
        'grammatik': { lessons: 2, exercises: 6 },
        'stavning': { lessons: 3, exercises: 8 }
      }
    },
    'engelska': {
      'writing': {
        'vocabulary': { lessons: 2, exercises: 6 },
        'grammar': { lessons: 3, exercises: 8 }
      }
    },
    'kemi': {
      'binding': {
        'kovalenta-bindningar': { lessons: 3, exercises: 8 },
        'jonbindningar': { lessons: 4, exercises: 10 }
      }
    },
    'biologi': {
      'genetik': {
        'dna-struktur': { lessons: 3, exercises: 8 },
        'genetisk-kod': { lessons: 2, exercises: 6 }
      }
    }
  }

  const subject = subjectData[subjectId as keyof typeof subjectData] || subjectData['matematik']
  const topic = topicsData[subjectId as keyof typeof topicsData]?.[topicId as keyof typeof topicsData[keyof typeof topicsData]] || topicsData['matematik']['algebra']
  const skillCounts = skillCountsData[subjectId as keyof typeof skillCountsData]?.[topicId as keyof typeof skillCountsData[keyof typeof skillCountsData]] || skillCountsData['matematik']['algebra']

  const skills = topic.skills

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href={`/study/${subject.id}`}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{topic.name}</h1>
          <p className="text-muted-foreground">{subject.name}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Färdigheter inom {topic.name}</h2>
          <p className="text-muted-foreground">
            {topic.description}
          </p>
        </div>
        
        {skills.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              Inga färdigheter tillgängliga för {topic.name} ännu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                subjectId={subject.id}
                topicId={topic.id}
                lessonCount={skillCounts[skill.id as keyof typeof skillCounts]?.lessons || 0}
                exerciseCount={skillCounts[skill.id as keyof typeof skillCounts]?.exercises || 0}
                completedLessons={0} // TODO: Get from user progress
                completedExercises={0} // TODO: Get from user progress
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}