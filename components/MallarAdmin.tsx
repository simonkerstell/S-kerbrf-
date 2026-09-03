'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Mall { id: string; namn: string; beskrivning: string | null }
interface Steg { id: string; mall_id: string; ordning: number; rubrik: string; instruktion: string }

export default function MallarAdmin({ mallar: initialMallar, steg: initialSteg }: { mallar: Mall[]; steg: Steg[] }) {
  const supabase = createClient()
  const [mallar, setMallar] = useState(initialMallar)
  const [steg, setSteg] = useState(initialSteg)
  const [selectedMall, setSelectedMall] = useState<string | null>(initialMallar[0]?.id ?? null)
  const [nyMallNamn, setNyMallNamn] = useState('')
  const [nyStegRubrik, setNyStegRubrik] = useState('')
  const [nyStegInstruktion, setNyStegInstruktion] = useState('')
  const [editingSteg, setEditingSteg] = useState<Steg | null>(null)

  const aktivaMallSteg = steg
    .filter(s => s.mall_id === selectedMall)
    .sort((a, b) => a.ordning - b.ordning)

  async function skapaSteg() {
    if (!selectedMall || !nyStegRubrik.trim()) return
    const ordning = (aktivaMallSteg[aktivaMallSteg.length - 1]?.ordning ?? 0) + 1
    const { data } = await supabase
      .from('mall_steg')
      .insert({ mall_id: selectedMall, ordning, rubrik: nyStegRubrik, instruktion: nyStegInstruktion } as never)
      .select()
      .single()
    if (data) {
      setSteg(prev => [...prev, data as Steg])
      setNyStegRubrik('')
      setNyStegInstruktion('')
    }
  }

  async function sparaSteg() {
    if (!editingSteg) return
    await supabase.from('mall_steg').update({ rubrik: editingSteg.rubrik, instruktion: editingSteg.instruktion } as never).eq('id', editingSteg.id)
    setSteg(prev => prev.map(s => s.id === editingSteg.id ? editingSteg : s))
    setEditingSteg(null)
  }

  async function taBortSteg(id: string) {
    if (!confirm('Ta bort detta steg?')) return
    await supabase.from('mall_steg').delete().eq('id', id)
    setSteg(prev => prev.filter(s => s.id !== id))
  }

  async function skapaMall() {
    if (!nyMallNamn.trim()) return
    const { data } = await supabase.from('mallar').insert({ namn: nyMallNamn } as never).select().single()
    if (data) {
      setMallar(prev => [...prev, data as Mall])
      setNyMallNamn('')
      setSelectedMall((data as Mall).id)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Verifikationsmallar</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Mall-lista */}
        <div className="sm:col-span-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Mallar</h2>
          <div className="space-y-1 mb-4">
            {mallar.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMall(m.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedMall === m.id ? 'bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {m.namn}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={nyMallNamn}
              onChange={e => setNyMallNamn(e.target.value)}
              placeholder="Ny mall..."
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
            />
            <button
              onClick={skapaMall}
              className="bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* Steg-lista */}
        <div className="sm:col-span-2">
          {selectedMall && (
            <>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Steg ({aktivaMallSteg.length} st)
              </h2>
              <div className="space-y-2 mb-4">
                {aktivaMallSteg.map(s => (
                  <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    {editingSteg?.id === s.id ? (
                      <div className="space-y-2">
                        <input
                          value={editingSteg.rubrik}
                          onChange={e => setEditingSteg(prev => prev ? { ...prev, rubrik: e.target.value } : null)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <textarea
                          value={editingSteg.instruktion}
                          onChange={e => setEditingSteg(prev => prev ? { ...prev, instruktion: e.target.value } : null)}
                          rows={3}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <div className="flex gap-2">
                          <button onClick={sparaSteg} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Spara</button>
                          <button onClick={() => setEditingSteg(null)} className="text-gray-500 px-3 py-1 rounded text-sm">Avbryt</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{s.ordning}. {s.rubrik}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{s.instruktion}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setEditingSteg(s)} className="text-xs text-blue-600 hover:underline">Redigera</button>
                          <button onClick={() => taBortSteg(s.id)} className="text-xs text-red-600 hover:underline">Ta bort</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Lägg till nytt steg */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Lägg till steg</p>
                <input
                  value={nyStegRubrik}
                  onChange={e => setNyStegRubrik(e.target.value)}
                  placeholder="Rubrik"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <textarea
                  value={nyStegInstruktion}
                  onChange={e => setNyStegInstruktion(e.target.value)}
                  placeholder="Instruktion"
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={skapaSteg}
                  disabled={!nyStegRubrik.trim()}
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Lägg till
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
