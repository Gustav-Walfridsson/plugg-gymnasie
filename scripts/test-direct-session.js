const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDirectSession() {
  console.log('🔐 Testing direct session creation...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  try {
    // Use service key to create a session for the user
    console.log('1. Creating session using service key...');
    const adminClient = createClient(url, serviceKey);
    
    // Get the user ID
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === 'guwa.pch@procivitas.se');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    
    // Create a session for this user
    const { data: sessionData, error: sessionError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    
    if (sessionError) {
      console.log('❌ Error creating session:', sessionError.message);
      return;
    }
    
    console.log('✅ Session link created');
    console.log('🔗 Magic link:', sessionData.properties.action_link);
    
    // Test the API with the session
    console.log('\n2. Testing API with session...');
    
    // Create a client with the session
    const clientWithSession = createClient(url, anonKey);
    
    // Set the session manually
    await clientWithSession.auth.setSession({
      access_token: sessionData.properties.hashed_token,
      refresh_token: sessionData.properties.hashed_token
    });
    
    // Test API call
    const response = await fetch('http://localhost:3000/api/lessons/test-lesson/complete', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.properties.hashed_token}`
      }
    });
    
    const responseText = await response.text();
    console.log(`API Response (${response.status}):`, responseText);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDirectSession();
