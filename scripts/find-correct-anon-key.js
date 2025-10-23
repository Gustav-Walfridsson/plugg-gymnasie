const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function findCorrectAnonKey() {
  console.log('🔍 Attempting to find correct anon key...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Try to get project info using service role key
  try {
    const client = createClient(url, serviceKey);
    
    // Try to get project info
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      }
    });
    
    console.log('Project response status:', response.status);
    
    // Try to get the anon key from the project
    const projectResponse = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      }
    });
    
    console.log('Project info status:', projectResponse.status);
    
    // Extract project ID from URL
    const projectId = url.split('//')[1].split('.')[0];
    console.log('Project ID:', projectId);
    
    console.log('\n📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + projectId);
    console.log('2. Go to Settings → API');
    console.log('3. Copy the "anon public" key');
    console.log('4. Provide it to me to update your .env.local file');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

findCorrectAnonKey();
