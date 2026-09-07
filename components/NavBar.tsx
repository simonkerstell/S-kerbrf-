'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NavBar({ namn }: { namn: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function logOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link href={href}
        className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-blue-300 hover:text-white'}`}>
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-blue-950 text-white px-5 py-0 shadow-lg sticky top-0 z-50">
      <div className="max-w-3xl mx-auto flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/projekt">
            <Image src="/logo.png" alt="Säker BRF" width={80} height={40} className="object-contain" priority />
          </Link>
          <div className="hidden sm:flex items-center gap-5">
            {navLink('/projekt', 'Projekt')}
            {navLink('/admin/mallar', 'Mallar')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-blue-400 font-medium">{namn}</span>
          <button onClick={logOut}
            className="text-xs bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors font-medium">
            Logga ut
          </button>
        </div>
      </div>
      {/* Mobil-navigation */}
      <div className="sm:hidden flex border-t border-blue-900">
        <Link href="/projekt" className={`flex-1 text-center py-2.5 text-xs font-medium transition-colors ${pathname.startsWith('/projekt') ? 'text-white border-b-2 border-blue-400' : 'text-blue-400'}`}>
          Projekt
        </Link>
        <Link href="/admin/mallar" className={`flex-1 text-center py-2.5 text-xs font-medium transition-colors ${pathname.startsWith('/admin') ? 'text-white border-b-2 border-blue-400' : 'text-blue-400'}`}>
          Mallar
        </Link>
      </div>
    </nav>
  )
}
