'use client'

import { ChevronLeft, FolderKanban, Home, ReceiptText, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useSidebar } from './SidebarProvider'

const items = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/billing', label: 'Billing', icon: ReceiptText },
  { href: '/settings', label: 'Settings', icon: Settings }
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar()

  // close drawer on route change (mobile)
  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  const width = collapsed ? 'w-16' : 'w-60'
  return (
    <>
      {/* Desktop / large screens */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 ${width} border-r bg-white transition-all duration-200`}
      >
        <div className="h-14 flex items-center justify-between px-3 border-b">
          <div className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
            {collapsed ? 'DC' : 'DevCRM'}
          </div>
          <button
            className="p-1 rounded hover:bg-slate-100"
            onClick={toggleCollapsed}
            aria-label="Collapse"
            title="Collapse"
          >
            <ChevronLeft
              size={18}
              className={`${collapsed ? 'rotate-180' : ''} transition-transform`}
            />
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + '/')
            const Icon = it.icon
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 ${
                  active ? 'bg-slate-100 font-medium' : ''
                }`}
                title={collapsed ? it.label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span className="overflow-hidden text-ellipsis">{it.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white border-r shadow-xl">
            <div className="h-14 flex items-center justify-between px-3 border-b">
              <div className="font-semibold">DevCRM</div>
              <button
                className="p-1 rounded hover:bg-slate-100"
                onClick={closeMobile}
                aria-label="Close"
              >
                {/* ton icône */}
              </button>
            </div>
            <nav className="p-2 space-y-1">
              {items.map((it) => {
                const Icon = it.icon
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-50"
                  >
                    <Icon size={18} />
                    <span>{it.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
