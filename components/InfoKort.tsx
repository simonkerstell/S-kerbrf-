'use client'

import { useState } from 'react'

const steg = [
  { nr: '1', rubrik: 'Skapa projekt', text: 'Välj typ av renovering och ange BRF-namn, lägenhet och adress.' },
  { nr: '2', rubrik: 'Fyll i stegen', text: 'Öppna ett steg i taget. Skriv in relevant information (t.ex. företagsnamn, mätningar) och ta gärna ett foto direkt med kameran.' },
  { nr: '3', rubrik: 'Signera', text: 'När ett steg är klart trycker du "Markera som klar" och bekräftar med ditt namn som signatur.' },
  { nr: '4', rubrik: 'Godkänn projektet', text: 'När alla steg är klara kan du godkänna projektet och generera ett PDF-protokoll med bilder, noteringar och signaturer.' },
]

export default function InfoKort({ namn }: { namn: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-700 text-lg">ℹ</span>
          <span className="text-sm font-medium text-blue-900">
            Så här fungerar Säker BRF
          </span>
        </div>
        <span className="text-blue-400 text-xs">{open ? '▲ Dölj' : '▼ Visa'}</span>
      </button>

      {open && (
        <div className="border-t border-blue-200 px-4 py-4">
          {namn && (
            <p className="text-sm text-blue-800 font-medium mb-3">Välkommen, {namn}!</p>
          )}
          <div className="space-y-3">
            {steg.map(s => (
              <div key={s.nr} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {s.nr}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.rubrik}</p>
                  <p className="text-sm text-gray-600">{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-white border border-blue-100 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Statusar</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Ej påbörjad</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Klar</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Godkänd</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Underkänd</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
