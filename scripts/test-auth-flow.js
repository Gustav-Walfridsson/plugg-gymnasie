const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAuthFlow() {
  console.log('🔐 Testing authentication flow...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  try {
    const client = createClient(url, anonKey);
    
    // Test 1: Check if we can sign in with magic link
    console.log('1. Testing magic link sign-in...');
    const { data: signInData, error: signInError } = await client.auth.signInWithOtp({
      email: 'guwa.pch@procivitas.se',
      options: {
        shouldCreateUser: false
      }
    });
    
    if (signInError) {
      console.log('❌ Magic link error:', signInError.message);
    } else {
      console.log('✅ Magic link sent successfully');
    }
    
    // Test 2: Check if we can access accounts table
    console.log('\n2. Testing database access...');
    const { data: accounts, error: dbError } = await client
      .from('accounts')
      .select('id, user_id')
      .limit(1);
    
    if (dbError) {
      console.log('❌ Database error:', dbError.message);
    } else {
      console.log('✅ Database access successful');
      console.log('Sample account:', accounts?.[0]);
    }
    
    // Test 3: Test lesson completion API endpoint
    console.log('\n3. Testing lesson completion endpoint...');
    const testResponse = await fetch('http://localhost:3000/api/lessons/test-lesson/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response Status:', testResponse.status);
    const responseText = await testResponse.text();
    console.log('API Response:', responseText);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAuthFlow();
