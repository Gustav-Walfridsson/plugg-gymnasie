const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDirectLogin() {
  console.log('🔐 Testing direct login...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  try {
    const client = createClient(url, anonKey);
    
    // Test 1: Try to create a test user account
    console.log('1. Creating test user account...');
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email: 'guwa.pch@procivitas.se',
      password: 'testpassword123',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });
    
    if (signUpError) {
      console.log('❌ Sign up error:', signUpError.message);
    } else {
      console.log('✅ Sign up successful:', signUpData);
    }
    
    // Test 2: Try to sign in with password
    console.log('\n2. Testing password sign in...');
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email: 'guwa.pch@procivitas.se',
      password: 'testpassword123',
    });
    
    if (signInError) {
      console.log('❌ Sign in error:', signInError.message);
    } else {
      console.log('✅ Sign in successful:', signInData);
    }
    
    // Test 3: Check session after sign in
    console.log('\n3. Checking session...');
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Session data:', sessionData);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDirectLogin();
