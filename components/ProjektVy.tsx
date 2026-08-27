'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StegStatus } from '@/lib/supabase/types'

interface Steg {
  id: string
  projekt_id: string
  mall_steg_id: string
  bild_url: string | null
  signerad_av: string | null
  signerad_tid: string | null
  status: StegStatus
  kommentar: string | null
  noteringar: string | null
  mall_steg: { ordning: number; rubrik: string; instruktion: string } | null
}

interface Projekt {
  id: string
  brf_adress: string
  status: string
  skapad_tid: string
  mall_namn: string
}

interface Props {
  projekt: Projekt
  steg: Steg[]
  userName: string
  pdfUrl: string | null
}

const statusLabel: Record<string, string> = {
  ej_paborjad: 'Ej påbörjad',
  klar: 'Klar',
  godkand: 'Godkänd',
  underkand: 'Underkänd',
}

const statusColor: Record<string, string> = {
  ej_paborjad: 'bg-gray-100 text-gray-600',
  klar: 'bg-blue-100 text-blue-700',
  godkand: 'bg-green-100 text-green-700',
  underkand: 'bg-red-100 text-red-700',
}

const projektStatusLabel: Record<string, string> = {
  pagaende: 'Pågående',
  klar: 'Klar för godkännande',
  godkand: 'Godkänd',
  underkand: 'Underkänd',
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

    const { error: uploadErr } = await supabase.storage
      .from('bilder')
      .upload(path, file, { upsert: true })

    if (uploadErr) { alert('Fel vid uppladdning: ' + uploadErr.message); setUploading(null); return }

    const { data: { publicUrl } } = supabase.storage.from('bilder').getPublicUrl(path)
    await supabase.from('projekt_steg').update({ bild_url: publicUrl } as never).eq('id', stegId)
    updateSteg(stegId, { bild_url: publicUrl })
    setUploading(null)
  }

  async function sparaNoteringar(stegId: string) {
    const text = noteringar[stegId] ?? ''
    await supabase.from('projekt_steg').update({
      noteringar: text || null,
      uppdaterad_tid: new Date().toISOString(),
    } as never).eq('id', stegId)
    updateSteg(stegId, { noteringar: text || null })
  }

  async function markeraKlar(stegId: string) {
    const text = noteringar[stegId] ?? ''
    await supabase.from('projekt_steg').update({
      noteringar: text || null,
      uppdaterad_tid: new Date().toISOString(),
    } as never).eq('id', stegId)
    updateSteg(stegId, { noteringar: text || null })
    setSigning({ id: stegId, namn: userName })
  }

  async function submitSignering() {
    if (!signing || !signing.namn.trim()) return
    const now = new Date().toISOString()
    await supabase.from('projekt_steg').update({
      signerad_av: signing.namn,
      signerad_tid: now,
      status: 'klar',
      uppdaterad_tid: now,
    } as never).eq('id', signing.id)
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
      if (data.url) {
        setPdfLink(data.url)
        setProjektStatus('klar')
      } else {
        alert('Fel vid PDF-generering: ' + (data.error ?? 'Okänt fel'))
      }
    } catch {
      alert('Fel vid PDF-generering')
    }
    setGeneratingPdf(false)
  }

  const sortedSteg = [...steg].sort((a, b) =>
    (a.mall_steg?.ordning ?? 0) - (b.mall_steg?.ordning ?? 0)
  )
  const antalKlara = steg.filter(s => s.status === 'klar' || s.status === 'godkand').length
  const allaKlara = steg.length > 0 && antalKlara === steg.length

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-3 inline-flex items-center gap-1">
          ← Tillbaka
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{projekt.brf_adress}</h1>
            <p className="text-sm text-gray-500">{projekt.mall_namn}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[projektStatus] ?? 'bg-gray-100 text-gray-600'}`}>
            {projektStatusLabel[projektStatus] ?? projektStatus}
          </span>
        </div>

        {/* Framstegsindikator */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{antalKlara} av {steg.length} steg klara</span>
            <span>{Math.round((antalKlara / Math.max(steg.length, 1)) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(antalKlara / Math.max(steg.length, 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Åtgärder */}
        <div className="mt-4 flex flex-wrap gap-3">
          {pdfLink ? (
            <a
              href={pdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
            >
              Öppna PDF-protokoll
            </a>
          ) : allaKlara ? (
            <button
              onClick={genereraPDF}
              disabled={generatingPdf}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {generatingPdf ? 'Genererar PDF...' : 'Generera besiktningsprotokoll (PDF)'}
            </button>
          ) : null}

          {allaKlara && projektStatus !== 'godkand' && projektStatus !== 'underkand' && (
            <div className="flex gap-2">
              <button
                onClick={() => uppdateraProjektStatus('godkand')}
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Godkänn projekt
              </button>
              <button
                onClick={() => uppdateraProjektStatus('underkand')}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Underkänn projekt
              </button>
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

          return (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-400 w-6 text-right shrink-0">{ms.ordning}</span>
                <span className="flex-1 text-sm font-medium text-gray-900">{ms.rubrik}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[s.status]}`}>
                  {statusLabel[s.status]}
                </span>
                <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                  <p className="text-sm text-gray-600">{ms.instruktion}</p>

                  {/* Noteringar */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Noteringar / information</label>
                    <div className="space-y-1">
                      <textarea
                        value={noteringar[s.id] ?? ''}
                        onChange={e => setNoteringar(prev => ({ ...prev, [s.id]: e.target.value }))}
                        onBlur={() => sparaNoteringar(s.id)}
                        placeholder="Fyll i relevant information, t.ex. företagsnamn, org.nr, mätningar..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-400">Sparas automatiskt när du klickar utanför fältet</p>
                    </div>
                  </div>

                  {/* Bild */}
                  <div>
                    {s.bild_url ? (
                      <div className="space-y-2">
                        <img
                          src={s.bild_url}
                          alt={ms.rubrik}
                          className="max-h-48 rounded-lg border border-gray-200 object-contain"
                        />
                        <button
                          onClick={() => fileRefs.current[s.id]?.click()}
                          className="text-xs text-blue-600 underline"
                        >
                          Byt bild
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRefs.current[s.id]?.click()}
                        disabled={uploading === s.id}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                      >
                        {uploading === s.id ? 'Laddar upp...' : 'Ta foto eller välj bild'}
                      </button>
                    )}
                    <input
                      ref={el => { if (el) fileRefs.current[s.id] = el }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadBild(s.id, f) }}
                    />
                  </div>

                  {/* Signatur */}
                  {s.signerad_av && (
                    <p className="text-xs text-green-700 font-medium bg-green-50 rounded-lg px-3 py-2">
                      Signerad av: {s.signerad_av}
                      {s.signerad_tid && ` · ${new Date(s.signerad_tid).toLocaleString('sv-SE')}`}
                    </p>
                  )}

                  {/* Markera klar */}
                  {s.status === 'ej_paborjad' && (
                    <button
                      onClick={() => markeraKlar(s.id)}
                      className="w-full bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                    >
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
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold">Signera steget</h2>
            <p className="text-sm text-gray-600">Bekräfta ditt namn för att markera steget som klart.</p>
            <input
              type="text"
              value={signing.namn}
              onChange={e => setSigning(prev => prev ? { ...prev, namn: e.target.value } : null)}
              placeholder="Ditt fullständiga namn"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSigning(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium"
              >
                Avbryt
              </button>
              <button
                onClick={submitSignering}
                disabled={!signing.namn.trim()}
                className="flex-1 bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Signera &amp; markera klar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
