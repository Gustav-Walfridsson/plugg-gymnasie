const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLessonCompletion() {
  console.log('🧪 Testing lesson completion API directly...\n');
  
  try {
    // Test 1: Check if we can insert into lesson_completions
    console.log('1. Testing lesson_completions table access...');
    const { data: testInsert, error: insertError } = await supabase
      .from('lesson_completions')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // dummy ID
        lesson_id: 'test-lesson',
        xp_awarded: 10
      })
      .select();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('Details:', insertError.details);
      console.log('Hint:', insertError.hint);
    } else {
      console.log('✅ Insert successful');
      // Clean up test data
      await supabase.from('lesson_completions').delete().eq('lesson_id', 'test-lesson');
    }
    
    // Test 2: Check if we can insert into xp_ledger
    console.log('\n2. Testing xp_ledger table access...');
    const { data: testXpInsert, error: xpInsertError } = await supabase
      .from('xp_ledger')
      .insert({
        account_id: '00000000-0000-0000-0000-000000000000', // dummy ID
        source_type: 'lesson_completion',
        source_id: 'test-lesson',
        xp: 10
      })
      .select();
    
    if (xpInsertError) {
      console.log('❌ XP Insert error:', xpInsertError.message);
      console.log('Details:', xpInsertError.details);
      console.log('Hint:', xpInsertError.hint);
    } else {
      console.log('✅ XP Insert successful');
      // Clean up test data
      await supabase.from('xp_ledger').delete().eq('source_id', 'test-lesson');
    }
    
    // Test 3: Check accounts table
    console.log('\n3. Testing accounts table access...');
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, total_xp, completed_lessons_count')
      .limit(1);
    
    if (accountsError) {
      console.log('❌ Accounts error:', accountsError.message);
    } else {
      console.log('✅ Accounts access successful');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLessonCompletion();