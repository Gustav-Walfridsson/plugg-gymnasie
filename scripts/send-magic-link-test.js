const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function sendMagicLinkAndTest() {
  console.log('🔗 Sending magic link and testing...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  try {
    const client = createClient(url, anonKey);
    
    // Send magic link
    console.log('1. Sending magic link to guwa.pch@procivitas.se...');
    const { data, error } = await client.auth.signInWithOtp({
      email: 'guwa.pch@procivitas.se',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });
    
    if (error) {
      console.log('❌ Magic link error:', error.message);
      return;
    }
    
    console.log('✅ Magic link sent successfully!');
    console.log('📧 Check your email for the magic link');
    console.log('🔗 The link should redirect to: http://localhost:3000/auth/callback');
    
    // Test API endpoint
    console.log('\n2. Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/lessons/test-lesson/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseText = await response.text();
    console.log(`API Response (${response.status}):`, responseText);
    
    if (response.status === 401) {
      console.log('❌ API returns 401 - you need to be logged in first');
      console.log('📋 NEXT STEPS:');
      console.log('1. Check your email for the magic link');
      console.log('2. Click the magic link to log in');
      console.log('3. Then try the "Markera som läst" button');
    } else {
      console.log('✅ API works!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

sendMagicLinkAndTest();
