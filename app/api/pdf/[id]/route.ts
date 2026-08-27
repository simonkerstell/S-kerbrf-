import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateProjektPDF } from '@/lib/pdf'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: projektRow } = await supabase
    .from('projekt')
    .select('id, brf_adress, status, skapad_tid, mallar(namn)')
    .eq('id', id)
    .single()

  if (!projektRow) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const projekt = projektRow as { id: string; brf_adress: string; mallar: { namn: string } | null }

  const { data: stegRows } = await supabase
    .from('projekt_steg')
    .select('bild_url, signerad_av, signerad_tid, status, kommentar, noteringar, mall_steg(ordning, rubrik, instruktion)')
    .eq('projekt_id', id)

  if (!stegRows) return NextResponse.json({ error: 'No steps' }, { status: 400 })

  type StegRow = {
    bild_url: string | null
    signerad_av: string | null
    signerad_tid: string | null
    status: string
    kommentar: string | null
    noteringar: string | null
    mall_steg: { ordning: number; rubrik: string; instruktion: string } | null
  }

  const steg = (stegRows as StegRow[])
    .map(s => ({
      ordning: s.mall_steg?.ordning ?? 0,
      rubrik: s.mall_steg?.rubrik ?? '',
      instruktion: s.mall_steg?.instruktion ?? '',
      bild_url: s.bild_url,
      signerad_av: s.signerad_av,
      signerad_tid: s.signerad_tid,
      status: s.status,
      kommentar: s.kommentar,
      noteringar: s.noteringar,
    }))
    .sort((a, b) => a.ordning - b.ordning)

  const pdfBytes = await generateProjektPDF({
    brf_adress: projekt.brf_adress,
    mall_namn: projekt.mallar?.namn ?? '',
    skapad_tid: new Date().toISOString(),
    steg,
    imageLoader: async (url: string) => {
      try {
        const res = await fetch(url)
        if (!res.ok) return null
        return new Uint8Array(await res.arrayBuffer())
      } catch {
        return null
      }
    },
  })

  const filnamn = `${id}/protokoll-${Date.now()}.pdf`
  const { error: uploadErr } = await supabase.storage
    .from('pdf')
    .upload(filnamn, pdfBytes, { contentType: 'application/pdf', upsert: true })

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('pdf').getPublicUrl(filnamn)

  await supabase.from('pdf_dokument').insert({ projekt_id: id, fil_url: publicUrl } as never)
  await supabase.from('projekt').update({ status: 'klar' } as never).eq('id', id)

  return NextResponse.json({ url: publicUrl })
}
