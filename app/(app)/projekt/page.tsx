import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusLabel: Record<string, string> = {
  pagaende: 'Pågående',
  klar: 'Klar för godkännande',
  godkand: 'Godkänd',
  underkand: 'Underkänd',
}

const statusColor: Record<string, string> = {
  pagaende: 'bg-amber-100 text-amber-800',
  klar: 'bg-blue-100 text-blue-700',
  godkand: 'bg-green-100 text-green-700',
  underkand: 'bg-red-100 text-red-700',
}

export default async function ProjektPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projektRows } = await supabase
    .from('projekt')
    .select('id, brf_adress, status, skapad_tid, mallar(namn)')
    .eq('skapad_av', user!.id)
    .order('skapad_tid', { ascending: false })

  const projekt = (projektRows ?? []) as Array<{
    id: string; brf_adress: string; status: string; skapad_tid: string
    mallar: { namn: string } | null
  }>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mina projekt</h1>
        <Link href="/projekt/ny"
          className="bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">
          + Nytt projekt
        </Link>
      </div>

      {projekt.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900 mb-1">Inga projekt ännu</p>
          <p className="text-sm text-gray-400 mb-5">Skapa ditt första projekt för att komma igång.</p>
          <Link href="/projekt/ny"
            className="inline-block bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
            Skapa projekt
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projekt.map((p) => (
            <Link key={p.id} href={`/projekt/${p.id}`}>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-blue-200 hover:shadow-md transition-all shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.brf_adress}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{p.mallar?.namn}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${statusColor[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[p.status] ?? p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">
                    {new Date(p.skapad_tid).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <span className="text-xs text-blue-500 font-medium">Öppna →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
