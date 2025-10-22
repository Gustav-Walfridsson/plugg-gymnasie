'use client'

import { useState, useEffect } from 'react'

interface DatabaseResult {
  success: boolean
  data?: any
  error?: string
  sql?: string
  operation?: string
  timestamp?: string
}

export default function DatabaseManager() {
  const [sql, setSql] = useState('')
  const [operation, setOperation] = useState('query')
  const [result, setResult] = useState<DatabaseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<DatabaseResult[]>([])
  const [schema, setSchema] = useState<any>(null)

  // Load schema on component mount
  useEffect(() => {
    loadSchema()
  }, [])

  const loadSchema = async () => {
    try {
      const response = await fetch('/api/database/execute?operation=schema')
      const data = await response.json()
      if (data.success) {
        setSchema(data.data)
      }
    } catch (error) {
      console.error('Failed to load schema:', error)
    }
  }

  const handleExecute = async () => {
    if (!sql.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/database/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sql.trim(), operation })
      })
      
      const data = await response.json()
      setResult(data)
      
      // Add to history
      setHistory(prev => [data, ...prev.slice(0, 9)]) // Keep last 10 results
      
    } catch (error: any) {
      const errorResult = { 
        success: false, 
        error: error.message,
        sql: sql,
        operation: operation,
        timestamp: new Date().toISOString()
      }
      setResult(errorResult)
      setHistory(prev => [errorResult, ...prev.slice(0, 9)])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuery = (quickSql: string, op: string = 'query') => {
    setSql(quickSql)
    setOperation(op)
  }

  const clearResult = () => {
    setResult(null)
  }

  const formatResult = (data: any) => {
    if (Array.isArray(data)) {
      return data.length > 0 ? data : 'No results found'
    }
    return data
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">AI Database Manager</h2>
      
      {/* Quick Actions */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickQuery('SELECT * FROM subjects LIMIT 5')}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            Show Subjects
          </button>
          <button
            onClick={() => handleQuickQuery('SELECT * FROM topics LIMIT 5')}
            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
          >
            Show Topics
          </button>
          <button
            onClick={() => handleQuickQuery('SELECT * FROM skills LIMIT 5')}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
          >
            Show Skills
          </button>
          <button
            onClick={() => handleQuickQuery('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'')}
            className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200"
          >
            List Tables
          </button>
          <button
            onClick={() => handleQuickQuery('subjects', 'table_info')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
          >
            Subjects Schema
          </button>
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Operation Type:</label>
            <select 
              value={operation} 
              onChange={(e) => setOperation(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="query">Query (SELECT)</option>
              <option value="insert">Insert</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="create">Create</option>
              <option value="alter">Alter</option>
              <option value="schema">Get Schema</option>
              <option value="table_info">Table Info</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SQL Command:</label>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="w-full h-32 p-3 border rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your SQL command here..."
            />
          </div>

          <button
            onClick={handleExecute}
            disabled={loading || !sql.trim()}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Executing...' : 'Execute SQL'}
          </button>

          {result && (
            <button
              onClick={clearResult}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Result
            </button>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {result && (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">
                  {result.success ? '✅ Success' : '❌ Error'}
                </h3>
                <span className="text-sm text-gray-500">
                  {result.timestamp && new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              {result.sql && (
                <div className="mb-3 p-2 bg-gray-100 rounded text-sm font-mono">
                  <strong>SQL:</strong> {result.sql}
                </div>
              )}
              
              <div className="max-h-96 overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {result.success 
                    ? JSON.stringify(formatResult(result.data), null, 2)
                    : result.error
                  }
                </pre>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Recent Queries</h3>
              <div className="space-y-2 max-h-48 overflow-auto">
                {history.map((item, index) => (
                  <div 
                    key={index}
                    className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (item.sql) {
                        setSql(item.sql)
                        setOperation(item.operation || 'query')
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${item.success ? 'text-green-600' : 'text-red-600'}`}>
                        {item.success ? '✓' : '✗'} {item.operation}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.timestamp && new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {item.sql}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schema Information */}
      {schema && (
        <div className="mt-6 border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Database Schema</h3>
          <div className="max-h-64 overflow-auto">
            <pre className="text-xs">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
