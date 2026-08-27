'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StegStatus } from '@/lib/supabase/types'

interface Steg {
  id: string; projekt_id: string; mall_steg_id: string
  bild_url: string | null; signerad_av: string | null; signerad_tid: string | null
  status: StegStatus; kommentar: string | null; noteringar: string | null
  mall_steg: { ordning: number; rubrik: string; instruktion: string } | null
}

interface Projekt {
  id: string; brf_adress: string; status: string; skapad_tid: string; mall_namn: string
}

interface Props {
  projekt: Projekt; steg: Steg[]; userName: string; pdfUrl: string | null
}

const statusLabel: Record<string, string> = {
  ej_paborjad: 'Ej påbörjad', klar: 'Klar', godkand: 'Godkänd', underkand: 'Underkänd',
}

const statusColor: Record<string, string> = {
  ej_paborjad: 'bg-gray-100 text-gray-500',
  klar: 'bg-blue-100 text-blue-700',
  godkand: 'bg-green-100 text-green-700',
  underkand: 'bg-red-100 text-red-700',
}

const projektStatusLabel: Record<string, string> = {
  pagaende: 'Pågående', klar: 'Klar för godkännande', godkand: 'Godkänd', underkand: 'Underkänd',
}

const projektStatusColor: Record<string, string> = {
  pagaende: 'bg-amber-100 text-amber-800',
  klar: 'bg-blue-100 text-blue-700',
  godkand: 'bg-green-100 text-green-700',
  underkand: 'bg-red-100 text-red-700',
}

