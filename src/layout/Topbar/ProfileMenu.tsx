import { LogOut, User as UserIcon, Settings as SettingsIcon, ChevronsUpDown } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar'

import { useSessionStore } from '@/stores/session.store'
import { authApi } from '@/api/auth.api'
import { routes } from '@/routes/routeMap'

type Props = { variant?: 'topbar' | 'sidebar' }

export function ProfileMenu({ variant = 'topbar' }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSessionStore((s) => s.user)
  const clearSession = useSessionStore((s) => s.clearSession)

  const initials = getInitials(user?.firstName, user?.lastName, user?.email)
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'Guest'

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      /* ignore — clear local session regardless */
    }
    clearSession()
    navigate(routes.login())
  }

  const trigger =
    variant === 'sidebar' ? (
      <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
        <Avatar className="size-8 rounded-lg">
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-start text-sm leading-tight">
          <span className="truncate font-medium">{displayName}</span>
          <span className="truncate text-xs text-muted-foreground">
            {user?.email}
          </span>
        </div>
        <ChevronsUpDown className="ms-auto size-4" />
      </SidebarMenuButton>
    ) : (
      <Button variant="ghost" className="h-9 gap-2 px-2">
        <Avatar className="size-7">
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={displayName} />
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
      </Button>
    )

  const content = (
    <DropdownMenuContent align="end" className="min-w-56">
      <DropdownMenuLabel className="font-normal">
        <div className="grid gap-0.5 text-sm">
          <span className="font-medium">{displayName}</span>
          {user?.email ? (
            <span className="text-xs text-muted-foreground">{user.email}</span>
          ) : null}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate(routes.app.profile.root())}>
        <UserIcon /> {t('profile.myProfile')}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate(routes.app.settings.root())}>
        <SettingsIcon /> {t('profile.settings')}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout}>
        <LogOut /> {t('profile.logout')}
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  if (variant === 'sidebar') {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            {content}
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      {content}
    </DropdownMenu>
  )
}

function getInitials(first?: string | null, last?: string | null, email?: string | null): string {
  const f = (first ?? '').trim()
  const l = (last ?? '').trim()
  if (f || l) return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase() || '·'
  if (email) {
    const local = email.split('@')[0]
    return local.slice(0, 2).toUpperCase()
  }
  return '··'
}
