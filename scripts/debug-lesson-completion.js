// Debug script to test lesson completion with authentication
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

async function debugLessonCompletion() {
  try {
    console.log('🔍 Debugging Lesson Completion System...')
    console.log('=' .repeat(50))
    
    // Test 1: Check if we have any users/accounts
    console.log('\n1. 👥 Checking users and accounts...')
    
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, user_id, name, total_xp, completed_lessons_count')
      .limit(5)
    
    if (accountsError) {
      console.error('❌ Error fetching accounts:', accountsError.message)
      return false
    }
    
    if (!accounts || accounts.length === 0) {
      console.log('⚠️ No accounts found in database')
      console.log('💡 This could be why lesson completion isn\'t working - no users to complete lessons!')
      return false
    }
    
    console.log(`✅ Found ${accounts.length} accounts:`)
    accounts.forEach(account => {
      console.log(`   - ${account.name} (ID: ${account.id}) - XP: ${account.total_xp}, Lessons: ${account.completed_lessons_count}`)
    })
    
    // Test 2: Check lesson_completions table
    console.log('\n2. 📚 Checking lesson completions...')
    
    const { data: completions, error: completionsError } = await supabase
      .from('lesson_completions')
      .select('*')
      .limit(5)
    
    if (completionsError) {
      console.error('❌ Error fetching lesson completions:', completionsError.message)
    } else {
      console.log(`✅ Found ${completions?.length || 0} lesson completions`)
      if (completions && completions.length > 0) {
        completions.forEach(completion => {
          console.log(`   - Lesson ${completion.lesson_id} completed by account ${completion.account_id} (+${completion.xp_awarded} XP)`)
        })
      }
    }
    
    // Test 3: Check xp_ledger
    console.log('\n3. 💰 Checking XP ledger...')
    
    const { data: xpEntries, error: xpError } = await supabase
      .from('xp_ledger')
      .select('*')
      .limit(5)
    
    if (xpError) {
      console.error('❌ Error fetching XP ledger:', xpError.message)
    } else {
      console.log(`✅ Found ${xpEntries?.length || 0} XP entries`)
      if (xpEntries && xpEntries.length > 0) {
        xpEntries.forEach(entry => {
          console.log(`   - ${entry.source_type}: ${entry.source_id} (+${entry.xp} XP)`)
        })
      }
    }
    
    // Test 4: Test lesson completion manually
    console.log('\n4. 🧪 Testing lesson completion manually...')
    
    if (accounts.length > 0) {
      const testAccount = accounts[0]
      const testLessonId = `debug-test-${Date.now()}`
      
      console.log(`Testing with account: ${testAccount.name} (${testAccount.id})`)
      
      // Insert lesson completion
      const { data: completion, error: completionError } = await supabase
        .from('lesson_completions')
        .insert({
          account_id: testAccount.id,
          lesson_id: testLessonId,
          xp_awarded: 10
        })
        .select()
        .single()
      
      if (completionError) {
        console.error('❌ Lesson completion insert failed:', completionError.message)
      } else {
        console.log('✅ Lesson completion inserted successfully')
        
        // Insert XP ledger entry
        const { error: xpLedgerError } = await supabase
          .from('xp_ledger')
          .insert({
            account_id: testAccount.id,
            source_type: 'lesson_completion',
            source_id: testLessonId,
            xp: 10
          })
        
        if (xpLedgerError) {
          console.error('❌ XP ledger insert failed:', xpLedgerError.message)
        } else {
          console.log('✅ XP ledger entry created')
          
          // Update account stats
          const { error: updateError } = await supabase
            .from('accounts')
            .update({
              total_xp: testAccount.total_xp + 10,
              completed_lessons_count: testAccount.completed_lessons_count + 1
            })
            .eq('id', testAccount.id)
          
          if (updateError) {
            console.error('❌ Account update failed:', updateError.message)
          } else {
            console.log('✅ Account stats updated successfully')
          }
        }
        
        // Clean up test data
        await supabase.from('lesson_completions').delete().eq('lesson_id', testLessonId)
        await supabase.from('xp_ledger').delete().eq('source_id', testLessonId)
        console.log('🧹 Test data cleaned up')
      }
    }
    
    console.log('\n📋 Debug Summary:')
    console.log(`- Accounts: ${accounts?.length || 0}`)
    console.log(`- Lesson completions: ${completions?.length || 0}`)
    console.log(`- XP entries: ${xpEntries?.length || 0}`)
    
    return true
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return false
  }
}

debugLessonCompletion()
