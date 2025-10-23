#!/usr/bin/env node

/**
 * Apply Lesson Completion Migration
 * 
 * This script provides instructions for applying the lesson_completions and xp_ledger migration
 */

console.log('🔧 LESSON COMPLETION MIGRATION')
console.log('==============================')

console.log('\n❌ PROBLEM IDENTIFIED:')
console.log('The "Markera som läst" button is not working because the required database tables are missing:')
console.log('- lesson_completions table')
console.log('- xp_ledger table')
console.log('- completed_lessons_count column in accounts table')

console.log('\n✅ SOLUTION:')
console.log('I have created the migration file: supabase/migrations/20250123000001_lesson_completion_xp.sql')
console.log('This migration creates all the required tables and columns.')

console.log('\n📋 MIGRATION CONTENTS:')
console.log('1. ✅ Creates lesson_completions table with unique constraint (account_id, lesson_id)')
console.log('2. ✅ Creates xp_ledger table for XP audit trail')
console.log('3. ✅ Adds completed_lessons_count column to accounts table')
console.log('4. ✅ Creates proper indexes for performance')
console.log('5. ✅ Sets up RLS policies for security')
console.log('6. ✅ Uses get_account_id() function for RLS')

console.log('\n🚀 HOW TO APPLY THE MIGRATION:')

console.log('\nOPTION 1: Supabase Dashboard (Recommended)')
console.log('1. Go to your Supabase project dashboard')
console.log('2. Navigate to SQL Editor')
console.log('3. Copy the contents of supabase/migrations/20250123000001_lesson_completion_xp.sql')
console.log('4. Paste and run the SQL')
console.log('5. Verify the tables were created successfully')

console.log('\nOPTION 2: Supabase CLI (if you have it installed)')
console.log('1. Run: supabase db push')
console.log('2. This will apply all pending migrations')

console.log('\nOPTION 3: Manual SQL Execution')
console.log('1. Connect to your Supabase database')
console.log('2. Execute the SQL from the migration file')
console.log('3. Verify tables exist with: \\dt lesson_completions, xp_ledger')

console.log('\n🧪 AFTER APPLYING THE MIGRATION:')
console.log('1. Restart your development server: npm run dev')
console.log('2. Log in to your account')
console.log('3. Navigate to a lesson page')
console.log('4. Click "Markera som läst" button')
console.log('5. Check console for success messages')
console.log('6. Verify XP increases in profile page')

console.log('\n📊 EXPECTED RESULTS:')
console.log('✅ "Markera som läst" button works correctly')
console.log('✅ XP is awarded (10 XP per lesson)')
console.log('✅ Completed lessons counter increases')
console.log('✅ Idempotent behavior (no duplicate XP for same lesson)')
console.log('✅ Profile page shows updated stats')

console.log('\n⚠️  IF YOU STILL HAVE ISSUES:')
console.log('1. Check Supabase logs for any migration errors')
console.log('2. Verify RLS policies are working correctly')
console.log('3. Check that get_account_id() function exists')
console.log('4. Ensure accounts table has the required columns')

console.log('\n✨ Once the migration is applied, the "Markera som läst" button should work perfectly!')
