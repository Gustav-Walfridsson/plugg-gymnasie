const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testCurrentKeys() {
  console.log('🧪 Testing current key combination...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', url);
  console.log('Anon Key:', anonKey?.substring(0, 20) + '...');
  console.log('Service Key:', serviceKey?.substring(0, 20) + '...');
  
  // Test 1: Test anon key
  console.log('\n1. Testing anon key...');
  try {
    const client1 = createClient(url, anonKey);
    const { data: { user }, error } = await client1.auth.getUser();
    if (error) {
      console.log('❌ Anon key error:', error.message);
    } else {
      console.log('✅ Anon key works');
    }
  } catch (error) {
    console.log('❌ Anon key failed:', error.message);
  }
  
  // Test 2: Test service key
  console.log('\n2. Testing service key...');
  try {
    const client2 = createClient(url, serviceKey);
    const { data: accounts, error } = await client2.from('accounts').select('id').limit(1);
    if (error) {
      console.log('❌ Service key error:', error.message);
    } else {
      console.log('✅ Service key works');
    }
  } catch (error) {
    console.log('❌ Service key failed:', error.message);
  }
  
  // Test 3: Check if they're from the same project
  console.log('\n3. Checking project compatibility...');
  try {
    const client1 = createClient(url, anonKey);
    const client2 = createClient(url, serviceKey);
    
    // Try to access the same table with both clients
    const { data: data1, error: error1 } = await client1.from('accounts').select('id').limit(1);
    const { data: data2, error: error2 } = await client2.from('accounts').select('id').limit(1);
    
    if (error1 && error2) {
      console.log('❌ Both keys fail - they might be from different projects');
    } else if (error1 && !error2) {
      console.log('❌ Anon key fails, service key works - KEY MISMATCH!');
    } else if (!error1 && error2) {
      console.log('❌ Service key fails, anon key works - KEY MISMATCH!');
    } else {
      console.log('✅ Both keys work - they\'re compatible');
    }
    
  } catch (error) {
    console.log('❌ Compatibility test failed:', error.message);
  }
}

testCurrentKeys();
