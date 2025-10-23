// Using built-in fetch (Node.js 18+)
require('dotenv').config({ path: '.env.local' });

async function fixFunctionViaREST() {
  console.log('🔧 Fixing function via REST API...\n');
  
  const sql = `
DROP FUNCTION IF EXISTS get_account_id(uuid);
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

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ sql })
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Function created successfully!');
    } else {
      console.log('❌ Error creating function');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

fixFunctionViaREST();
