'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmText !== 'RADERA') {
      setError('Skriv "RADERA" för att bekräfta')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/gdpr/delete', { method: 'POST' })
      if (!res.ok) throw new Error('Delete failed')
      
      // Sign out client-side
      await supabase.auth.signOut()
      alert('Ditt konto har raderats.')
      router.push('/auth/login')
    } catch (err) {
      setError('Kunde inte radera konto. Kontakta support.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Radera Mitt Konto</h1>
      <div className="bg-red-50 border border-red-200 p-4 rounded mb-6">
        <p className="text-red-800 font-semibold mb-2">VARNING: Permanent åtgärd!</p>
        <p className="text-red-700">All studieprogress raderas omedelbart. Kan inte ångras.</p>
      </div>
      <label className="block mb-4">
        <span className="text-gray-700">Skriv <strong>RADERA</strong> för att bekräfta:</span>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-2 block w-full px-4 py-2 border rounded"
          placeholder="RADERA"
        />
      </label>
      <button
        onClick={handleDelete}
        disabled={loading || confirmText !== 'RADERA'}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Raderar...' : 'Radera Mitt Konto'}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  )
}
