import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MallarAdmin from '@/components/MallarAdmin'

export default async function MallarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('roll')
    .eq('id', user!.id)
    .single()
  const profile = profileRow as { roll: string } | null

  if (profile?.roll !== 'ordforande') redirect('/projekt')

  const { data: mallar } = await supabase
    .from('mallar')
    .select('id, namn, beskrivning')
    .order('namn')

  const { data: steg } = await supabase
    .from('mall_steg')
    .select('id, mall_id, ordning, rubrik, instruktion, branschregler, mall_steg_delar(id, rubrik, ordning)')
    .order('ordning')

  return (
    <MallarAdmin
      mallar={(mallar ?? []) as Array<{ id: string; namn: string; beskrivning: string | null }>}
      steg={(steg ?? []) as Array<{ id: string; mall_id: string; ordning: number; rubrik: string; instruktion: string; branschregler: string | null; mall_steg_delar: Array<{ id: string; rubrik: string; ordning: number }> }>}
    />
  )
}
