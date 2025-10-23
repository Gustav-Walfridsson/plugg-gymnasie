// Test the lesson completion API endpoint
import fetch from 'node-fetch'

async function testAPI() {
  try {
    console.log('🧪 Testing lesson completion API...')
    
    // Test with a sample lesson ID
    const testLessonId = 'test-lesson-123'
    const response = await fetch(`http://localhost:3000/api/lessons/${testLessonId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const data = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
    if (response.status === 401) {
      console.log('✅ API correctly returns 401 for unauthenticated requests')
    } else if (response.status === 200) {
      console.log('✅ API works correctly')
    } else {
      console.log('⚠️ Unexpected response:', response.status)
    }
    
  } catch (error) {
    console.log('⚠️ API test failed (server might not be running):', error.message)
  }
}

testAPI()
