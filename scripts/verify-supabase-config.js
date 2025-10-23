const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifySupabaseConfiguration() {
  console.log('🔍 Verifying Supabase configuration...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', url);
  console.log('Anon Key (first 20 chars):', anonKey?.substring(0, 20) + '...');
  console.log('Service Key (first 20 chars):', serviceKey?.substring(0, 20) + '...');
  
  // Test 1: Check if anon key works with the URL
  console.log('\n1. Testing anon key compatibility...');
  try {
    const client1 = createClient(url, anonKey);
    
    // Try to access a simple endpoint
    const { data, error } = await client1.from('accounts').select('id').limit(1);
    
    if (error) {
      console.log('❌ Anon key error:', error.message);
      console.log('This suggests the anon key is from a different project!');
    } else {
      console.log('✅ Anon key works with this project');
    }
  } catch (error) {
    console.log('❌ Anon key failed:', error.message);
  }
  
  // Test 2: Check if service key works
  console.log('\n2. Testing service key compatibility...');
  try {
    const client2 = createClient(url, serviceKey);
    
    const { data, error } = await client2.from('accounts').select('id').limit(1);
    
    if (error) {
      console.log('❌ Service key error:', error.message);
    } else {
      console.log('✅ Service key works with this project');
    }
  } catch (error) {
    console.log('❌ Service key failed:', error.message);
  }
  
  // Test 3: Try to get project info
  console.log('\n3. Getting project information...');
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      }
    });
    
    console.log('Project response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Project is accessible');
    } else {
      console.log('❌ Project not accessible');
    }
  } catch (error) {
    console.log('❌ Project check failed:', error.message);
  }
  
  console.log('\n🔧 RECOMMENDATION:');
  console.log('If the anon key fails but service key works, you need to:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Go to Settings → API');
  console.log('3. Copy the correct "anon public" key');
  console.log('4. Update your .env.local file');
}

verifySupabaseConfiguration();
