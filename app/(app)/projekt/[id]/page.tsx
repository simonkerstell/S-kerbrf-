import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProjektVy from '@/components/ProjektVy'
import type { StegStatus } from '@/lib/supabase/types'

export default async function ProjektDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('namn')
    .eq('id', user!.id)
    .single()
  const profile = profileRow as { namn: string } | null

  const { data: projektRow } = await supabase
    .from('projekt')
    .select('id, brf_adress, status, skapad_tid, mallar(namn)')
    .eq('id', id)
    .single()

  if (!projektRow) notFound()

  const projekt = projektRow as {
    id: string
    brf_adress: string
    status: string
    skapad_tid: string
    mallar: { namn: string } | null
  }

  const { data: stegRows } = await supabase
    .from('projekt_steg')
    .select('id, projekt_id, mall_steg_id, bild_url, signerad_av, signerad_tid, status, kommentar, noteringar, uppdaterad_tid, mall_steg(ordning, rubrik, instruktion)')
    .eq('projekt_id', id)

  const stegIds = (stegRows ?? []).map(s => (s as { id: string }).id)
  const { data: bilderRows } = stegIds.length > 0
    ? await supabase.from('projekt_steg_bilder').select('id, steg_id, url, skapad_tid').in('steg_id', stegIds).order('skapad_tid', { ascending: true })
    : { data: [] }

  const bilderBySteg: Record<string, { id: string; url: string }[]> = {}
  for (const b of (bilderRows ?? []) as Array<{ id: string; steg_id: string; url: string }>) {
    if (!bilderBySteg[b.steg_id]) bilderBySteg[b.steg_id] = []
    bilderBySteg[b.steg_id].push({ id: b.id, url: b.url })
  }

  const steg = (stegRows ?? []).map(s => ({
    ...(s as {
      id: string; projekt_id: string; mall_steg_id: string; bild_url: string | null
      signerad_av: string | null; signerad_tid: string | null; status: StegStatus
      kommentar: string | null; noteringar: string | null; uppdaterad_tid: string
      mall_steg: { ordning: number; rubrik: string; instruktion: string } | null
    }),
    bilder: bilderBySteg[(s as { id: string }).id] ?? [],
  }))

  const { data: materialRows } = stegIds.length > 0
    ? await supabase.from('steg_material').select('id, steg_id, material, mangd, enhet').in('steg_id', stegIds).order('skapad_tid', { ascending: true })
    : { data: [] }

  const materialBySteg: Record<string, { id: string; material: string; mangd: number | null; enhet: string | null }[]> = {}
  for (const m of (materialRows ?? []) as Array<{ id: string; steg_id: string; material: string; mangd: number | null; enhet: string | null }>) {
    if (!materialBySteg[m.steg_id]) materialBySteg[m.steg_id] = []
    materialBySteg[m.steg_id].push({ id: m.id, material: m.material, mangd: m.mangd, enhet: m.enhet })
  }

  const stegMedMaterial = steg.map(s => ({ ...s, material: materialBySteg[s.id] ?? [] }))

  const { data: personalliggarRows } = await supabase
    .from('personalliggare')
    .select('id, datum, bekraftad_av, bekraftad_tid, id06_register(id06_nr, namn, foretag, cert_el, cert_vvs, cert_vatten, cert_tatskikt, cert_gas, cert_ovrigt)')
    .eq('projekt_id', id)
    .order('datum', { ascending: false })

  const personalliggare = (personalliggarRows ?? []).map(row => {
    const r = row as Record<string, unknown>
    const reg = (r.id06_register as Record<string, unknown>) ?? {}
    return {
      id: r.id as string,
      datum: r.datum as string,
      bekraftad_av: (r.bekraftad_av as string | null) ?? null,
      bekraftad_tid: (r.bekraftad_tid as string | null) ?? null,
      id06_nr: (reg.id06_nr as string | null) ?? null,
      namn: (reg.namn as string) ?? '',
      foretag: (reg.foretag as string | null) ?? null,
      cert_el: (reg.cert_el as boolean) ?? false,
      cert_vvs: (reg.cert_vvs as boolean) ?? false,
      cert_vatten: (reg.cert_vatten as boolean) ?? false,
      cert_tatskikt: (reg.cert_tatskikt as boolean) ?? false,
      cert_gas: (reg.cert_gas as boolean) ?? false,
      cert_ovrigt: (reg.cert_ovrigt as string | null) ?? null,
    }
  })

  const { data: pdfRow } = await supabase
    .from('pdf_dokument')
    .select('fil_url, skapad_tid')
    .eq('projekt_id', id)
    .order('skapad_tid', { ascending: false })
    .limit(1)
    .maybeSingle()

  const pdf = pdfRow as { fil_url: string; skapad_tid: string } | null

  return (
    <ProjektVy
      projekt={{
        id: projekt.id,
        brf_adress: projekt.brf_adress,
        status: projekt.status,
        skapad_tid: projekt.skapad_tid,
        mall_namn: projekt.mallar?.namn ?? '',
      }}
      steg={stegMedMaterial}
      personalliggare={personalliggare}
      userName={profile?.namn ?? ''}
      pdfUrl={pdf?.fil_url ?? null}
    />
  )
}
