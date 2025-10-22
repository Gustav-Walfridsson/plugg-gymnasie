'use client'
import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setShow(true)
  }, [])
  
  const accept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setShow(false)
  }
  
  if (!show) return null
  
  return (
    <div className="fixed bottom-0 inset-x-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm">
          Vi använder endast nödvändiga cookies för inloggning. 
          Läs <a href="/legal/privacy" className="underline">integritetspolicy</a>.
        </p>
        <button onClick={accept} className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700">
          OK
        </button>
      </div>
    </div>
  )
}
