#!/usr/bin/env node
/**
 * Quick Content Import Script
 * 
 * This script helps import practice content if the database is empty.
 * Run this if you're seeing "no data found" messages on the pages.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Check if we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...')
  
  try {
    // Check if subjects table exists and has data
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
      .limit(5)

    if (subjectsError) {
      console.log('❌ Subjects table error:', subjectsError.message)
      return false
    }

    console.log(`📚 Found ${subjects?.length || 0} subjects in database`)
    
    if (!subjects || subjects.length === 0) {
      console.log('⚠️ No subjects found - database needs content import')
      return false
    }

    // Check if items table has data
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id')
      .limit(5)

    if (itemsError) {
      console.log('❌ Items table error:', itemsError.message)
      return false
    }

    console.log(`🎯 Found ${items?.length || 0} practice items in database`)
    
    if (!items || items.length === 0) {
      console.log('⚠️ No practice items found - database needs content import')
      return false
    }

    console.log('✅ Database has content - no import needed')
    return true

  } catch (error) {
    console.error('❌ Error checking database:', error.message)
    return false
  }
}

async function runContentImport() {
  console.log('🚀 Starting content import...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250121000007_import_practice_content.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      console.log('💡 Make sure you\'re running this from the plugg-bot-1 directory')
      return false
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length === 0) continue

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.warn(`⚠️ Statement ${i + 1} warning:`, error.message)
          // Continue with other statements
        }
      } catch (err) {
        console.warn(`⚠️ Statement ${i + 1} error:`, err.message)
        // Continue with other statements
      }
    }

    console.log('✅ Content import completed!')
    return true

  } catch (error) {
    console.error('❌ Error during content import:', error.message)
    return false
  }
}

async function main() {
  console.log('🔧 Plugg Bot 1 - Database Content Checker')
  console.log('==========================================')
  
  const hasContent = await checkDatabaseStatus()
  
  if (!hasContent) {
    console.log('\n🔄 Database needs content import...')
    const success = await runContentImport()
    
    if (success) {
      console.log('\n✅ Content import completed successfully!')
      console.log('🔄 Please refresh your browser to see the new content.')
    } else {
      console.log('\n❌ Content import failed.')
      console.log('💡 You can manually run the migration using Supabase CLI:')
      console.log('   npx supabase db reset --local')
      console.log('   npx supabase db push --local')
    }
  } else {
    console.log('\n✅ Database is ready - no action needed!')
  }
}

// Run the script
main().catch(console.error)
