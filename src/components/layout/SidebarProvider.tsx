'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Ctx = {
  collapsed: boolean
  mobileOpen: boolean
  setCollapsed: (v: boolean) => void
  toggleCollapsed: () => void
  openMobile: () => void
  closeMobile: () => void
}
const SidebarCtx = createContext<Ctx | null>(null)

const LS_KEY = 'sidebar_collapsed'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(LS_KEY)
    if (saved != null) setCollapsed(saved === '1')
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(LS_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  const value: Ctx = {
    collapsed,
    mobileOpen,
    setCollapsed,
    toggleCollapsed: () => setCollapsed((v) => !v),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false)
  }

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>
}

export function useSidebar() {
  const ctx = useContext(SidebarCtx)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
