'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AnsokKontoPage() {
  const supabase = createClient()
  const [form, setForm] = useState({ namn: '', email: '', brf_namn: '', telefon: '', meddelande: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [skickad, setSkickad] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.from('konto_ansokan').insert([{
      namn: form.namn,
      email: form.email,
      brf_namn: form.brf_namn || null,
      telefon: form.telefon || null,
      meddelande: form.meddelande || null,
    }] as never[])
    if (error) { setError('Något gick fel. Försök igen.'); setLoading(false); return }
    setSkickad(true)
    setLoading(false)
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Vänster panel – blå */}
      <div className="bg-blue-950 text-white sm:w-1/2 flex flex-col justify-between p-8 sm:p-12">
        <Link href="/" className="text-white font-bold text-xl tracking-tight hover:text-blue-200 transition-colors">
          ← Säker BRF
        </Link>
        <div className="py-12 sm:py-0">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Ansök om konto
          </h1>
          <p className="text-blue-300 text-base leading-relaxed max-w-sm">
            Fyll i dina uppgifter så granskar vi din ansökan och skapar ett konto åt dig. Du får inloggningsuppgifterna när kontot är godkänt.
          </p>
        </div>
        <p className="text-blue-600 text-xs hidden sm:block">© 2026 Säker BRF</p>
      </div>

      {/* Höger panel – formulär */}
      <div className="sm:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12 sm:p-12">
        <div className="w-full max-w-sm">
          {skickad ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Ansökan mottagen!</h2>
              <p className="text-gray-500 text-sm mb-8">Vi hör av oss med inloggningsuppgifter så snart kontot är godkänt.</p>
              <Link href="/login" className="inline-block bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
                Till inloggning
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Ansök om konto</h2>
              <p className="text-gray-500 text-sm mb-8">Fyll i uppgifterna nedan</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Namn</label>
                  <input type="text" value={form.namn} onChange={set('namn')} required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    placeholder="Förnamn Efternamn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-post</label>
                  <input type="email" value={form.email} onChange={set('email')} required autoComplete="email"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    placeholder="din@epost.se" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">BRF <span className="text-gray-400 font-normal">(valfritt)</span></label>
                  <input type="text" value={form.brf_namn} onChange={set('brf_namn')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    placeholder="t.ex. BRF Solgläntan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon <span className="text-gray-400 font-normal">(valfritt)</span></label>
                  <input type="tel" value={form.telefon} onChange={set('telefon')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    placeholder="070-000 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Meddelande <span className="text-gray-400 font-normal">(valfritt)</span></label>
                  <textarea value={form.meddelande} onChange={set('meddelande')} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
                    placeholder="Berätta kort om din förening eller ditt behov" />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm mt-2">
                  {loading ? 'Skickar...' : 'Skicka ansökan'}
                </button>
              </form>

              <p className="text-sm text-gray-500 text-center mt-6">
                Har du redan ett konto?{' '}
                <Link href="/login" className="text-blue-700 font-semibold hover:text-blue-600 transition-colors">Logga in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
