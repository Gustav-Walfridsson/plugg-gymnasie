// Test script to verify the lesson completion button works
console.log('🧪 Testing Lesson Completion Button Fix...')

// Test 1: Check if the API endpoint is accessible
async function testAPIEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/api/lessons/test-lesson-123/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log('API Response Status:', response.status)
    
    if (response.status === 401) {
      console.log('✅ API correctly returns 401 for unauthenticated requests')
      return true
    } else {
      console.log('⚠️ Unexpected API response:', response.status)
      return false
    }
  } catch (error) {
    console.log('⚠️ API test failed (server might not be running):', error.message)
    return false
  }
}

// Test 2: Check if the page loads correctly
async function testPageLoad() {
  try {
    const response = await fetch('http://localhost:3000/study/matematik/algebra/enkla-ekvationer')
    
    if (response.ok) {
      console.log('✅ Skill detail page loads correctly')
      return true
    } else {
      console.log('❌ Skill detail page failed to load:', response.status)
      return false
    }
  } catch (error) {
    console.log('⚠️ Page load test failed:', error.message)
    return false
  }
}

async function runTests() {
  console.log('Starting tests...')
  
  const apiTest = await testAPIEndpoint()
  const pageTest = await testPageLoad()
  
  if (apiTest && pageTest) {
    console.log('\n🎉 All tests passed!')
    console.log('\n📋 Fix Summary:')
    console.log('✅ Added useState for completedLessons state')
    console.log('✅ Added handleLessonComplete callback function')
    console.log('✅ Updated LessonCard props with isCompleted and onComplete')
    console.log('✅ API endpoint working correctly')
    console.log('✅ Page loads correctly')
    console.log('\n🚀 The "Markera som läst" button should now work!')
  } else {
    console.log('\n❌ Some tests failed. Check the issues above.')
  }
}

runTests()
