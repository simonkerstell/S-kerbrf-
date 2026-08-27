'use client'

import { useState } from 'react'
import Link from 'next/link'
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
      <nav className="bg-blue-900 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight">Säker BRF</span>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#hur-det-fungerar" className="text-sm text-blue-200 hover:text-white transition-colors">Hur det fungerar</a>
            <a href="#ansokan" className="text-sm text-blue-200 hover:text-white transition-colors">Ansök</a>
            <Link
              href="/login"
              className="bg-white text-blue-900 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Logga in
            </Link>
          </div>
          <button className="sm:hidden text-white" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div className="sm:hidden mt-3 flex flex-col gap-3 px-2 pb-2">
            <a href="#hur-det-fungerar" className="text-sm text-blue-200" onClick={() => setMenuOpen(false)}>Hur det fungerar</a>
            <a href="#ansokan" className="text-sm text-blue-200" onClick={() => setMenuOpen(false)}>Ansök</a>
            <Link href="/login" className="text-sm font-semibold text-white">Logga in →</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="bg-blue-900 text-white px-6 pb-20 pt-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-blue-700 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Pilotprogram 2026</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
            Digitala besiktnings&shy;protokoll för BRF
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Säker BRF hjälper bostadsrättsföreningar att dokumentera renoveringar steg för steg — med foton, noteringar och digitala signaturer. Allt samlat i ett PDF-protokoll.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#ansokan"
              className="bg-white text-blue-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Ansök om att delta
            </a>
            <a
              href="#hur-det-fungerar"
              className="border border-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              Hur fungerar det?
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Renoveringar utan dokumentation skapar problem</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            När en bostadsrättshavare renoverar är BRF:en ansvarig för att rätt arbete utförs av rätt aktörer. Utan strukturerad dokumentation är det svårt att bevisa vad som gjorts — och av vem.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
            {[
              { titel: 'Saknade certifikat', text: 'Svårt att i efterhand bevisa att hantverkare hade rätt behörighet.' },
              { titel: 'Otydlig ansvarsfördelning', text: 'Vem ansvarar om något går fel sex månader efter renoveringen?' },
              { titel: 'Pappersarbete och e-post', text: 'Dokument sprids i inkorgar och pärmar — svåra att hitta när de behövs.' },
            ].map(k => (
              <div key={k.titel} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">{k.titel}</p>
                <p className="text-sm text-gray-500">{k.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hur det fungerar */}
      <section id="hur-det-fungerar" className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Hur Säker BRF fungerar</h2>
          <div className="space-y-6">
            {[
              { nr: '1', titel: 'Skapa ett projekt', text: 'Ordföranden startar ett projekt för den aktuella renoveringen och väljer typ av åtgärd — t.ex. badrumsrenovering eller markarbete.' },
              { nr: '2', titel: 'Fyll i checklistan steg för steg', text: 'Varje projekt innehåller ett antal steg baserade på en mall. Fyll i information, ladda upp foton och notera vad som gäller för just er renovering.' },
              { nr: '3', titel: 'Signera digitalt', text: 'Markera varje steg som klart med en digital signatur direkt i appen. Ingen utskrift behövs.' },
              { nr: '4', titel: 'Generera PDF-protokoll', text: 'När alla steg är klara genereras ett komplett besiktningsprotokoll med bilder, noteringar och signaturer — redo att arkivera.' },
            ].map(s => (
              <div key={s.nr} className="flex gap-4">
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm mt-0.5">{s.nr}</span>
                <div>
                  <p className="font-semibold text-gray-900">{s.titel}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ansökan */}
      <section id="ansokan" className="py-16 px-6 bg-blue-50">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Ansök om att delta i piloten</h2>
            <p className="text-gray-500 mt-2 text-sm">Vi tar just nu emot ett begränsat antal BRF:er. Fyll i formuläret så hör vi av oss.</p>
          </div>

          {skickad ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <p className="text-2xl mb-2">✓</p>
              <p className="font-semibold text-green-800 text-lg">Ansökan mottagen!</p>
              <p className="text-green-700 text-sm mt-1">Vi återkommer inom kort med mer information.</p>
            </div>
          ) : (
            <form onSubmit={handleAnsokan} className="bg-white rounded-2xl border border-blue-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BRF-namn</label>
                <input
                  type="text"
                  required
                  value={formData.brf_namn}
                  onChange={e => setFormData(p => ({ ...p, brf_namn: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="t.ex. BRF Solgläntan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ditt namn</label>
                <input
                  type="text"
                  required
                  value={formData.kontakt_namn}
                  onChange={e => setFormData(p => ({ ...p, kontakt_namn: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Förnamn Efternamn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="din@brf.se"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon <span className="text-gray-400 font-normal">(valfritt)</span></label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={e => setFormData(p => ({ ...p, telefon: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="070-000 00 00"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors mt-2"
              >
                {loading ? 'Skickar...' : 'Skicka ansökan'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-300 text-center text-xs py-6 px-4">
        <p className="font-semibold text-white text-sm mb-1">Säker BRF</p>
        <p>Digital besiktningsplattform för bostadsrättsföreningar · Pilotprogram 2026</p>
      </footer>
    </div>
  )
}
