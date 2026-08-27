'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NavBar({ namn }: { namn: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function logOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/projekt" className="font-bold text-lg tracking-tight">Säker BRF</Link>
        <Link href="/projekt" className="text-sm text-blue-200 hover:text-white transition-colors">Projekt</Link>
        <Link href="/admin/mallar" className="text-sm text-blue-200 hover:text-white transition-colors">Mallar</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-blue-300">
          {namn} · Ordförande
        </span>
        <button
          onClick={logOut}
          className="text-sm bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Logga ut
        </button>
      </div>
    </nav>
  )
}
