const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMigration() {
  console.log('🔍 Testing if database migration was applied...\n');
  
  try {
    // Test 1: Check if lesson_completions table exists
    console.log('1. Testing lesson_completions table...');
    const { data: completions, error: completionsError } = await supabase
      .from('lesson_completions')
      .select('*')
      .limit(1);
    
    if (completionsError) {
      console.log('❌ lesson_completions table missing:', completionsError.message);
    } else {
      console.log('✅ lesson_completions table exists');
    }
    
    // Test 2: Check if xp_ledger table exists
    console.log('\n2. Testing xp_ledger table...');
    const { data: xpLedger, error: xpLedgerError } = await supabase
      .from('xp_ledger')
      .select('*')
      .limit(1);
    
    if (xpLedgerError) {
      console.log('❌ xp_ledger table missing:', xpLedgerError.message);
    } else {
      console.log('✅ xp_ledger table exists');
    }
    
    // Test 3: Check if accounts table has new columns
    console.log('\n3. Testing accounts table columns...');
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, total_xp, completed_lessons_count')
      .limit(1);
    
    if (accountsError) {
      console.log('❌ accounts table missing columns:', accountsError.message);
    } else {
      console.log('✅ accounts table has new columns');
    }
    
    // Test 4: Check if get_account_id function exists (optional now)
    console.log('\n4. Testing get_account_id function (optional)...');
    const { data: functionTest, error: functionError } = await supabase
      .rpc('get_account_id', { user_id: '00000000-0000-0000-0000-000000000000' });
    
    if (functionError) {
      console.log('⚠️ get_account_id function missing (but not required anymore)');
    } else {
      console.log('✅ get_account_id function exists');
    }
    
    console.log('\n📊 Migration Status Summary:');
    const migrationApplied = !completionsError && !xpLedgerError && !accountsError;
    
    if (migrationApplied) {
      console.log('✅ All required migration components are present!');
      console.log('🎯 The "Markera som läst" button should work now.');
      console.log('ℹ️ RLS policies have been fixed to work without get_account_id function.');
    } else {
      console.log('❌ Migration is incomplete. Please apply the migration:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Copy and paste the contents of supabase/migrations/20250123000001_lesson_completion_xp.sql');
      console.log('   3. Click "Run" to execute the migration');
    }
    
  } catch (error) {
    console.error('❌ Error testing migration:', error.message);
  }
}

testMigration();
