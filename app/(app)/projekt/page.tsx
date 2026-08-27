import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import InfoKort from '@/components/InfoKort'

const statusLabel: Record<string, string> = {
  pagaende: 'Pågående',
  klar: 'Klar för godkännande',
  godkand: 'Godkänd',
  underkand: 'Underkänd',
}

const statusColor: Record<string, string> = {
  pagaende: 'bg-yellow-100 text-yellow-800',
  klar: 'bg-blue-100 text-blue-800',
  godkand: 'bg-green-100 text-green-800',
  underkand: 'bg-red-100 text-red-800',
}

export default async function ProjektPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('namn')
    .eq('id', user!.id)
    .single()
  const profile = profileRow as { namn: string } | null

  const { data: projektRows } = await supabase
    .from('projekt')
    .select('id, brf_adress, status, skapad_tid, mallar(namn)')
    .eq('skapad_av', user!.id)
    .order('skapad_tid', { ascending: false })

  const projekt = (projektRows ?? []) as Array<{
    id: string
    brf_adress: string
    status: string
    skapad_tid: string
    mallar: { namn: string } | null
  }>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mina projekt</h1>
        <Link
          href="/projekt/ny"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          + Nytt projekt
        </Link>
      </div>

      <InfoKort namn={profile?.namn ?? ''} />

      {projekt.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Inga projekt ännu.</p>
          <Link href="/projekt/ny" className="mt-3 inline-block text-blue-700 underline">
            Skapa ditt första projekt
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projekt.map((p) => (
            <Link key={p.id} href={`/projekt/${p.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{p.brf_adress}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{p.mallar?.namn}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor[p.status] ?? ''}`}>
                    {statusLabel[p.status] ?? p.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Skapad {new Date(p.skapad_tid).toLocaleDateString('sv-SE')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
