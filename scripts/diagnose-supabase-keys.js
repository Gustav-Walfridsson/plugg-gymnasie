const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnoseSupabaseKeys() {
  console.log('🔍 Diagnosing Supabase Key Mismatch...\n');
  
  const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const currentAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const currentServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Current Configuration:');
  console.log('URL:', currentUrl);
  console.log('Anon Key:', currentAnonKey?.substring(0, 20) + '...');
  console.log('Service Key:', currentServiceKey?.substring(0, 20) + '...');
  
  console.log('\n🧪 Testing Key Compatibility...\n');
  
  // Test 1: Test with current anon key
  console.log('1. Testing current anon key...');
  try {
    const client1 = createClient(currentUrl, currentAnonKey);
    const { data: { user }, error } = await client1.auth.getUser();
    if (error) {
      console.log('❌ Current anon key error:', error.message);
    } else {
      console.log('✅ Current anon key works');
    }
  } catch (error) {
    console.log('❌ Current anon key failed:', error.message);
  }
  
  // Test 2: Test with service role key (should work)
  console.log('\n2. Testing service role key...');
  try {
    const client2 = createClient(currentUrl, currentServiceKey);
    const { data: accounts, error } = await client2.from('accounts').select('id').limit(1);
    if (error) {
      console.log('❌ Service role key error:', error.message);
    } else {
      console.log('✅ Service role key works');
    }
  } catch (error) {
    console.log('❌ Service role key failed:', error.message);
  }
  
  console.log('\n🔧 SOLUTION:');
  console.log('You need to get the CORRECT anon key for your current Supabase project.');
  console.log('The anon key should match the same project as your service role key.');
  console.log('\nTo fix this:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Go to Settings → API');
  console.log('3. Copy the "anon public" key');
  console.log('4. Update your .env.local file');
  console.log('\nOr provide me the correct anon key and I\'ll update it for you.');
}

diagnoseSupabaseKeys();
