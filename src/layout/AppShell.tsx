import { Outlet } from 'react-router'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { AppSidebar } from './Sidebar/AppSidebar'
import { Topbar } from './Topbar/Topbar'
import { useUiStore } from '@/stores/ui.store'

export function AppShell() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed)

  return (
    <SidebarProvider
      open={!sidebarCollapsed}
      onOpenChange={(open) => setSidebarCollapsed(!open)}
    >
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
