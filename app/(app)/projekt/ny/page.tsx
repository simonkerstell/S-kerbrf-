'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Mall { id: string; namn: string }

export default function NyttProjektPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mallar, setMallar] = useState<Mall[]>([])
  const [mallId, setMallId] = useState('')
  const [brfAdress, setBrfAdress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('mallar').select('id, namn').then(({ data }) => {
      if (data) {
        const rows = data as Mall[]
        setMallar(rows)
        setMallId(rows[0]?.id ?? '')
      }
    })
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
      .select('id')
      .single()

    if (projErr || !projektRow) { setError(projErr?.message ?? 'Fel'); setLoading(false); return }
    const projekt = projektRow as { id: string }

    // Hämta mall-steg och skapa projekt-steg
    const { data: stegRows } = await supabase
      .from('mall_steg')
      .select('id')
      .eq('mall_id', mallId)
      .order('ordning')

    const steg = (stegRows ?? []) as Array<{ id: string }>

    if (steg.length > 0) {
      await supabase.from('projekt_steg').insert(
        steg.map(s => ({ projekt_id: projekt.id, mall_steg_id: s.id })) as never[]
      )
    }

    router.push(`/projekt/${projekt.id}`)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nytt projekt</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Typ av renovering</label>
          <select
            value={mallId}
            onChange={e => setMallId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {mallar.map(m => <option key={m.id} value={m.id}>{m.namn}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BRF / Lägenhet / Adress
          </label>
          <input
            type="text"
            value={brfAdress}
            onChange={e => setBrfAdress(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="t.ex. BRF Solgläntan, lgh 1201, Storgatan 5"
          />
          <p className="text-xs text-gray-400 mt-1">Ange BRF-namn, lägenhetsnummer och adress</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={loading || !mallId}
            className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Skapar...' : 'Skapa projekt'}
          </button>
        </div>
      </form>
    </div>
  )
}
