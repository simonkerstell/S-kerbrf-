import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('namn')
    .eq('id', user.id)
    .single()
  const profile = profileRow as { namn: string } | null

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar namn={profile?.namn ?? ''} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
