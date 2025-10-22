#!/usr/bin/env node
/**
 * Quick Database Status Checker
 * 
 * This script checks if your Supabase database has the required content.
 * Run this to see if you need to import content.
 */

const { createClient } = require('@supabase/supabase-js')

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables')
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking database status...')
  console.log('================================')
  
  try {
    // Check subjects
    console.log('📚 Checking subjects...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
      .limit(5)
    
    if (subjectsError) {
      console.log('❌ Subjects table error:', subjectsError.message)
      console.log('💡 This means the subjects table doesn\'t exist or has issues')
    } else {
      console.log(`✅ Found ${subjects?.length || 0} subjects`)
      if (subjects && subjects.length > 0) {
        console.log('   Sample subjects:', subjects.map(s => s.name).join(', '))
      }
    }
    
    // Check items
    console.log('\n🎯 Checking practice items...')
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, type')
      .limit(5)
    
    if (itemsError) {
      console.log('❌ Items table error:', itemsError.message)
      console.log('💡 This means the items table doesn\'t exist or has issues')
    } else {
      console.log(`✅ Found ${items?.length || 0} practice items`)
      if (items && items.length > 0) {
        const types = [...new Set(items.map(i => i.type))]
        console.log('   Item types:', types.join(', '))
      }
    }
    
    // Check flashcards specifically
    console.log('\n🃏 Checking flashcards...')
    const { data: flashcards, error: flashcardsError } = await supabase
      .from('items')
      .select('id')
      .eq('type', 'flashcard')
      .limit(5)
    
    if (flashcardsError) {
      console.log('❌ Flashcards error:', flashcardsError.message)
    } else {
      console.log(`✅ Found ${flashcards?.length || 0} flashcards`)
    }
    
    // Summary
    console.log('\n📊 Summary:')
    console.log('===========')
    
    if (subjectsError || itemsError) {
      console.log('❌ Database needs setup - tables are missing or have issues')
      console.log('💡 You need to run the migrations first:')
      console.log('   npx supabase db reset --local')
      console.log('   npx supabase db push --local')
    } else if ((subjects?.length || 0) === 0 || (items?.length || 0) === 0) {
      console.log('⚠️ Database exists but has no content')
      console.log('💡 You need to import content:')
      console.log('   npx supabase db reset --local')
      console.log('   npx supabase db push --local')
    } else {
      console.log('✅ Database is ready with content!')
      console.log('🎉 Your pages should work now')
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message)
    console.log('💡 Check your Supabase URL and key')
  }
}

checkDatabase()
