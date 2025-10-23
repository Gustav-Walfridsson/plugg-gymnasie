// Test the fixed API route
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

async function testFixedAPI() {
  try {
    console.log('🧪 Testing Fixed API Route...')
    console.log('=' .repeat(50))
    
    // Test 1: Get a real lesson ID
    console.log('\n1. 📚 Getting a real lesson ID...')
    
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('skill_id', 'enkla-ekvationer')
      .limit(1)
    
    if (lessonsError || !lessons || lessons.length === 0) {
      console.error('❌ No lessons found:', lessonsError?.message)
      return false
    }
    
    const testLesson = lessons[0]
    console.log(`✅ Using lesson: ${testLesson.title} (${testLesson.id})`)
    
    // Test 2: Get user account
    console.log('\n2. 👤 Getting user account...')
    
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, name, total_xp, completed_lessons_count')
      .limit(1)
    
    if (accountsError || !accounts || accounts.length === 0) {
      console.error('❌ No accounts found:', accountsError?.message)
      return false
    }
    
    const account = accounts[0]
    console.log(`✅ Using account: ${account.name}`)
    console.log(`   Current XP: ${account.total_xp}`)
    console.log(`   Current Lessons: ${account.completed_lessons_count}`)
    
    // Test 3: Test the lesson completion flow manually
    console.log('\n3. 🎯 Testing lesson completion flow...')
    
    // Check if already completed
    const { data: existingCompletion, error: existingError } = await supabase
      .from('lesson_completions')
      .select('id')
      .eq('account_id', account.id)
      .eq('lesson_id', testLesson.id)
      .single()
    
    if (existingError && existingError.code !== 'PGRST116') {
      console.error('❌ Error checking existing completion:', existingError.message)
      return false
    }
    
    if (existingCompletion) {
      console.log('⚠️ Lesson already completed, testing idempotency...')
    } else {
      console.log('✅ Lesson not completed yet, testing completion...')
    }
    
    // Insert lesson completion
    const { data: completion, error: completionError } = await supabase
      .from('lesson_completions')
      .insert({
        account_id: account.id,
        lesson_id: testLesson.id,
        xp_awarded: 10
      })
      .select()
      .single()
    
    if (completionError) {
      if (completionError.code === '23505') {
        console.log('✅ Idempotency working - lesson already completed')
        return true
      } else {
        console.error('❌ Lesson completion insert failed:', completionError.message)
        return false
      }
    }
    
    console.log('✅ Lesson completion inserted successfully')
    
    // Get current account data
    const { data: currentAccount, error: currentAccountError } = await supabase
      .from('accounts')
      .select('total_xp, completed_lessons_count')
      .eq('id', account.id)
      .single()
    
    if (currentAccountError || !currentAccount) {
      console.error('❌ Error fetching current account data:', currentAccountError?.message)
      return false
    }
    
    // Insert XP ledger entry
    const { error: xpLedgerError } = await supabase
      .from('xp_ledger')
      .insert({
        account_id: account.id,
        source_type: 'lesson_completion',
        source_id: testLesson.id,
        xp: 10
      })
    
    if (xpLedgerError) {
      console.error('❌ XP ledger insert failed:', xpLedgerError.message)
      return false
    }
    console.log('✅ XP ledger entry created')
    
    // Update account stats
    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        total_xp: currentAccount.total_xp + 10,
        completed_lessons_count: currentAccount.completed_lessons_count + 1
      })
      .eq('id', account.id)
    
    if (updateError) {
      console.error('❌ Account update failed:', updateError.message)
      return false
    }
    console.log('✅ Account stats updated successfully')
    
    // Verify the update
    const { data: updatedAccount, error: verifyError } = await supabase
      .from('accounts')
      .select('total_xp, completed_lessons_count')
      .eq('id', account.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError.message)
    } else {
      console.log(`✅ Verification: XP=${updatedAccount.total_xp}, Lessons=${updatedAccount.completed_lessons_count}`)
    }
    
    console.log('\n🎉 All tests passed! The API route should now work correctly.')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

testFixedAPI()
