'use client'
import { clearAuth, getAuth } from '@/lib/auth'
import { Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Breadcrumbs, { type Crumb } from './BreadCrumbs'
import { useSidebar } from './SidebarProvider'

export default function AppHeader({ crumbs }: { crumbs?: Crumb[] }) {
  const { openMobile } = useSidebar()
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()
    setUid(auth.userId || null)
  }, [])

  return (
    <header className="h-14 border-b bg-white sticky top-0 z-30">
      <div className="h-full px-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden p-2 rounded hover:bg-slate-100"
            onClick={openMobile}
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          {crumbs && <Breadcrumbs items={crumbs} />}
        </div>
        <div className="hidden md:flex items-center gap-2 w-[34rem]">
          <input
            className="flex-1 h-9 px-3 rounded-lg border bg-slate-50 focus:bg-white"
            placeholder="Search (⌘K)…"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* org switcher: simple label pour l'instant */}
          <span className="text-sm text-slate-600">Org</span>
          <div
            className="w-8 h-8 rounded-full bg-slate-200"
            title={uid || 'You'}
            suppressHydrationWarning
          />
          <button
            className="text-sm px-2 py-1 rounded border hover:bg-slate-50"
            onClick={() => {
              clearAuth()
              router.push('/login')
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
