'use client'

import { useAuth } from '../../lib/auth-simple'
import { supabase } from '../../lib/supabase-client'
import { useEffect, useState } from 'react'

export default function TestAuthPage() {
  const { user, loading, signIn, signOut } = useAuth()
  const [supabaseSession, setSupabaseSession] = useState<any>(null)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const runTests = async () => {
      const results: string[] = []
      
      // Test 1: Check auth context
      results.push(`✅ Auth Context: ${user ? `User logged in as ${user.email}` : 'No user'}`)
      results.push(`✅ Loading State: ${loading ? 'Loading...' : 'Not loading'}`)
      
      // Test 2: Check Supabase session
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          results.push(`❌ Supabase Session Error: ${error.message}`)
        } else if (session) {
          results.push(`✅ Supabase Session: User ${session.user.email}`)
          setSupabaseSession(session)
        } else {
          results.push(`ℹ️ Supabase Session: No session`)
        }
      } catch (err) {
        results.push(`❌ Supabase Session Exception: ${err}`)
      }
      
      // Test 3: Check localStorage
      try {
        const token = localStorage.getItem('supabase.auth.token')
        if (token) {
          results.push(`✅ localStorage: Token found (${token.length} chars)`)
        } else {
          results.push(`ℹ️ localStorage: No token found`)
        }
      } catch (err) {
        results.push(`❌ localStorage Error: ${err}`)
      }
      
      // Test 4: Check cookies
      try {
        const cookies = document.cookie
        if (cookies.includes('supabase')) {
          results.push(`✅ Cookies: Supabase cookies found`)
        } else {
          results.push(`ℹ️ Cookies: No Supabase cookies found`)
        }
      } catch (err) {
        results.push(`❌ Cookies Error: ${err}`)
      }
      
      setTestResults(results)
    }
    
    runTests()
  }, [user, loading])

  const handleTestLogin = async () => {
    const results = [...testResults]
    results.push('🔄 Testing login with test@example.com...')
    setTestResults(results)
    
    const { error } = await signIn('test@example.com', 'testpassword')
    if (error) {
      results.push(`❌ Login failed: ${error.message}`)
    } else {
      results.push('✅ Login successful')
    }
    setTestResults(results)
  }

  const handleTestLogout = async () => {
    const results = [...testResults]
    results.push('🔄 Testing logout...')
    setTestResults(results)
    
    const { error } = await signOut()
    if (error) {
      results.push(`❌ Logout failed: ${error.message}`)
    } else {
      results.push('✅ Logout successful')
    }
    setTestResults(results)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Auth Context</h2>
          <p><strong>User:</strong> {user ? user.email : 'None'}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {user ? user.id : 'None'}</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Supabase Session</h2>
          <p><strong>Session:</strong> {supabaseSession ? 'Found' : 'Not found'}</p>
          <p><strong>User Email:</strong> {supabaseSession?.user?.email || 'None'}</p>
          <p><strong>Expires At:</strong> {supabaseSession?.expires_at ? new Date(supabaseSession.expires_at * 1000).toLocaleString() : 'None'}</p>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono">{result}</div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleTestLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        <button
          onClick={handleTestLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Test Logout
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Refresh Tests
        </button>
      </div>
    </div>
  )
}
