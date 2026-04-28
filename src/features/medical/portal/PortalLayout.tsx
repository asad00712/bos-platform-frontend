import { NavLink, Outlet } from 'react-router'
import {
  Building2,
  CalendarDays,
  CreditCard,
  Microscope,
  MessageSquareText,
  Pill,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { useTenant } from '@/shared/hooks/useTenant'
import { cn } from '@/shared/lib/utils'

/**
 * Patient-facing portal shell. Lives under `/portal` so the URL is
 * obviously distinct from clinician views and so the layout can stay
 * lean — no chart sidebar, no audit affordances, no provider tools.
 *
 * Tenant identity (logo + name) anchors the header so a white-labeled
 * tenant feels coherent. Authenticated patient gets a profile menu.
 */

type Item = {
  to: string
  label: string
  icon: LucideIcon
  /** Optional unread / due badge. */
  count?: number
}

const NAV: Item[] = [
  { to: '/portal', label: 'Home', icon: User },
  { to: '/portal/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/portal/messages', label: 'Messages', icon: MessageSquareText },
  { to: '/portal/results', label: 'Results', icon: Microscope },
  { to: '/portal/medications', label: 'Medications', icon: Pill },
  { to: '/portal/billing', label: 'Billing', icon: CreditCard },
]

export function PortalLayout() {
  const { tenant } = useTenant()

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-lg items-center gap-3 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <p className="text-sm font-semibold">{tenant.name}</p>
            <p className="text-xs text-muted-foreground">Patient portal</p>
          </div>
          <Badge variant="outline" className="ms-auto hidden gap-1 sm:inline-flex">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            Secure connection
          </Badge>
          <Avatar className="ms-2 size-8">
            <AvatarFallback className="text-xs">PS</AvatarFallback>
          </Avatar>
        </div>
        <nav className="mx-auto w-full max-w-screen-lg overflow-x-auto px-2 pb-2">
          <ul className="flex gap-1">
            {NAV.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/portal'}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive
                          ? 'bg-accent font-semibold text-accent-foreground'
                          : 'text-muted-foreground',
                      )
                    }
                  >
                    <Icon className="size-4" />
                    {item.label}
                    {item.count ? (
                      <span className="ms-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {item.count}
                      </span>
                    ) : null}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-screen-lg space-y-6 p-4 md:p-6">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-screen-lg px-4 pb-6 pt-2 text-center text-[11px] text-muted-foreground">
        Need help? Call your clinic for non-urgent issues.{' '}
        <span className="font-medium text-rose-600 dark:text-rose-400">
          For emergencies, call your local emergency number immediately.
        </span>
        <div className="mt-2 flex justify-center gap-4">
          <Button variant="link" size="sm" className="h-auto px-0">
            Privacy
          </Button>
          <Button variant="link" size="sm" className="h-auto px-0">
            Terms
          </Button>
          <Button variant="link" size="sm" className="h-auto px-0">
            Sign out
          </Button>
        </div>
      </footer>
    </div>
  )
}
