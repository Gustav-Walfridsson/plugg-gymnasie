const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingFunction() {
  console.log('🔧 Adding missing get_account_id function...\n');
  
  const functionSQL = `
CREATE OR REPLACE FUNCTION get_account_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT id 
        FROM accounts 
        WHERE accounts.user_id = get_account_id.user_id 
        AND deleted_at IS NULL
        LIMIT 1
    );
END;
$$;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: functionSQL });
    
    if (error) {
      console.log('❌ Error creating function:', error.message);
      console.log('\n📋 Manual fix required:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Copy and paste this SQL:');
      console.log(functionSQL);
      console.log('3. Click "Run" to execute');
    } else {
      console.log('✅ get_account_id function created successfully!');
      console.log('🎯 The "Markera som läst" button should work now.');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n📋 Manual fix required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste this SQL:');
    console.log(functionSQL);
    console.log('3. Click "Run" to execute');
  }
}

addMissingFunction();
