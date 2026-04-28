import { SidebarTrigger } from '@/shared/ui/sidebar'
import { Separator } from '@/shared/ui/separator'
import { BranchPicker } from '@/features/branches'

import { GlobalSearch } from './GlobalSearch'
import { QuickCreate } from './QuickCreate'
import { NotificationsPopover } from './NotificationsPopover'
import { HelpMenu } from './HelpMenu'
import { SurfaceToggle } from './SurfaceToggle'
import { ThemeToggle } from './ThemeToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { ProfileMenu } from './ProfileMenu'

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="me-2 h-4" />

      <BranchPicker />
      <Separator orientation="vertical" className="mx-1 h-4" />

      <div className="flex flex-1 items-center gap-2">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-1">
        <QuickCreate />
        <NotificationsPopover />
        <HelpMenu />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <SurfaceToggle />
        <ThemeToggle />
        <LocaleSwitcher />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <ProfileMenu />
      </div>
    </header>
  )
}
