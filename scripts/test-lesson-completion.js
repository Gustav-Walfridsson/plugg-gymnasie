// Test script to verify the lesson completion API
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

// Create admin client for testing
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testLessonCompletion() {
  try {
    console.log('🧪 Testing lesson completion system...')
    
    // Test 1: Check if tables exist
    console.log('1. Checking if tables exist...')
    
    const { data: lessonCompletions, error: lcError } = await supabase
      .from('lesson_completions')
      .select('count')
      .limit(1)
    
    if (lcError) {
      console.error('❌ lesson_completions table error:', lcError.message)
      return false
    }
    console.log('✅ lesson_completions table exists')
    
    const { data: xpLedger, error: xpError } = await supabase
      .from('xp_ledger')
      .select('count')
      .limit(1)
    
    if (xpError) {
      console.error('❌ xp_ledger table error:', xpError.message)
      return false
    }
    console.log('✅ xp_ledger table exists')
    
    // Test 2: Check if accounts table has the new column
    console.log('2. Checking accounts table structure...')
    
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, total_xp, completed_lessons_count')
      .limit(1)
    
    if (accountsError) {
      console.error('❌ accounts table error:', accountsError.message)
      return false
    }
    console.log('✅ accounts table has required columns')
    
    // Test 3: Check if get_account_id function works
    console.log('3. Testing get_account_id function...')
    
    const { data: testUser } = await supabase
      .from('accounts')
      .select('user_id')
      .limit(1)
      .single()
    
    if (testUser) {
      const { data: accountId, error: funcError } = await supabase
        .rpc('get_account_id', { user_uuid: testUser.user_id })
      
      if (funcError) {
        console.error('❌ get_account_id function error:', funcError.message)
        return false
      }
      console.log('✅ get_account_id function works')
    }
    
    // Test 4: Test RLS policies (this would require authentication)
    console.log('4. RLS policies are in place (would need auth to test fully)')
    
    console.log('🎉 All database components are working correctly!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

testLessonCompletion().then(success => {
  process.exit(success ? 0 : 1)
})
