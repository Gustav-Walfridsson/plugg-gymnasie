'use client'
import { useState } from 'react'

export default function ExportDataPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/gdpr/export', { method: 'POST' })
      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plugg-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } catch (err) {
      setError('Kunde inte exportera data. Försök igen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Exportera Min Data</h1>
      <p className="mb-6 text-gray-600">
        Ladda ner all din data i JSON-format (studieprogress, försök, inställningar).
      </p>
      <button
        onClick={handleExport}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Exporterar...' : 'Exportera Data'}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  )
}
