'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StegStatus } from '@/lib/supabase/types'

interface Bild { id: string; url: string }
interface Material { id: string; material: string; mangd: number | null; enhet: string | null }

interface Steg {
  id: string; projekt_id: string; mall_steg_id: string
  bild_url: string | null; signerad_av: string | null; signerad_tid: string | null
  status: StegStatus; kommentar: string | null; noteringar: string | null
  mall_steg: { ordning: number; rubrik: string; instruktion: string; branschregler: string | null; mall_steg_delar: { id: string; rubrik: string; ordning: number }[] } | null
  bilder: Bild[]
  material: Material[]
  delar_klar: Record<string, boolean>
}

interface UEEntry { id: string; foretag: string; kontaktperson: string | null; telefon: string | null; typ_arbete: string | null; datum: string }

interface Projekt {
  id: string; brf_adress: string; status: string; skapad_tid: string; mall_namn: string
}

interface PersonEntry {
  id: string; datum: string; bekraftad_av: string | null; bekraftad_tid: string | null
  id06_nr: string | null; namn: string; foretag: string | null
  org_nr: string | null; f_skatt: boolean
  cert_el: boolean; cert_vvs: boolean; cert_vatten: boolean; cert_tatskikt: boolean; cert_gas: boolean; cert_ovrigt: string | null
}

const CERTS: { key: keyof PersonEntry; label: string; color: string }[] = [
  { key: 'cert_el', label: 'El', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'cert_vvs', label: 'VVS/Rör', color: 'bg-blue-100 text-blue-700' },
  { key: 'cert_vatten', label: 'Vatten & avlopp', color: 'bg-cyan-100 text-cyan-700' },
  { key: 'cert_tatskikt', label: 'Tätskikt (GVK)', color: 'bg-green-100 text-green-700' },
  { key: 'cert_gas', label: 'Gas', color: 'bg-orange-100 text-orange-700' },
]

const DEFAULT_PERSON = {
  id06_nr: '', namn: '', foretag: '', org_nr: '', f_skatt: false,
  cert_el: false, cert_vvs: false, cert_vatten: false, cert_tatskikt: false, cert_gas: false, cert_ovrigt: '',
  datum: new Date().toISOString().slice(0, 10), bekraftad: false,
}

interface Props {
  projekt: Projekt; steg: Steg[]; personalliggare: PersonEntry[]; projektUe: UEEntry[]; userName: string; pdfUrl: string | null
}

const statusLabel: Record<string, string> = {
  ej_paborjad: 'Ej påbörjad',
  klar: 'Väntar på godkännande',
  godkand: 'Godkänd',
  underkand: 'Ej godkänd',
}

