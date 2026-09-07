'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const [formData, setFormData] = useState({ brf_namn: '', kontakt_namn: '', email: '', telefon: '' })
  const [skickad, setSkickad] = useState(false)
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  async function handleAnsokan(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('brf_ansokan').insert([formData] as never[])
    setSkickad(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-blue-950 text-white px-5 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Image src="/logo.png" alt="Säker BRF" width={48} height={56} className="object-contain" priority />
          <div className="hidden sm:flex items-center gap-8">
            <a href="#hur-det-fungerar" className="text-sm text-blue-300 hover:text-white transition-colors">Hur det fungerar</a>
            <a href="#ansokan" className="text-sm text-blue-300 hover:text-white transition-colors">Ansök</a>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Logga in
            </Link>
          </div>
          <button className="sm:hidden p-1 text-blue-200" onClick={() => setMenuOpen(v => !v)} aria-label="Meny">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div className="sm:hidden mt-4 flex flex-col gap-4 px-1 pb-2 border-t border-blue-800 pt-4">
            <a href="#hur-det-fungerar" className="text-sm text-blue-200" onClick={() => setMenuOpen(false)}>Hur det fungerar</a>
            <a href="#ansokan" className="text-sm text-blue-200" onClick={() => setMenuOpen(false)}>Ansök om pilot</a>
            <Link href="/login" className="bg-blue-600 text-white text-center px-4 py-3 rounded-xl text-sm font-semibold" onClick={() => setMenuOpen(false)}>
              Logga in
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-950 to-blue-900 text-white px-5 pb-24 pt-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-blue-800 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">Pilotprogram 2026</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 tracking-tight">
            Digitala verifikations&shy;protokoll för BRF
          </h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Säker BRF hjälper bostadsrättsföreningar att dokumentera renoveringar steg för steg — med foton, noteringar och digitala signaturer. Allt samlat i ett PDF-protokoll.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#ansokan" className="bg-white text-blue-900 px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg">
              Ansök om att delta
            </a>
            <a href="#hur-det-fungerar" className="border border-blue-600 text-white px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors">
              Hur fungerar det?
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-5 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">Renoveringar utan dokumentation skapar problem</h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-10">
            När en bostadsrättshavare renoverar är BRF:en ansvarig för att rätt arbete utförs av rätt aktörer.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { titel: 'Saknade certifikat', text: 'Svårt att i efterhand bevisa att hantverkare hade rätt behörighet.' },
              { titel: 'Otydlig ansvarsfördelning', text: 'Vem ansvarar om något går fel sex månader efter renoveringen?' },
              { titel: 'Pappersarbete och e-post', text: 'Dokument sprids i inkorgar — svåra att hitta när de behövs.' },
            ].map(k => (
              <div key={k.titel} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">{k.titel}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{k.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hur det fungerar */}
      <section id="hur-det-fungerar" className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">Hur Säker BRF fungerar</h2>
          <div className="space-y-5">
            {[
              { nr: '1', titel: 'Skapa ett projekt', text: 'Ordföranden startar ett projekt för den aktuella renoveringen och väljer typ av åtgärd.' },
              { nr: '2', titel: 'Fyll i checklistan steg för steg', text: 'Varje projekt innehåller ett antal steg. Fyll i information, ladda upp foton och notera vad som gäller.' },
              { nr: '3', titel: 'Signera digitalt', text: 'Markera varje steg som klart med en digital signatur direkt i appen. Ingen utskrift behövs.' },
              { nr: '4', titel: 'Generera PDF-protokoll', text: 'När alla steg är klara genereras ett komplett verifikationsprotokoll med bilder och signaturer.' },
            ].map(s => (
              <div key={s.nr} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-700 text-white font-bold flex items-center justify-center text-sm">{s.nr}</span>
                <div className="pt-0.5">
                  <p className="font-semibold text-gray-900">{s.titel}</p>
                  <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ansökan */}
      <section id="ansokan" className="py-16 px-5 bg-blue-950">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ansök om att delta i piloten</h2>
            <p className="text-blue-300 mt-2 text-sm">Vi tar just nu emot ett begränsat antal BRF:er.</p>
          </div>
          {skickad ? (
            <div className="bg-blue-900 border border-blue-700 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-white text-lg">Ansökan mottagen!</p>
              <p className="text-blue-300 text-sm mt-1">Vi återkommer inom kort med mer information.</p>
            </div>
          ) : (
            <form onSubmit={handleAnsokan} className="bg-white rounded-2xl p-6 space-y-4 shadow-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">BRF-namn</label>
                <input type="text" required value={formData.brf_namn}
                  onChange={e => setFormData(p => ({ ...p, brf_namn: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="t.ex. BRF Solgläntan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ditt namn</label>
                <input type="text" required value={formData.kontakt_namn}
                  onChange={e => setFormData(p => ({ ...p, kontakt_namn: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Förnamn Efternamn" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-post</label>
                <input type="email" required value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="din@brf.se" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon <span className="text-gray-400 font-normal">(valfritt)</span></label>
                <input type="tel" value={formData.telefon}
                  onChange={e => setFormData(p => ({ ...p, telefon: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="070-000 00 00" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors mt-2">
                {loading ? 'Skickar...' : 'Skicka ansökan'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-blue-400 text-center text-xs py-8 px-4 border-t border-blue-900">
        <p className="font-semibold text-white text-sm mb-1">Säker BRF</p>
        <p>Digital verifikationsplattform för bostadsrättsföreningar · Pilotprogram 2026</p>
      </footer>
    </div>
  )
}
