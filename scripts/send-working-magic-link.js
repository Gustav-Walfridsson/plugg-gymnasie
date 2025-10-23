const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function sendWorkingMagicLink() {
  console.log('🔗 Sending working magic link...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  try {
    const adminClient = createClient(url, serviceKey);
    
    // Generate a working magic link
    const { data: sessionData, error: sessionError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: 'guwa.pch@procivitas.se',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    
    if (sessionError) {
      console.log('❌ Error creating magic link:', sessionError.message);
      return;
    }
    
    console.log('✅ WORKING MAGIC LINK CREATED!');
    console.log('📧 Copy this link and paste it in your browser:');
    console.log('');
    console.log(sessionData.properties.action_link);
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Copy the link above');
    console.log('2. Paste it in your browser');
    console.log('3. You should be redirected to /auth/callback');
    console.log('4. Then redirected to the main page');
    console.log('5. You should be logged in!');
    console.log('6. Then try the "Markera som läst" button');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

sendWorkingMagicLink();
