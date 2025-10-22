'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'

export default function TestDatabasePage() {
  const [status, setStatus] = useState('Testing...')
  const [subjects, setSubjects] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      setStatus('Testing Supabase connection...')
      
      // Test 1: Check if we can connect to Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        throw new Error(`Auth error: ${sessionError.message}`)
      }
      
      setStatus('Connected to Supabase! Testing database queries...')
      
      // Test 2: Try to fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .limit(5)
      
      if (subjectsError) {
        throw new Error(`Database error: ${subjectsError.message}`)
      }
      
      setSubjects(subjectsData || [])
      setStatus('✅ Database connection successful!')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('❌ Database connection failed')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Database Connection Test
        </h1>
        
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Status</h2>
          <p className={`text-lg ${status.includes('✅') ? 'text-green-500' : status.includes('❌') ? 'text-red-500' : 'text-yellow-500'}`}>
            {status}
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-red-800 font-semibold">Error Details:</h3>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          )}
        </div>

        {subjects.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Sample Data (Subjects)
            </h2>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div key={subject.id} className="p-3 bg-muted rounded-md">
                  <h3 className="font-medium text-foreground">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground">{subject.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-blue-800 font-semibold mb-2">Next Steps:</h3>
          <ul className="text-blue-700 space-y-1">
            <li>1. If you see an error, check your .env.local file has correct Supabase credentials</li>
            <li>2. Make sure your Supabase project has the migrations applied</li>
            <li>3. Test authentication by going to <a href="/auth/login" className="underline">/auth/login</a></li>
            <li>4. Test protected routes like <a href="/profile" className="underline">/profile</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
