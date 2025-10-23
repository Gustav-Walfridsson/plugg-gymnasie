'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Target, Clock, Play, CheckCircle } from 'lucide-react'
import { LessonCard } from '../../../../../components/study/LessonCard'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase-client'
import { useAuth } from '../../../../../lib/auth-simple'

export default function SkillDetailPage() {
  const params = useParams()
  const subjectId = params.subject as string
  const topicId = params.topic as string
  const skillId = params.skillId as string
  
  const { user, accountId } = useAuth()

  // State for completed lessons
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [loadingCompleted, setLoadingCompleted] = useState(true)

  // Load completed lessons from database
  useEffect(() => {
    const loadCompletedLessons = async () => {
      if (!accountId) {
        setLoadingCompleted(false)
        return
      }

      try {
        console.log('📚 Loading completed lessons for account:', accountId)
        const { data, error } = await supabase
          .from('lesson_completions')
          .select('lesson_id')
          .eq('account_id', accountId)

        if (error) {
          console.error('❌ Error loading completed lessons:', error)
        } else {
          console.log('✅ Loaded completed lessons:', data?.length || 0)
          const completedSet = new Set(data?.map(item => item.lesson_id) || [])
          setCompletedLessons(completedSet)
        }
      } catch (error) {
        console.error('❌ Error loading completed lessons:', error)
      } finally {
        setLoadingCompleted(false)
      }
    }

    loadCompletedLessons()
  }, [accountId])

  // Handle lesson completion
  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]))
  }

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
        description: 'Variabler, uttryck och ekvationer'
      }
    },
    'fysik': {
      'mekanik': {
        id: 'mekanik',
        name: 'Mekanik',
        description: 'Krafter, rörelse och energi'
      }
    },
    'svenska': {
      'skrivande': {
        id: 'skrivande',
        name: 'Skrivande',
        description: 'Textproduktion och grammatik'
      }
    },
    'engelska': {
      'writing': {
        id: 'writing',
        name: 'Writing',
        description: 'English writing and vocabulary'
      }
    },
    'kemi': {
      'binding': {
        id: 'binding',
        name: 'Binding',
        description: 'Kemiska bindningar och strukturer'
      }
    },
    'biologi': {
      'genetik': {
        id: 'genetik',
        name: 'Genetik',
        description: 'Arv, gener och DNA'
      }
    }
  }

  const skillsData = {
    'matematik': {
      'algebra': {
        'variabler-uttryck': {
          id: 'variabler-uttryck',
          name: 'Variabler och uttryck',
          description: 'Lär dig grundläggande algebraiska uttryck',
          difficulty: 'lätt' as const,
          prerequisites: []
        },
        'enkla-ekvationer': {
          id: 'enkla-ekvationer',
          name: 'Enkla ekvationer',
          description: 'Lös enkla ekvationer med en obekant',
          difficulty: 'medel' as const,
          prerequisites: ['variabler-uttryck']
        },
        'parenteser': {
          id: 'parenteser',
          name: 'Parenteser',
          description: 'Arbeta med parenteser i algebraiska uttryck',
          difficulty: 'medel' as const,
          prerequisites: ['variabler-uttryck']
        }
      }
    },
    'fysik': {
      'mekanik': {
        'krafter': {
          id: 'krafter',
          name: 'Krafter och rörelse',
          description: 'Förstå hur krafter påverkar rörelse',
          difficulty: 'medel' as const,
          prerequisites: []
        },
        'energi': {
          id: 'energi',
          name: 'Energi och arbete',
          description: 'Lär dig om olika energiformer',
          difficulty: 'svår' as const,
          prerequisites: ['krafter']
        }
      }
    },
    'svenska': {
      'skrivande': {
        'grammatik': {
          id: 'grammatik',
          name: 'Grammatik',
          description: 'Grundläggande grammatiska regler',
          difficulty: 'lätt' as const,
          prerequisites: []
        },
        'stavning': {
          id: 'stavning',
          name: 'Stavning',
          description: 'Rättstavning och språkregler',
          difficulty: 'medel' as const,
          prerequisites: []
        }
      }
    },
    'engelska': {
      'writing': {
        'vocabulary': {
          id: 'vocabulary',
          name: 'Vocabulary',
          description: 'Expand your English vocabulary',
          difficulty: 'lätt' as const,
          prerequisites: []
        },
        'grammar': {
          id: 'grammar',
          name: 'Grammar',
          description: 'English grammar rules and usage',
          difficulty: 'medel' as const,
          prerequisites: []
        }
      }
    },
    'kemi': {
      'binding': {
        'kovalenta-bindningar': {
          id: 'kovalenta-bindningar',
          name: 'Kovalenta bindningar',
          description: 'Förstå kovalenta bindningar',
          difficulty: 'medel' as const,
          prerequisites: []
        },
        'jonbindningar': {
          id: 'jonbindningar',
          name: 'Jonbindningar',
          description: 'Lär dig om jonbindningar',
          difficulty: 'svår' as const,
          prerequisites: ['kovalenta-bindningar']
        }
      }
    },
    'biologi': {
      'genetik': {
        'dna-struktur': {
          id: 'dna-struktur',
          name: 'DNA struktur',
          description: 'Lär dig om DNA:s byggstenar och struktur',
          difficulty: 'medel' as const,
          prerequisites: []
        },
        'genetisk-kod': {
          id: 'genetisk-kod',
          name: 'Genetisk kod',
          description: 'Förstå hur genetisk information översätts',
          difficulty: 'svår' as const,
          prerequisites: ['dna-struktur']
        }
      }
    }
  }

  const lessonsData = {
    'matematik': {
      'algebra': {
        'variabler-uttryck': [
          {
            id: 'variabler-grunderna',
            title: 'Variabler och konstanter',
            description: 'Lär dig skillnaden mellan variabler och konstanter',
            content: 'En variabel är en bokstav som representerar ett okänt värde, medan en konstant har ett fast värde. I uttrycket 2x + 5 är x en variabel och 2 och 5 är konstanter.',
            duration: 15,
            difficulty: 'lätt' as const,
            skills: ['variabler-uttryck']
          },
          {
            id: 'algebraiska-uttryck',
            title: 'Algebraiska uttryck',
            description: 'Förstå hur man skriver och läser algebraiska uttryck',
            content: 'Ett algebraiskt uttryck består av variabler, konstanter och operationer. Exempel: 3x + 2y - 5',
            duration: 20,
            difficulty: 'lätt' as const,
            skills: ['variabler-uttryck']
          },
          {
            id: 'uttryck-berakning',
            title: 'Beräkning av uttryck',
            description: 'Lär dig beräkna algebraiska uttryck för givna värden',
            content: 'För att beräkna ett uttryck ersätter du variablerna med givna värden och utför beräkningarna enligt räkneordning.',
            duration: 25,
            difficulty: 'medel' as const,
            skills: ['variabler-uttryck']
          }
        ],
        'enkla-ekvationer': [
          {
            id: 'ekvationer-grunderna',
            title: 'Grundläggande ekvationer',
            description: 'Lär dig lösa enkla ekvationer med en obekant',
            content: 'En ekvation är en likhet mellan två uttryck. För att lösa en ekvation använder vi balansmetoden.',
            duration: 20,
            difficulty: 'medel' as const,
            skills: ['enkla-ekvationer']
          },
          {
            id: 'ekvationer-losning',
            title: 'Lösning av ekvationer',
            description: 'Steg-för-steg lösning av ekvationer',
            content: '1. Samla alla x-termer på ena sidan. 2. Samla alla konstanter på andra sidan. 3. Dividera med koefficienten för x.',
            duration: 30,
            difficulty: 'medel' as const,
            skills: ['enkla-ekvationer']
          }
        ],
        'parenteser': [
          {
            id: 'parenteser-grunderna',
            title: 'Regler för parenteser',
            description: 'Lär dig arbeta med parenteser i algebraiska uttryck',
            content: 'Parenteser används för att gruppera termer. När vi multiplicerar in i parenteser använder vi distributiva lagen.',
            duration: 15,
            difficulty: 'medel' as const,
            skills: ['parenteser']
          }
        ]
      }
    },
    'fysik': {
      'mekanik': {
        'krafter': [
          {
            id: 'krafter-grunderna',
            title: 'Grundläggande krafter',
            description: 'Lär dig om olika typer av krafter',
            content: 'Krafter kan vara kontaktkrafter eller avståndskrafter. Exempel: tyngdkraft, normalkraft, friktion.',
            duration: 20,
            difficulty: 'medel' as const,
            skills: ['krafter']
          }
        ],
        'energi': [
          {
            id: 'energi-typer',
            title: 'Olika energiformer',
            description: 'Lär dig om kinetisk och potentiell energi',
            content: 'Kinetisk energi är rörelseenergi, potentiell energi är lägesenergi. Energi kan omvandlas mellan olika former.',
            duration: 25,
            difficulty: 'svår' as const,
            skills: ['energi']
          }
        ]
      }
    },
    'svenska': {
      'skrivande': {
        'grammatik': [
          {
            id: 'grammatik-grunderna',
            title: 'Grundläggande grammatik',
            description: 'Lär dig om substantiv, verb och adjektiv',
            content: 'Substantiv är namn på personer, djur, ting eller begrepp. Verb beskriver handlingar eller tillstånd.',
            duration: 15,
            difficulty: 'lätt' as const,
            skills: ['grammatik']
          }
        ],
        'stavning': [
          {
            id: 'stavning-regler',
            title: 'Stavningsregler',
            description: 'Grundläggande stavningsregler på svenska',
            content: 'Lär dig om dubbelteckning, stora bokstäver och andra viktiga stavningsregler.',
            duration: 20,
            difficulty: 'medel' as const,
            skills: ['stavning']
          }
        ]
      }
    },
    'engelska': {
      'writing': {
        'vocabulary': [
          {
            id: 'vocabulary-basic',
            title: 'Basic Vocabulary',
            description: 'Learn essential English words',
            content: 'Start with common words used in everyday conversation and writing.',
            duration: 15,
            difficulty: 'lätt' as const,
            skills: ['vocabulary']
          }
        ],
        'grammar': [
          {
            id: 'grammar-basic',
            title: 'Basic Grammar',
            description: 'Learn fundamental English grammar rules',
            content: 'Understand sentence structure, verb tenses, and basic grammar concepts.',
            duration: 20,
            difficulty: 'medel' as const,
            skills: ['grammar']
          }
        ]
      }
    },
    'kemi': {
      'binding': {
        'kovalenta-bindningar': [
          {
            id: 'kovalenta-grunderna',
            title: 'Kovalenta bindningar',
            description: 'Lär dig om kovalenta bindningar',
            content: 'Kovalenta bindningar bildas när atomer delar elektroner. Detta sker mellan icke-metaller.',
            duration: 20,
            difficulty: 'medel' as const,
            skills: ['kovalenta-bindningar']
          }
        ],
        'jonbindningar': [
          {
            id: 'jonbindningar-grunderna',
            title: 'Jonbindningar',
            description: 'Förstå jonbindningar',
            content: 'Jonbindningar bildas mellan metaller och icke-metaller genom överföring av elektroner.',
            duration: 25,
            difficulty: 'svår' as const,
            skills: ['jonbindningar']
          }
        ]
      }
    },
    'biologi': {
      'genetik': {
        'dna-struktur': [
          {
            id: 'dna-grunderna',
            title: 'DNA:s grundläggande struktur',
            description: 'Introduktion till DNA:s byggstenar och dubbelhelix',
            content: 'DNA (deoxyribonucleic acid) är en nukleinsyra som innehåller den genetiska informationen i alla levande organismer. DNA består av två kedjor som är tvinnade runt varandra i en dubbelhelix-struktur. Varje kedja består av nukleotider som är uppbyggda av en fosfatgrupp, en socker (deoxyribos) och en kvävebas.',
            duration: 15,
            difficulty: 'lätt' as const,
            skills: ['dna-struktur']
          },
          {
            id: 'nukleotider',
            title: 'Nukleotider och baspar',
            description: 'Förstå de fyra nukleotiderna och hur de parar ihop sig',
            content: 'DNA består av fyra olika nukleotider: Adenin (A), Tymin (T), Guanin (G) och Cytosin (C). Dessa nukleotider parar ihop sig enligt specifika regler: A parar alltid med T, och G parar alltid med C. Denna parning sker genom vätebindningar mellan baserna.',
            duration: 20,
            difficulty: 'medel' as const,
            skills: ['dna-struktur']
          },
          {
            id: 'dna-replikation',
            title: 'DNA-replikation',
            description: 'Hur DNA kopieras vid celldelning',
            content: 'DNA-replikation är processen där DNA kopieras innan celldelning. Detta sker genom att DNA-helixen "öppnas" och varje kedja fungerar som en mall för att bygga en ny komplementär kedja. Resultatet är två identiska DNA-molekyler.',
            duration: 25,
            difficulty: 'svår' as const,
            skills: ['dna-struktur']
          }
        ],
        'genetisk-kod': [
          {
            id: 'genetisk-kod-grunderna',
            title: 'Den genetiska koden',
            description: 'Förstå hur genetisk information översätts',
            content: 'Den genetiska koden består av tripletter av nukleotider som kodar för aminosyror. Varje triplett kallas för en kodon.',
            duration: 20,
            difficulty: 'svår' as const,
            skills: ['genetisk-kod']
          },
          {
            id: 'protein-syntes',
            title: 'Proteinsyntes',
            description: 'Hur proteiner bildas från genetisk information',
            content: 'Proteinsyntes sker i två steg: transkription (DNA → RNA) och translation (RNA → protein).',
            duration: 25,
            difficulty: 'svår' as const,
            skills: ['genetisk-kod']
          }
        ]
      }
    }
  }

  const exercisesData = {
    'matematik': {
      'algebra': {
        'variabler-uttryck': [
          {
            id: 'variabler-quiz-1',
            prompt: 'Vad är en variabel i algebra?',
            type: 'multiple-choice' as const,
            difficulty: 'lätt' as const,
            skills: ['variabler-uttryck']
          },
          {
            id: 'variabler-quiz-2',
            prompt: 'Beräkna uttrycket 2x + 3 när x = 5',
            type: 'short-answer' as const,
            difficulty: 'lätt' as const,
            skills: ['variabler-uttryck']
          }
        ],
        'enkla-ekvationer': [
          {
            id: 'ekvationer-quiz-1',
            prompt: 'Lös ekvationen x + 5 = 10',
            type: 'short-answer' as const,
            difficulty: 'medel' as const,
            skills: ['enkla-ekvationer']
          }
        ],
        'parenteser': [
          {
            id: 'parenteser-quiz-1',
            prompt: 'Förenkla uttrycket 2(x + 3)',
            type: 'short-answer' as const,
            difficulty: 'medel' as const,
            skills: ['parenteser']
          }
        ]
      }
    },
    'fysik': {
      'mekanik': {
        'krafter': [
          {
            id: 'krafter-quiz-1',
            prompt: 'Vilka typer av krafter finns det?',
            type: 'multiple-choice' as const,
            difficulty: 'medel' as const,
            skills: ['krafter']
          }
        ],
        'energi': [
          {
            id: 'energi-quiz-1',
            prompt: 'Förklara skillnaden mellan kinetisk och potentiell energi',
            type: 'short-answer' as const,
            difficulty: 'svår' as const,
            skills: ['energi']
          }
        ]
      }
    },
    'svenska': {
      'skrivande': {
        'grammatik': [
          {
            id: 'grammatik-quiz-1',
            prompt: 'Vad är skillnaden mellan substantiv och verb?',
            type: 'short-answer' as const,
            difficulty: 'lätt' as const,
            skills: ['grammatik']
          }
        ],
        'stavning': [
          {
            id: 'stavning-quiz-1',
            prompt: 'Stava rätt: "förståelse" eller "förståelse"?',
            type: 'multiple-choice' as const,
            difficulty: 'medel' as const,
            skills: ['stavning']
          }
        ]
      }
    },
    'engelska': {
      'writing': {
        'vocabulary': [
          {
            id: 'vocabulary-quiz-1',
            prompt: 'What does "beautiful" mean?',
            type: 'multiple-choice' as const,
            difficulty: 'lätt' as const,
            skills: ['vocabulary']
          }
        ],
        'grammar': [
          {
            id: 'grammar-quiz-1',
            prompt: 'Choose the correct form: "I am" or "I is"?',
            type: 'multiple-choice' as const,
            difficulty: 'medel' as const,
            skills: ['grammar']
          }
        ]
      }
    },
    'kemi': {
      'binding': {
        'kovalenta-bindningar': [
          {
            id: 'kovalenta-quiz-1',
            prompt: 'Vad är en kovalent bindning?',
            type: 'short-answer' as const,
            difficulty: 'medel' as const,
            skills: ['kovalenta-bindningar']
          }
        ],
        'jonbindningar': [
          {
            id: 'jonbindningar-quiz-1',
            prompt: 'Förklara skillnaden mellan kovalenta och jonbindningar',
            type: 'short-answer' as const,
            difficulty: 'svår' as const,
            skills: ['jonbindningar']
          }
        ]
      }
    },
    'biologi': {
      'genetik': {
        'dna-struktur': [
          {
            id: 'dna-quiz-1',
            prompt: 'Vilka är de fyra nukleotiderna i DNA?',
            type: 'multiple-choice' as const,
            difficulty: 'lätt' as const,
            skills: ['dna-struktur']
          },
          {
            id: 'dna-quiz-2',
            prompt: 'Förklara hur baspar bildas i DNA',
            type: 'short-answer' as const,
            difficulty: 'medel' as const,
            skills: ['dna-struktur']
          }
        ],
        'genetisk-kod': [
          {
            id: 'genetisk-kod-quiz-1',
            prompt: 'Vad är en kodon?',
            type: 'short-answer' as const,
            difficulty: 'svår' as const,
            skills: ['genetisk-kod']
          }
        ]
      }
    }
  }

  const subject = subjectData[subjectId as keyof typeof subjectData] || subjectData['matematik']
  const topic = topicsData[subjectId as keyof typeof topicsData]?.[topicId as keyof typeof topicsData[keyof typeof topicsData]] || topicsData['matematik']['algebra']
  const skill = skillsData[subjectId as keyof typeof skillsData]?.[topicId as keyof typeof skillsData[keyof typeof skillsData]]?.[skillId as keyof typeof skillsData[keyof typeof skillsData][keyof typeof skillsData[keyof typeof skillsData]]] || skillsData['matematik']['algebra']['variabler-uttryck']
  const lessons = lessonsData[subjectId as keyof typeof lessonsData]?.[topicId as keyof typeof lessonsData[keyof typeof lessonsData]]?.[skillId as keyof typeof lessonsData[keyof typeof lessonsData][keyof typeof lessonsData[keyof typeof lessonsData]]] || lessonsData['matematik']['algebra']['variabler-uttryck']
  const exercises = exercisesData[subjectId as keyof typeof exercisesData]?.[topicId as keyof typeof exercisesData[keyof typeof exercisesData]]?.[skillId as keyof typeof exercisesData[keyof typeof exercisesData][keyof typeof exercisesData[keyof typeof exercisesData]]] || exercisesData['matematik']['algebra']['variabler-uttryck']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'lätt': return 'text-green-600 bg-green-100'
      case 'medel': return 'text-yellow-600 bg-yellow-100'
      case 'svår': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'lätt': return 'Lätt'
      case 'medel': return 'Medel'
      case 'svår': return 'Svår'
      default: return 'Okänd'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link 
          href={`/study/${subject.id}/${topic.id}`}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{skill.name}</h1>
          <p className="text-muted-foreground">{subject.name} • {topic.name}</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Skill Info */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">{skill.name}</h2>
              <p className="text-muted-foreground mb-4">{skill.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(skill.difficulty)}`}>
              {getDifficultyText(skill.difficulty)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                {lessons.length} lektioner
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">
                {exercises.length} övningar
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">
                ~{lessons.reduce((total, lesson) => total + lesson.duration, 0)} min
              </span>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lektioner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={completedLessons.has(lesson.id)}
                onComplete={handleLessonComplete}
              />
            ))}
          </div>
        </div>

        {/* Practice Button */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Träna färdigheten</h3>
              <p className="text-muted-foreground">
                Öva med {exercises.length} övningar för att behärska {skill.name}
              </p>
            </div>
            <Link
              href={`/practice/${skill.id}`}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Börja träna</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}