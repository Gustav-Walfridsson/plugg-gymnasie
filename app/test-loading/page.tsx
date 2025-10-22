'use client'

import { useState, useEffect } from 'react'

export default function TestLoadingPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    console.log('Test page mounted')
    setMounted(true)
    
    // Simulate some loading
    setTimeout(() => {
      console.log('Test loading complete')
      setData({ message: 'Test data loaded' })
      setLoading(false)
    }, 1000)
  }, [])

  if (!mounted) {
    return <div>Not mounted yet...</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading test page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Loading Page</h1>
      <p>This page should load without infinite loading.</p>
      <p>Data: {JSON.stringify(data)}</p>
      <a href="/" className="text-blue-600 underline">Back to home</a>
    </div>
  )
}
