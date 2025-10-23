const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testMagicLinkFlow() {
  console.log('🔗 Testing magic link flow...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  try {
    const client = createClient(url, anonKey);
    
    // Test 1: Send magic link
    console.log('1. Sending magic link...');
    const { data, error } = await client.auth.signInWithOtp({
      email: 'guwa.pch@procivitas.se',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });
    
    if (error) {
      console.log('❌ Magic link error:', error.message);
    } else {
      console.log('✅ Magic link sent successfully');
      console.log('Data:', data);
    }
    
    // Test 2: Check if user exists
    console.log('\n2. Checking if user exists...');
    const { data: userData, error: userError } = await client.auth.admin.getUserById('guwa.pch@procivitas.se');
    
    if (userError) {
      console.log('❌ User check error:', userError.message);
    } else {
      console.log('✅ User exists:', userData);
    }
    
    // Test 3: Check current session
    console.log('\n3. Checking current session...');
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Session data:', sessionData);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n📋 DEBUGGING STEPS:');
  console.log('1. Check your email for the magic link');
  console.log('2. Click the magic link');
  console.log('3. Check browser console for errors');
  console.log('4. Check if you\'re redirected to /auth/callback');
  console.log('5. Check if the session is created');
}

testMagicLinkFlow();
