'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Felaktig e-post eller lösenord.'); setLoading(false); return }
    router.push('/projekt')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Vänster panel – blå */}
      <div className="bg-blue-950 text-white sm:w-1/2 flex flex-col justify-between p-8 sm:p-12">
        <Link href="/" className="text-white font-bold text-xl tracking-tight hover:text-blue-200 transition-colors">
          ← Säker BRF
        </Link>
        <div className="py-12 sm:py-0">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Digital besiktning för din BRF
          </h1>
          <p className="text-blue-300 text-base leading-relaxed max-w-sm">
            Dokumentera renoveringar steg för steg med foton, noteringar och digitala signaturer.
          </p>
          <div className="mt-8 space-y-3 hidden sm:block">
            {['Strukturerad checklista för varje renovering', 'Foton och noteringar per steg', 'Automatiskt PDF-protokoll'].map(t => (
              <div key={t} className="flex items-center gap-3 text-sm text-blue-200">
                <div className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-600 text-xs hidden sm:block">© 2026 Säker BRF</p>
      </div>

      {/* Höger panel – formulär */}
      <div className="sm:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12 sm:p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Logga in</h2>
          <p className="text-gray-500 text-sm mb-8">Ange dina uppgifter för att fortsätta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-post</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="din@epost.se" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lösenord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm mt-2">
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