const statusColor: Record<string, string> = {
  ej_paborjad: 'bg-gray-100 text-gray-500',
  klar: 'bg-amber-100 text-amber-700',
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

export default function ProjektVy({ projekt, steg: initialSteg, personalliggare: initialPersoner, projektUe: initialUe, userName, pdfUrl }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [steg, setSteg] = useState(initialSteg)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [bilderMap, setBilderMap] = useState<Record<string, Bild[]>>(
    Object.fromEntries(initialSteg.map(s => [s.id, s.bilder ?? []]))
  )
  const [materialMap, setMaterialMap] = useState<Record<string, Material[]>>(
    Object.fromEntries(initialSteg.map(s => [s.id, s.material ?? []]))
  )
  const [nyMaterial, setNyMaterial] = useState<Record<string, { material: string; mangd: string; enhet: string }>>({})
  const [spararMaterial, setSpararMaterial] = useState<string | null>(null)
  const [delarKlarMap, setDelarKlarMap] = useState<Record<string, Record<string, boolean>>>(
    Object.fromEntries(initialSteg.map(s => [s.id, { ...s.delar_klar }]))
  )
  const [ue, setUe] = useState<UEEntry[]>(initialUe)
  const [visarUe, setVisarUe] = useState(false)
  const [nyUe, setNyUe] = useState({ foretag: '', kontaktperson: '', telefon: '', typ_arbete: '', datum: new Date().toISOString().slice(0, 10) })
  const [spararUe, setSpararUe] = useState(false)
  const [signing, setSigning] = useState<{ id: string; namn: string } | null>(null)
  const [noteringar, setNoteringar] = useState<Record<string, string>>(
    Object.fromEntries(initialSteg.map(s => [s.id, s.noteringar ?? '']))
  )
  const [personer, setPersoner] = useState<PersonEntry[]>(initialPersoner)
  const [visar, setVisar] = useState(false)
  const [nyPerson, setNyPerson] = useState(DEFAULT_PERSON)
  const [id06Kand, setId06Kand] = useState<boolean | null>(null)
  const [sokerId06, setSokerId06] = useState(false)
  const [sparar, setSparar] = useState(false)
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
    const path = `${projekt.id}/${stegId}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('bilder').upload(path, file, { upsert: false })
    if (uploadErr) { alert('Fel vid uppladdning: ' + uploadErr.message); setUploading(null); return }
    const { data: { publicUrl } } = supabase.storage.from('bilder').getPublicUrl(path)
    const { data: bildRow } = await supabase
      .from('projekt_steg_bilder')
      .insert({ steg_id: stegId, url: publicUrl } as never)
      .select('id, url')
      .single()
    if (bildRow) {
      const bild = bildRow as Bild
      setBilderMap(prev => ({ ...prev, [stegId]: [...(prev[stegId] ?? []), bild] }))
    }
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

  async function godkannSteg(stegId: string, beslut: 'godkand' | 'underkand') {
    const now = new Date().toISOString()
    await supabase.from('projekt_steg').update({ status: beslut, uppdaterad_tid: now } as never).eq('id', stegId)
    updateSteg(stegId, { status: beslut })
  }

  async function submitSignering() {
    if (!signing || !signing.namn.trim()) return
    const now = new Date().toISOString()
    await supabase.from('projekt_steg').update({ signerad_av: signing.namn, signerad_tid: now, status: 'klar', uppdaterad_tid: now } as never).eq('id', signing.id)
    updateSteg(signing.id, { signerad_av: signing.namn, signerad_tid: now, status: 'klar' })
    setSigning(null)
  }

  async function toggleDel(stegId: string, delId: string) {
    const klar = !(delarKlarMap[stegId]?.[delId] ?? false)
    setDelarKlarMap(prev => ({ ...prev, [stegId]: { ...(prev[stegId] ?? {}), [delId]: klar } }))
    await supabase.from('projekt_steg_delar_klar').upsert(
      { projekt_steg_id: stegId, mall_steg_del_id: delId, klar } as never,
      { onConflict: 'projekt_steg_id,mall_steg_del_id' }
    )
  }

  async function laggTillUe() {
    if (!nyUe.foretag.trim()) return
    setSpararUe(true)
    const { data } = await supabase.from('projekt_ue').insert({
      projekt_id: projekt.id, foretag: nyUe.foretag, kontaktperson: nyUe.kontaktperson || null,
      telefon: nyUe.telefon || null, typ_arbete: nyUe.typ_arbete || null, datum: nyUe.datum,
    } as never).select('id, foretag, kontaktperson, telefon, typ_arbete, datum').single()
    if (data) {
      setUe(prev => [data as UEEntry, ...prev])
      setNyUe({ foretag: '', kontaktperson: '', telefon: '', typ_arbete: '', datum: new Date().toISOString().slice(0, 10) })
      setVisarUe(false)
    }
    setSpararUe(false)
  }

  async function taBortUe(id: string) {
    await supabase.from('projekt_ue').delete().eq('id', id)
    setUe(prev => prev.filter(u => u.id !== id))
  }

  async function laggTillMaterial(stegId: string) {
    const nm = nyMaterial[stegId]
    if (!nm?.material.trim()) return
    setSpararMaterial(stegId)
    const { data } = await supabase
      .from('steg_material')
      .insert({ steg_id: stegId, material: nm.material, mangd: nm.mangd ? parseFloat(nm.mangd) : null, enhet: nm.enhet || null } as never)
      .select('id, material, mangd, enhet')
      .single()
    if (data) {
      setMaterialMap(prev => ({ ...prev, [stegId]: [...(prev[stegId] ?? []), data as Material] }))
      setNyMaterial(prev => ({ ...prev, [stegId]: { material: '', mangd: '', enhet: '' } }))
    }
    setSpararMaterial(null)
  }

  async function taBortMaterial(stegId: string, id: string) {
    await supabase.from('steg_material').delete().eq('id', id)
    setMaterialMap(prev => ({ ...prev, [stegId]: (prev[stegId] ?? []).filter(m => m.id !== id) }))
  }

  async function lookupId06() {
    if (!nyPerson.id06_nr.trim()) return
    setSokerId06(true)
    const { data } = await supabase.from('id06_register').select('*').eq('id06_nr', nyPerson.id06_nr.trim()).maybeSingle()
    if (data) {
      const d = data as Record<string, unknown>
      setNyPerson(prev => ({ ...prev, namn: d.namn as string, foretag: (d.foretag as string) ?? '', org_nr: (d.org_nr as string) ?? '', f_skatt: d.f_skatt as boolean, cert_el: d.cert_el as boolean, cert_vvs: d.cert_vvs as boolean, cert_vatten: d.cert_vatten as boolean, cert_tatskikt: d.cert_tatskikt as boolean, cert_gas: d.cert_gas as boolean, cert_ovrigt: (d.cert_ovrigt as string) ?? '' }))
      setId06Kand(true)
    } else {
      setId06Kand(false)
    }
    setSokerId06(false)
  }

  async function laggTillPerson() {
    if (!nyPerson.namn.trim() || !nyPerson.bekraftad) return
    setSparar(true)
    const now = new Date().toISOString()
    let registerId: string | null = null

    if (nyPerson.id06_nr.trim()) {
      if (id06Kand) {
        const { data } = await supabase.from('id06_register').select('id').eq('id06_nr', nyPerson.id06_nr.trim()).single()
        registerId = data ? (data as { id: string }).id : null
      } else {
        const { data } = await supabase.from('id06_register').insert({
          id06_nr: nyPerson.id06_nr.trim(), namn: nyPerson.namn, foretag: nyPerson.foretag || null,
          org_nr: nyPerson.org_nr || null, f_skatt: nyPerson.f_skatt,
          cert_el: nyPerson.cert_el, cert_vvs: nyPerson.cert_vvs, cert_vatten: nyPerson.cert_vatten,
          cert_tatskikt: nyPerson.cert_tatskikt, cert_gas: nyPerson.cert_gas, cert_ovrigt: nyPerson.cert_ovrigt || null,
        } as never).select('id').single()
        registerId = data ? (data as { id: string }).id : null
      }
    }

    const { data } = await supabase.from('personalliggare').insert({
      projekt_id: projekt.id, id06_register_id: registerId,
      namn: nyPerson.namn, foretag: nyPerson.foretag || null, id06_nr: nyPerson.id06_nr || null,
      datum: nyPerson.datum, bekraftad_av: userName, bekraftad_tid: now,
    } as never).select('id, datum, bekraftad_av, bekraftad_tid').single()

    if (data) {
      const d = data as { id: string; datum: string; bekraftad_av: string; bekraftad_tid: string }
      setPersoner(prev => [{
        id: d.id, datum: d.datum, bekraftad_av: d.bekraftad_av, bekraftad_tid: d.bekraftad_tid,
        id06_nr: nyPerson.id06_nr || null, namn: nyPerson.namn, foretag: nyPerson.foretag || null,
        org_nr: nyPerson.org_nr || null, f_skatt: nyPerson.f_skatt,
        cert_el: nyPerson.cert_el, cert_vvs: nyPerson.cert_vvs, cert_vatten: nyPerson.cert_vatten,
        cert_tatskikt: nyPerson.cert_tatskikt, cert_gas: nyPerson.cert_gas, cert_ovrigt: nyPerson.cert_ovrigt || null,
      }, ...prev])
      setNyPerson(DEFAULT_PERSON)
      setId06Kand(null)
      setVisar(false)
    }
    setSparar(false)
  }

  async function taBortPerson(id: string) {
    await supabase.from('personalliggare').delete().eq('id', id)
    setPersoner(prev => prev.filter(p => p.id !== id))
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
  const antalGodkanda = steg.filter(s => s.status === 'godkand').length
  const antalKlara = steg.filter(s => s.status === 'klar' || s.status === 'godkand').length
  const allaKlara = steg.length > 0 && antalGodkanda === steg.length
  const progress = Math.round((antalGodkanda / Math.max(steg.length, 1)) * 100)

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
              <span>{antalGodkanda} av {steg.length} steg godkända</span>
              <span className="font-semibold text-gray-600">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            {antalKlara > antalGodkanda && (
              <p className="text-xs text-amber-600 mt-1.5 font-medium">
                {antalKlara - antalGodkanda} steg väntar på godkännande
              </p>
            )}
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

                  {/* Branschregler */}
                  {ms.branschregler && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
                      <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-amber-800 mb-0.5">Branschregler</p>
                        <p className="text-xs text-amber-700 leading-relaxed">{ms.branschregler}</p>
                      </div>
                    </div>
                  )}

                  {/* Underrubriker */}
                  {ms.mall_steg_delar && ms.mall_steg_delar.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kontrollpunkter</label>
                      <div className="space-y-1">
                        {[...ms.mall_steg_delar].sort((a, b) => a.ordning - b.ordning).map(del => {
                          const klar = delarKlarMap[s.id]?.[del.id] ?? false
                          return (
                            <label key={del.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${klar ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                              <input type="checkbox" checked={klar} onChange={() => toggleDel(s.id, del.id)} className="rounded flex-shrink-0" />
                              <span className={`text-sm ${klar ? 'line-through text-gray-400' : 'text-gray-800'}`}>{del.rubrik}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}

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

                  {/* Materialåtgång */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Materialåtgång</label>
                    {(materialMap[s.id] ?? []).length > 0 && (
                      <div className="mb-2 divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                        {(materialMap[s.id] ?? []).map(m => (
                          <div key={m.id} className="flex items-center justify-between px-3 py-2 bg-white">
                            <span className="text-sm text-gray-800">{m.material}</span>
                            <div className="flex items-center gap-3">
                              {m.mangd != null && (
                                <span className="text-sm font-semibold text-blue-700">{m.mangd} {m.enhet ?? ''}</span>
                              )}
                              <button onClick={() => taBortMaterial(s.id, m.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Ta bort</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Material (t.ex. Kakel)"
                        value={nyMaterial[s.id]?.material ?? ''}
                        onChange={e => setNyMaterial(prev => ({ ...prev, [s.id]: { ...{ material: '', mangd: '', enhet: '' }, ...prev[s.id], material: e.target.value } }))}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Mängd"
                        value={nyMaterial[s.id]?.mangd ?? ''}
                        onChange={e => setNyMaterial(prev => ({ ...prev, [s.id]: { ...{ material: '', mangd: '', enhet: '' }, ...prev[s.id], mangd: e.target.value } }))}
                        className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={nyMaterial[s.id]?.enhet ?? ''}
                        onChange={e => setNyMaterial(prev => ({ ...prev, [s.id]: { ...{ material: '', mangd: '', enhet: '' }, ...prev[s.id], enhet: e.target.value } }))}
                        className="w-20 border border-gray-200 rounded-xl px-2 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Enhet</option>
                        <option value="m²">m²</option>
                        <option value="lm">lm</option>
                        <option value="st">st</option>
                        <option value="kg">kg</option>
                        <option value="l">l</option>
                      </select>
                      <button
                        onClick={() => laggTillMaterial(s.id)}
                        disabled={!nyMaterial[s.id]?.material.trim() || spararMaterial === s.id}
                        className="bg-blue-700 text-white px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors flex-shrink-0"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Bilder */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Foton</label>
                    {(() => {
                      const allaBilder: Bild[] = [
                        ...(s.bild_url ? [{ id: 'legacy', url: s.bild_url }] : []),
                        ...(bilderMap[s.id] ?? []),
                      ]
                      return (
                        <div className="space-y-3">
                          {allaBilder.length > 0 && (
                            <div className={`grid gap-2 ${allaBilder.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                              {allaBilder.map(b => (
                                <img key={b.id} src={b.url} alt={ms.rubrik}
                                  className="w-full rounded-xl border border-gray-200 object-cover aspect-video" />
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => fileRefs.current[s.id]?.click()}
                            disabled={uploading === s.id}
                            className={`w-full border-2 border-dashed rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                              allaBilder.length > 0
                                ? 'border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 py-3'
                                : 'border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 py-8 flex-col'
                            }`}
                          >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{uploading === s.id ? 'Laddar upp...' : allaBilder.length > 0 ? 'Lägg till foto' : 'Ta foto eller välj bild'}</span>
                          </button>
                        </div>
                      )
                    })()}
                    <input ref={el => { if (el) fileRefs.current[s.id] = el }} type="file" accept="image/*" capture="environment"
                      className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadBild(s.id, f); e.target.value = '' }} />
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
                      Markera som klar → skicka för godkännande
                    </button>
                  )}

                  {/* Väntar på godkännande */}
                  {s.status === 'klar' && (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-amber-800">Väntar på godkännande</p>
                            <p className="text-xs text-amber-700 mt-0.5">Kontakta ordförande eller överman för godkännande av detta steg innan nästa steg påbörjas.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => godkannSteg(s.id, 'godkand')}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-500 transition-colors">
                          Godkänn steg
                        </button>
                        <button onClick={() => godkannSteg(s.id, 'underkand')}
                          className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-400 transition-colors">
                          Ej godkänd
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ej godkänd — kan fyllas i igen */}
                  {s.status === 'underkand' && (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-red-700">Ej godkänd</p>
                          <p className="text-xs text-red-600 mt-0.5">Åtgärda och skicka för godkännande igen.</p>
                        </div>
                      </div>
                      <button onClick={() => markeraKlar(s.id)}
                        className="w-full bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
                        Skicka för godkännande igen
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Personalliggare */}
      <div className="mt-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Personalliggare</h2>
            <p className="text-xs text-gray-400 mt-0.5">{personer.length} {personer.length === 1 ? 'person' : 'personer'} registrerade</p>
          </div>
          <button onClick={() => setVisar(v => !v)}
            className="bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-600 transition-colors">
            + Lägg till
          </button>
        </div>

        {visar && (
          <div className="px-5 py-4 border-b border-gray-100 bg-blue-50 space-y-4">
            {/* ID06-sökning */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">ID06-nummer</label>
              <div className="flex gap-2">
                <input type="text" value={nyPerson.id06_nr}
                  onChange={e => { setNyPerson(p => ({ ...p, id06_nr: e.target.value })); setId06Kand(null) }}
                  placeholder="Ange ID06-kortnummer"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={lookupId06} disabled={!nyPerson.id06_nr.trim() || sokerId06}
                  className="bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors">
                  {sokerId06 ? '...' : 'Sök'}
                </button>
              </div>
              {id06Kand === true && <p className="text-xs text-green-600 font-medium mt-1">Känd hantverkare — uppgifter hämtade från registret</p>}
              {id06Kand === false && <p className="text-xs text-amber-600 font-medium mt-1">Nytt ID06 — fyll i uppgifter nedan, sparas i registret</p>}
            </div>

            {/* Namn & företag */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Namn *</label>
                <input type="text" value={nyPerson.namn}
                  onChange={e => setNyPerson(p => ({ ...p, namn: e.target.value }))}
                  readOnly={id06Kand === true}
                  placeholder="Förnamn Efternamn"
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${id06Kand === true ? 'bg-gray-100 text-gray-500' : 'bg-white'}`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Företag</label>
                <input type="text" value={nyPerson.foretag}
                  onChange={e => setNyPerson(p => ({ ...p, foretag: e.target.value }))}
                  readOnly={id06Kand === true}
                  placeholder="Företagsnamn"
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${id06Kand === true ? 'bg-gray-100 text-gray-500' : 'bg-white'}`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Org.nr</label>
                <input type="text" value={nyPerson.org_nr}
                  onChange={e => setNyPerson(p => ({ ...p, org_nr: e.target.value }))}
                  readOnly={id06Kand === true}
                  placeholder="556000-0000"
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${id06Kand === true ? 'bg-gray-100 text-gray-500' : 'bg-white'}`} />
              </div>
              <div className="col-span-2">
                <label className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border cursor-pointer transition-all ${nyPerson.f_skatt ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'} ${id06Kand === true ? 'opacity-60 pointer-events-none' : ''}`}>
                  <input type="checkbox" checked={nyPerson.f_skatt}
                    onChange={e => setNyPerson(p => ({ ...p, f_skatt: e.target.checked }))}
                    disabled={id06Kand === true}
                    className="rounded" />
                  <span className="text-sm text-gray-700 font-medium">Innehar F-skatt</span>
                  {nyPerson.f_skatt && <span className="ml-auto text-xs font-semibold text-green-600">Verifierat</span>}
                </label>
              </div>
            </div>

            {/* Certifieringar */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Certifieringar / behörigheter</label>
              <div className="grid grid-cols-2 gap-2">
                {CERTS.map(c => (
                  <label key={c.key} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border cursor-pointer transition-all ${nyPerson[c.key as keyof typeof nyPerson] ? 'border-blue-400 bg-white' : 'border-gray-200 bg-white'} ${id06Kand === true ? 'opacity-60 pointer-events-none' : ''}`}>
                    <input type="checkbox"
                      checked={!!nyPerson[c.key as keyof typeof nyPerson]}
                      onChange={e => setNyPerson(p => ({ ...p, [c.key]: e.target.checked }))}
                      disabled={id06Kand === true}
                      className="rounded" />
                    <span className="text-sm text-gray-700">{c.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2">
                <input type="text" value={nyPerson.cert_ovrigt}
                  onChange={e => setNyPerson(p => ({ ...p, cert_ovrigt: e.target.value }))}
                  readOnly={id06Kand === true}
                  placeholder="Övrigt (fritext)"
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${id06Kand === true ? 'bg-gray-100 text-gray-500' : 'bg-white'}`} />
              </div>
            </div>

            {/* Datum */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Datum på plats</label>
              <input type="date" value={nyPerson.datum} onChange={e => setNyPerson(p => ({ ...p, datum: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Heder och samvete */}
            <label className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={nyPerson.bekraftad}
                onChange={e => setNyPerson(p => ({ ...p, bekraftad: e.target.checked }))}
                className="mt-0.5 rounded flex-shrink-0" />
              <span className="text-xs text-gray-600 leading-relaxed">
                Jag intygar på heder och samvete att ovanstående uppgifter är korrekta. Är informationen felaktig är avtalet ogiltigt och den som bekräftat bär det juridiska ansvaret.
              </span>
            </label>

            <div className="flex gap-2">
              <button onClick={() => { setVisar(false); setId06Kand(null); setNyPerson(DEFAULT_PERSON) }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Avbryt
              </button>
              <button onClick={laggTillPerson} disabled={!nyPerson.namn.trim() || !nyPerson.bekraftad || sparar}
                className="flex-1 bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors">
                {sparar ? 'Sparar...' : 'Bekräfta & spara'}
              </button>
            </div>
          </div>
        )}

        {personer.length === 0 && !visar ? (
          <p className="px-5 py-6 text-sm text-gray-400 text-center">Inga personer incheckade än</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {personer.map(p => {
              const aktivaCerts = CERTS.filter(c => p[c.key as keyof PersonEntry])
              return (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{p.namn}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {p.foretag && <span className="text-xs text-gray-500">{p.foretag}</span>}
                        {p.org_nr && <span className="text-xs text-gray-400">org.nr {p.org_nr}</span>}
                        {p.id06_nr && <span className="text-xs text-blue-600 font-medium">ID06: {p.id06_nr}</span>}
                        <span className="text-xs text-gray-400">{new Date(p.datum).toLocaleDateString('sv-SE')}</span>
                      </div>
                      {p.f_skatt && (
                        <span className="inline-block mt-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">F-skatt</span>
                      )}
                      {aktivaCerts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {aktivaCerts.map(c => (
                            <span key={c.key} className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
                          ))}
                          {p.cert_ovrigt && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{p.cert_ovrigt}</span>}
                        </div>
                      )}
                      {p.bekraftad_av && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          Bekräftat av {p.bekraftad_av}{p.bekraftad_tid ? ` · ${new Date(p.bekraftad_tid).toLocaleDateString('sv-SE')}` : ''}
                        </p>
                      )}
                    </div>
                    <button onClick={() => taBortPerson(p.id)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 transition-colors mt-0.5">
                      Ta bort
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Underentreprenörer */}
      <div className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Underentreprenörer</h2>
            <p className="text-xs text-gray-400 mt-0.5">{ue.length} {ue.length === 1 ? 'UE' : 'UE'} registrerade</p>
          </div>
          <button onClick={() => setVisarUe(v => !v)}
            className="bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-600 transition-colors">
            + Lägg till
          </button>
        </div>

        {visarUe && (
          <div className="px-5 py-4 border-b border-gray-100 bg-blue-50 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Företag *</label>
                <input type="text" value={nyUe.foretag} onChange={e => setNyUe(p => ({ ...p, foretag: e.target.value }))}
                  placeholder="Företagsnamn" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Kontaktperson</label>
                <input type="text" value={nyUe.kontaktperson} onChange={e => setNyUe(p => ({ ...p, kontaktperson: e.target.value }))}
                  placeholder="Namn" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Telefon</label>
                <input type="tel" value={nyUe.telefon} onChange={e => setNyUe(p => ({ ...p, telefon: e.target.value }))}
                  placeholder="070-000 00 00" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Typ av arbete</label>
                <input type="text" value={nyUe.typ_arbete} onChange={e => setNyUe(p => ({ ...p, typ_arbete: e.target.value }))}
                  placeholder="t.ex. VVS, El" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Datum</label>
                <input type="date" value={nyUe.datum} onChange={e => setNyUe(p => ({ ...p, datum: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setVisarUe(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Avbryt</button>
              <button onClick={laggTillUe} disabled={!nyUe.foretag.trim() || spararUe}
                className="flex-1 bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-600 transition-colors">
                {spararUe ? 'Sparar...' : 'Spara'}
              </button>
            </div>
          </div>
        )}

        {ue.length === 0 && !visarUe ? (
          <p className="px-5 py-6 text-sm text-gray-400 text-center">Inga underentreprenörer registrerade</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {ue.map(u => (
              <div key={u.id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{u.foretag}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {u.kontaktperson && <span className="text-xs text-gray-500">{u.kontaktperson}</span>}
                    {u.telefon && <span className="text-xs text-blue-600">{u.telefon}</span>}
                    {u.typ_arbete && <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{u.typ_arbete}</span>}
                    <span className="text-xs text-gray-400">{new Date(u.datum).toLocaleDateString('sv-SE')}</span>
                  </div>
                </div>
                <button onClick={() => taBortUe(u.id)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 transition-colors">Ta bort</button>
              </div>
            ))}
          </div>
        )}
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
