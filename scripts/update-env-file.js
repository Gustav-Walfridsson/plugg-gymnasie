const fs = require('fs');
const path = require('path');

function updateEnvFile() {
  console.log('🔧 Updating .env.local file with new anon key...\n');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  try {
    // Read current file
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Replace the anon key
    const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXJqYWxiYmV0dnZmcGN2bnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzQzOTEsImV4cCI6MjA3NjQxMDM5MX0.1g2rqB2VC4mIgFaZvQQ5G23dcrPDhlHXmIEDjppPRNw';
    const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXJqYWxiYmV0dnZmcGN2bnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzQzOTEsImV4cCI6MjA3NjQxMDM5MX0.1g2rqB2VC4mIgFaZvQQ5G23dcrPDhlHXmIEDjppPRNw';
    
    content = content.replace(oldKey, newKey);
    
    // Write back to file
    fs.writeFileSync(envPath, content);
    
    console.log('✅ .env.local file updated!');
    console.log('New anon key:', newKey.substring(0, 20) + '...');
    
    console.log('\n⚠️ IMPORTANT:');
    console.log('This publishable key may not work for authentication.');
    console.log('You may need the JWT anon key from Supabase Dashboard.');
    console.log('The JWT anon key should look like: eyJhbGciOiJIUzI1NiIs...');
    
  } catch (error) {
    console.log('❌ Error updating file:', error.message);
    console.log('\n📋 MANUAL UPDATE REQUIRED:');
    console.log('Please update your .env.local file manually:');
    console.log('Replace this line:');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXJqYWxiYmV0dnZmcGN2bnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzQzOTEsImV4cCI6MjA3NjQxMDM5MX0.1g2rqB2VC4mIgFaZvQQ5G23dcrPDhlHXmIEDjppPRNw');
    console.log('With this line:');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_OIW9dqiMtFpVfyObwHTmYQ_wKRgiitJ');
  }
}

updateEnvFile();
