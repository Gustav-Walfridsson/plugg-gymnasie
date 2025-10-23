// Script to populate the lessons table with actual lesson data
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// This is the actual lesson data from the frontend
const lessonsData = {
  'matematik': {
    'algebra': {
      'variabler-uttryck': [
        {
          id: 'variabler-grunderna',
          title: 'Variabler och konstanter',
          content: 'En variabel är en bokstav som representerar ett okänt värde, medan en konstant har ett fast värde. I uttrycket 2x + 5 är x en variabel och 2 och 5 är konstanter.',
          order: 1
        },
        {
          id: 'algebraiska-uttryck',
          title: 'Algebraiska uttryck',
          content: 'Ett algebraiskt uttryck består av variabler, konstanter och operationer. Exempel: 3x + 2y - 5',
          order: 2
        },
        {
          id: 'uttryck-berakning',
          title: 'Beräkning av uttryck',
          content: 'För att beräkna ett uttryck ersätter du variablerna med givna värden och utför beräkningarna enligt räkneordning.',
          order: 3
        }
      ],
      'enkla-ekvationer': [
        {
          id: 'ekvationer-grunderna',
          title: 'Grundläggande ekvationer',
          content: 'En ekvation är en matematisk likhet som innehåller en eller flera variabler. Målet är att hitta värdet på variabeln som gör likheten sann.',
          order: 1
        },
        {
          id: 'losning-av-ekvationer',
          title: 'Lösning av ekvationer',
          content: 'För att lösa en ekvation:\n1. Samla alla x-termer på ena sidan.\n2. Samla alla konstanter på andra sidan.\n3. Dividera med koefficienten för x.',
          order: 2
        }
      ],
      'parenteser': [
        {
          id: 'parenteser-grunderna',
          title: 'Parenteser och uttryck',
          content: 'Parenteser används för att gruppera termer i algebraiska uttryck. De påverkar räkneordningen.',
          order: 1
        },
        {
          id: 'parenteser-utveckling',
          title: 'Utveckling av parenteser',
          content: 'För att utveckla parenteser använder man distributiva lagen: a(b + c) = ab + ac',
          order: 2
        }
      ]
    }
  },
  'fysik': {
    'mekanik': {
      'krafter': [
        {
          id: 'krafter-grunderna',
          title: 'Krafter och rörelse',
          content: 'En kraft är en vektorstorhet som kan ändra ett föremåls rörelse eller form.',
          order: 1
        },
        {
          id: 'newtons-lagar',
          title: 'Newtons lagar',
          content: 'Newtons första lag: Ett föremål i vila förblir i vila om ingen kraft verkar på det.',
          order: 2
        }
      ],
      'energi': [
        {
          id: 'energi-grunderna',
          title: 'Arbete, kraft och energi',
          content: 'Arbete definieras som kraft gånger sträcka: W = F × s',
          order: 1
        },
        {
          id: 'energi-bevarande',
          title: 'Energibevarande',
          content: 'Energi kan varken skapas eller förstöras, bara omvandlas från en form till en annan.',
          order: 2
        }
      ]
    }
  },
  'svenska': {
    'skrivande': {
      'grammatik': [
        {
          id: 'grammatik-grunderna',
          title: 'Grammatik och syntax',
          content: 'Grammatik är reglerna för hur ord kombineras för att bilda meningar.',
          order: 1
        },
        {
          id: 'satser-ordklasser',
          title: 'Satser och ordklasser',
          content: 'En sats består av subjekt och predikat. Ordklasserna är substantiv, verb, adjektiv, pronomen, prepositioner, konjunktioner och interjektioner.',
          order: 2
        }
      ],
      'stavning': [
        {
          id: 'stavning-grunderna',
          title: 'Rättstavning och språkregler',
          content: 'Rättstavning är viktigt för tydlig kommunikation. Lär dig grundreglerna för svensk stavning.',
          order: 1
        }
      ]
    }
  },
  'engelska': {
    'writing': {
      'vocabulary': [
        {
          id: 'vocabulary-grunderna',
          title: 'Ord och uttryck',
          content: 'Vocabulary is essential for effective communication in English.',
          order: 1
        }
      ],
      'grammar': [
        {
          id: 'grammar-grunderna',
          title: 'Grammar and syntax',
          content: 'English grammar rules for sentence structure and word usage.',
          order: 1
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
          content: 'Kovalenta bindningar bildas när atomer delar elektroner.',
          order: 1
        }
      ],
      'jonbindningar': [
        {
          id: 'jonbindningar-grunderna',
          title: 'Jonbindningar',
          content: 'Jonbindningar bildas när atomer överför elektroner.',
          order: 1
        }
      ]
    }
  },
  'biologi': {
    'genetik': {
      'dna-struktur': [
        {
          id: 'dna-grunderna',
          title: 'DNA struktur',
          content: 'DNA består av fyra nukleotider: adenin, tymin, guanin och cytosin.',
          order: 1
        }
      ],
      'genetisk-kod': [
        {
          id: 'genetisk-kod-grunderna',
          title: 'Genetisk kod',
          content: 'Den genetiska koden översätter DNA-information till proteiner.',
          order: 1
        }
      ]
    }
  }
}

async function populateLessons() {
  try {
    console.log('🚀 Populating lessons table with actual lesson data...')
    console.log('=' .repeat(60))
    
    let totalLessons = 0
    
    // First, let's check if lessons already exist
    const { data: existingLessons, error: checkError } = await supabase
      .from('lessons')
      .select('count')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Error checking existing lessons:', checkError.message)
      return false
    }
    
    console.log(`📊 Current lessons in database: ${existingLessons?.length || 0}`)
    
    // Process each subject
    for (const [subjectId, subjectData] of Object.entries(lessonsData)) {
      console.log(`\n📚 Processing subject: ${subjectId}`)
      
      for (const [topicId, topicData] of Object.entries(subjectData)) {
        console.log(`  📖 Processing topic: ${topicId}`)
        
        for (const [skillId, skillLessons] of Object.entries(topicData)) {
          console.log(`    🎯 Processing skill: ${skillId}`)
          
          for (const lesson of skillLessons) {
            try {
              const { error } = await supabase
                .from('lessons')
                .insert({
                  id: lesson.id,
                  skill_id: skillId,
                  title: lesson.title,
                  content: lesson.content,
                  order: lesson.order
                })
              
              if (error) {
                if (error.code === '23505') {
                  console.log(`      ⚠️ Lesson ${lesson.id} already exists, skipping`)
                } else {
                  console.error(`      ❌ Error inserting lesson ${lesson.id}:`, error.message)
                }
              } else {
                console.log(`      ✅ Inserted lesson: ${lesson.title}`)
                totalLessons++
              }
            } catch (err) {
              console.error(`      ❌ Exception inserting lesson ${lesson.id}:`, err)
            }
          }
        }
      }
    }
    
    console.log(`\n🎉 Population complete!`)
    console.log(`📊 Total lessons inserted: ${totalLessons}`)
    
    // Verify the data
    const { data: finalLessons, error: finalError } = await supabase
      .from('lessons')
      .select('id, title, skill_id')
      .limit(10)
    
    if (finalError) {
      console.error('❌ Error verifying lessons:', finalError.message)
    } else {
      console.log(`\n✅ Verification: Found ${finalLessons?.length || 0} lessons in database`)
      if (finalLessons && finalLessons.length > 0) {
        console.log('📋 Sample lessons:')
        finalLessons.forEach(lesson => {
          console.log(`   - ${lesson.id}: ${lesson.title} (skill: ${lesson.skill_id})`)
        })
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Population failed:', error)
    return false
  }
}

populateLessons()
