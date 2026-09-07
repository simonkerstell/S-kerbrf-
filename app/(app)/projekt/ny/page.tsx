'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Mall { id: string; namn: string; beskrivning: string | null; antal_steg: number }

export default function NyttProjektPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mallar, setMallar] = useState<Mall[]>([])
  const [mallId, setMallId] = useState('')
  const [brfAdress, setBrfAdress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchMallar() {
      const { data: mallData } = await supabase.from('mallar').select('id, namn, beskrivning')
      const { data: stegData } = await supabase.from('mall_steg').select('mall_id')
      if (mallData) {
        const rows = (mallData as Array<{ id: string; namn: string; beskrivning: string | null }>).map(m => ({
          ...m,
          antal_steg: (stegData ?? []).filter((s: { mall_id: string }) => s.mall_id === m.id).length,
        }))
        setMallar(rows)
        setMallId(rows[0]?.id ?? '')
      }
    }
    fetchMallar()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: projektRow, error: projErr } = await supabase
      .from('projekt')
      .insert({ mall_id: mallId, brf_adress: brfAdress, skapad_av: user.id } as never)
      .select('id').single()

    if (projErr || !projektRow) { setError(projErr?.message ?? 'Fel'); setLoading(false); return }
    const projekt = projektRow as { id: string }

    const { data: stegRows } = await supabase.from('mall_steg').select('id').eq('mall_id', mallId).order('ordning')
    const steg = (stegRows ?? []) as Array<{ id: string }>
    if (steg.length > 0) {
      await supabase.from('projekt_steg').insert(
        steg.map(s => ({ projekt_id: projekt.id, mall_steg_id: s.id })) as never[]
      )
    }
    router.push(`/projekt/${projekt.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-5 inline-flex items-center gap-1.5 transition-colors">
        ← Tillbaka
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nytt projekt</h1>
      <p className="text-gray-500 text-sm mb-8">Välj typ av renovering och ange adress för projektet.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mallval */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Välj typ av renovering</label>
          <div className="grid gap-3">
            {mallar.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMallId(m.id)}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                  mallId === m.id
                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{m.namn}</p>
                      {mallId === m.id && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Vald</span>
                      )}
                    </div>
                    {m.beskrivning && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{m.beskrivning}</p>}
                    <p className="text-xs text-blue-600 font-medium mt-1.5">{m.antal_steg} kontrollpunkter</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    mallId === m.id ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {mallId === m.id && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Adress */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">BRF / Lägenhet / Adress</label>
          <input
            type="text"
            value={brfAdress}
            onChange={e => setBrfAdress(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            placeholder="t.ex. BRF Solgläntan, lgh 1201, Storgatan 5"
          />
          <p className="text-xs text-gray-400 mt-1.5">Ange BRF-namn, lägenhetsnummer och adress</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Avbryt
          </button>
          <button type="submit" disabled={loading || !mallId}
            className="flex-1 bg-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm">
            {loading ? 'Skapar...' : 'Skapa projekt'}
          </button>
        </div>
      </form>
    </div>
  )
}
