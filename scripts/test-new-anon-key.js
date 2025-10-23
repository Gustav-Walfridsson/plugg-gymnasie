const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testNewAnonKey() {
  console.log('🧪 Testing the new anon key...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const newAnonKey = 'sb_publishable_OIW9dqiMtFpVfyObwHTmYQ_wKRgiitJ';
  
  console.log('Testing with key:', newAnonKey.substring(0, 20) + '...');
  
  try {
    const client = createClient(url, newAnonKey);
    
    // Test basic connection
    const { data: { user }, error } = await client.auth.getUser();
    
    if (error) {
      console.log('❌ Auth error:', error.message);
      console.log('This suggests we need the JWT anon key, not the publishable key.');
    } else {
      console.log('✅ Auth successful!');
    }
    
    // Test database access
    const { data: accounts, error: dbError } = await client
      .from('accounts')
      .select('id')
      .limit(1);
    
    if (dbError) {
      console.log('❌ Database error:', dbError.message);
    } else {
      console.log('✅ Database access successful!');
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('If this key doesn\'t work, we need the JWT anon key from Supabase Dashboard.');
  console.log('The JWT anon key should look like: eyJhbGciOiJIUzI1NiIs...');
}

testNewAnonKey();