export default function ProjektVy({ projekt, steg: initialSteg, userName, pdfUrl }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [steg, setSteg] = useState(initialSteg)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [signing, setSigning] = useState<{ id: string; namn: string } | null>(null)
  const [noteringar, setNoteringar] = useState<Record<string, string>>(
    Object.fromEntries(initialSteg.map(s => [s.id, s.noteringar ?? '']))
  )
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [projektStatus, setProjektStatus] = useState(projekt.status)
  const [pdfLink, setPdfLink] = useState(pdfUrl)
  const fileRefs = useRef<Record<string, HTMLInputElement>>({})

  function updateSteg(id: string, updates: Partial<Steg>) {
    setSteg(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  async function uploadBild(stegId: string, file: File) {
    setUploading(stegId)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${projekt.id}/${stegId}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('bilder').upload(path, file, { upsert: true })
    if (uploadErr) { alert('Fel vid uppladdning: ' + uploadErr.message); setUploading(null); return }
    const { data: { publicUrl } } = supabase.storage.from('bilder').getPublicUrl(path)
    await supabase.from('projekt_steg').update({ bild_url: publicUrl } as never).eq('id', stegId)
    updateSteg(stegId, { bild_url: publicUrl })
    setUploading(null)
  }

  async function sparaNoteringar(stegId: string) {
    const text = noteringar[stegId] ?? ''
    await supabase.from('projekt_steg').update({ noteringar: text || null, uppdaterad_tid: new Date().toISOString() } as never).eq('id', stegId)
    updateSteg(stegId, { noteringar: text || null })
  }

  async function markeraKlar(stegId: string) {
    const text = noteringar[stegId] ?? ''
    await supabase.from('projekt_steg').update({ noteringar: text || null, uppdaterad_tid: new Date().toISOString() } as never).eq('id', stegId)
    updateSteg(stegId, { noteringar: text || null })
    setSigning({ id: stegId, namn: userName })
  }

  async function submitSignering() {
    if (!signing || !signing.namn.trim()) return
    const now = new Date().toISOString()
    await supabase.from('projekt_steg').update({ signerad_av: signing.namn, signerad_tid: now, status: 'klar', uppdaterad_tid: now } as never).eq('id', signing.id)
    updateSteg(signing.id, { signerad_av: signing.namn, signerad_tid: now, status: 'klar' })
    setSigning(null)
  }

  async function uppdateraProjektStatus(newStatus: string) {
    await supabase.from('projekt').update({ status: newStatus } as never).eq('id', projekt.id)
    setProjektStatus(newStatus)
    router.refresh()
  }

  async function genereraPDF() {
    setGeneratingPdf(true)
    try {
      const res = await fetch(`/api/pdf/${projekt.id}`, { method: 'POST' })
      const data = await res.json()
      if (data.url) { setPdfLink(data.url); setProjektStatus('klar') }
      else alert('Fel vid PDF-generering: ' + (data.error ?? 'Okänt fel'))
    } catch { alert('Fel vid PDF-generering') }
    setGeneratingPdf(false)
  }

  const sortedSteg = [...steg].sort((a, b) => (a.mall_steg?.ordning ?? 0) - (b.mall_steg?.ordning ?? 0))
  const antalKlara = steg.filter(s => s.status === 'klar' || s.status === 'godkand').length
  const allaKlara = steg.length > 0 && antalKlara === steg.length
  const progress = Math.round((antalKlara / Math.max(steg.length, 1)) * 100)

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-flex items-center gap-1.5 transition-colors">
          ← Tillbaka
        </button>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{projekt.brf_adress}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{projekt.mall_namn}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${projektStatusColor[projektStatus] ?? 'bg-gray-100 text-gray-600'}`}>
              {projektStatusLabel[projektStatus] ?? projektStatus}
            </span>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{antalKlara} av {steg.length} steg klara</span>
              <span className="font-semibold text-gray-600">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Åtgärder */}
          {(pdfLink || allaKlara) && (
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
              {pdfLink ? (
                <a href={pdfLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Öppna PDF-protokoll
                </a>
              ) : (
                <button onClick={genereraPDF} disabled={generatingPdf}
                  className="bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors">
                  {generatingPdf ? 'Genererar...' : 'Generera protokoll (PDF)'}
                </button>
              )}
              {allaKlara && projektStatus !== 'godkand' && projektStatus !== 'underkand' && (
                <div className="flex gap-2">
                  <button onClick={() => uppdateraProjektStatus('godkand')}
                    className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-500 transition-colors">
                    Godkänn
                  </button>
                  <button onClick={() => uppdateraProjektStatus('underkand')}
                    className="bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-400 transition-colors">
                    Underkänn
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Steg-lista */}
      <div className="space-y-2">
        {sortedSteg.map(s => {
          const ms = s.mall_steg
          if (!ms) return null
          const isExpanded = expandedId === s.id
          const isDone = s.status === 'klar' || s.status === 'godkand'

          return (
            <div key={s.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${isExpanded ? 'border-blue-200' : 'border-gray-100'}`}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                  isDone ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isDone
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    : ms.ordning}
                </div>
                <span className="flex-1 text-sm font-medium text-gray-900 text-left">{ms.rubrik}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[s.status]}`}>
                  {statusLabel[s.status]}
                </span>
                <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-5 space-y-5">
                  <p className="text-sm text-gray-600 leading-relaxed bg-blue-50 rounded-xl px-4 py-3">{ms.instruktion}</p>

                  {/* Noteringar */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Noteringar / information</label>
                    <textarea
                      value={noteringar[s.id] ?? ''}
                      onChange={e => setNoteringar(prev => ({ ...prev, [s.id]: e.target.value }))}
                      onBlur={() => sparaNoteringar(s.id)}
                      placeholder="Fyll i relevant information, t.ex. företagsnamn, org.nr, mätningar..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Sparas automatiskt</p>
                  </div>

                  {/* Bild */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Foto</label>
                    {s.bild_url ? (
                      <div className="space-y-2">
                        <img src={s.bild_url} alt={ms.rubrik} className="w-full max-h-56 rounded-xl border border-gray-200 object-cover" />
                        <button onClick={() => fileRefs.current[s.id]?.click()} className="text-xs text-blue-600 font-medium hover:underline">
                          Byt foto
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRefs.current[s.id]?.click()}
                        disabled={uploading === s.id}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 flex flex-col items-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {uploading === s.id ? 'Laddar upp...' : 'Ta foto eller välj bild'}
                      </button>
                    )}
                    <input ref={el => { if (el) fileRefs.current[s.id] = el }} type="file" accept="image/*" capture="environment"
                      className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadBild(s.id, f) }} />
                  </div>

                  {/* Signatur */}
                  {s.signerad_av && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-green-800">Signerad av {s.signerad_av}</p>
                        {s.signerad_tid && <p className="text-xs text-green-600">{new Date(s.signerad_tid).toLocaleString('sv-SE')}</p>}
                      </div>
                    </div>
                  )}

                  {/* Markera klar */}
                  {s.status === 'ej_paborjad' && (
                    <button onClick={() => markeraKlar(s.id)}
                      className="w-full bg-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
                      Markera som klar
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Signeringsmodal */}
      {signing && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Signera steget</h2>
              <p className="text-sm text-gray-500 mt-1">Bekräfta ditt namn för att markera steget som klart.</p>
            </div>
            <input
              type="text"
              value={signing.namn}
              onChange={e => setSigning(prev => prev ? { ...prev, namn: e.target.value } : null)}
              placeholder="Ditt fullständiga namn"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setSigning(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Avbryt
              </button>
              <button onClick={submitSignering} disabled={!signing.namn.trim()}
                className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors">
                Signera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
