'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth-simple'
import { supabase } from '../../lib/supabase-client'

export default function DebugAuthPage() {
  const { user, loading } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Debug - Session:', session)
        console.log('Debug - Error:', error)
        setSession(session)
      } catch (err) {
        console.error('Debug - Session check error:', err)
      }
    }

    checkSession()
    setCookies(document.cookie)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Auth Context</h2>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? user.email : 'None'}</p>
          <p><strong>User ID:</strong> {user?.id || 'None'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Supabase Session</h2>
          <p><strong>Session:</strong> {session ? 'Found' : 'Not found'}</p>
          <p><strong>User Email:</strong> {session?.user?.email || 'None'}</p>
          <p><strong>User ID:</strong> {session?.user?.id || 'None'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Cookies</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {cookies || 'No cookies found'}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Raw Session Data</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
