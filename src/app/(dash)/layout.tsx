import AppHeader from '@/components/layout/AppHeader'
import AppSidebar from '@/components/layout/AppSidebar'
import { SidebarProvider } from '@/components/layout/SidebarProvider'

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex">
        <AppSidebar />
        <div className="flex-1 min-w-0">
          <AppHeader />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
