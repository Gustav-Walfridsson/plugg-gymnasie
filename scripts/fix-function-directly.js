const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixGetAccountIdFunction() {
  console.log('🔧 Fixing get_account_id function directly...\n');
  
  try {
    // First, let's see what functions exist
    console.log('1. Checking existing functions...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('exec', { 
        sql: `SELECT routine_name, parameter_name, data_type 
              FROM information_schema.parameters 
              WHERE specific_schema = 'public' 
              AND routine_name = 'get_account_id'` 
      });
    
    if (functionsError) {
      console.log('Could not check existing functions:', functionsError.message);
    } else {
      console.log('Existing functions:', functions);
    }
    
    // Drop the existing function
    console.log('\n2. Dropping existing function...');
    const dropSQL = `DROP FUNCTION IF EXISTS get_account_id(uuid);`;
    
    const { error: dropError } = await supabase
      .rpc('exec', { sql: dropSQL });
    
    if (dropError) {
      console.log('Drop error:', dropError.message);
    } else {
      console.log('✅ Function dropped successfully');
    }
    
    // Create the new function
    console.log('\n3. Creating new function...');
    const createSQL = `
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
$$;`;
    
    const { error: createError } = await supabase
      .rpc('exec', { sql: createSQL });
    
    if (createError) {
      console.log('❌ Create error:', createError.message);
    } else {
      console.log('✅ Function created successfully');
    }
    
    // Test the function
    console.log('\n4. Testing the function...');
    const { data: testResult, error: testError } = await supabase
      .rpc('get_account_id', { user_id: '00000000-0000-0000-0000-000000000000' });
    
    if (testError) {
      console.log('❌ Test error:', testError.message);
    } else {
      console.log('✅ Function test successful:', testResult);
    }
    
    console.log('\n🎯 Function should now work! The "Markera som läst" button should work.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Fallback: try using the REST API directly
    console.log('\n🔄 Trying alternative approach...');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          sql: `DROP FUNCTION IF EXISTS get_account_id(uuid);
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
                $$;`
        })
      });
      
      if (response.ok) {
        console.log('✅ Function created via REST API');
      } else {
        const errorText = await response.text();
        console.log('❌ REST API error:', errorText);
      }
    } catch (restError) {
      console.log('❌ REST API failed:', restError.message);
    }
  }
}

fixGetAccountIdFunction();
