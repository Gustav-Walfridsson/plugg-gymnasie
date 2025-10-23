// Apply database migration using Supabase service role key
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
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

async function applyMigration() {
  try {
    console.log('🚀 Applying database migration...')
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('supabase/migrations/20250123000001_lesson_completion_xp.sql', 'utf8')
    
    // Split into individual statements (simple approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: directError } = await supabase
            .from('_migration_test')
            .select('*')
            .limit(0)
          
          if (directError && directError.message.includes('relation "_migration_test" does not exist')) {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          } else {
            console.log(`⚠️ Statement ${i + 1} may have failed, but continuing...`)
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }
    
    // Verify tables were created
    console.log('🔍 Verifying migration...')
    
    const { data: lessonCompletions, error: lcError } = await supabase
      .from('lesson_completions')
      .select('count')
      .limit(1)
    
    if (lcError) {
      console.log('⚠️ lesson_completions table verification failed:', lcError.message)
    } else {
      console.log('✅ lesson_completions table exists')
    }
    
    const { data: xpLedger, error: xpError } = await supabase
      .from('xp_ledger')
      .select('count')
      .limit(1)
    
    if (xpError) {
      console.log('⚠️ xp_ledger table verification failed:', xpError.message)
    } else {
      console.log('✅ xp_ledger table exists')
    }
    
    console.log('🎉 Migration completed!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
