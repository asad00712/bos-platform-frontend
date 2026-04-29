import { NavLink } from 'react-router'
import {
  Building2,
  Database,
  KeyRound,
  Layers,
  Lock,
  Palette,
  Plug,
  Radio,
  ShieldCheck,
  Sliders,
  Sparkles,
  Tag,
  ToggleLeft,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { routes } from '@/routes/routeMap'

type NavEntry = {
  href: string
  label: string
  Icon: LucideIcon
  /** Section grouping label. */
  group: 'workspace' | 'team' | 'data' | 'platform'
}

const ENTRIES: NavEntry[] = [
  { href: routes.app.settings.organization(), label: 'Organization', Icon: Building2, group: 'workspace' },
  { href: routes.app.settings.branches(), label: 'Branches', Icon: Building2, group: 'workspace' },
  { href: routes.app.settings.branding(), label: 'Branding', Icon: Palette, group: 'workspace' },
  { href: routes.app.settings.staff(), label: 'Staff', Icon: Users, group: 'team' },
  { href: routes.app.settings.roles(), label: 'Roles & permissions', Icon: ShieldCheck, group: 'team' },
  { href: routes.app.settings.tags(), label: 'Tags', Icon: Tag, group: 'data' },
  { href: routes.app.settings.sources(), label: 'Contact sources', Icon: Radio, group: 'data' },
  { href: routes.app.settings.customFields(), label: 'Custom fields', Icon: Sparkles, group: 'data' },
  { href: routes.app.settings.billing(), label: 'Plan & billing', Icon: Wallet, group: 'workspace' },
  { href: '/app/settings/preferences', label: 'Preferences', Icon: Sliders, group: 'workspace' },
  { href: routes.app.settings.integrations(), label: 'Integrations', Icon: Plug, group: 'platform' },
  { href: '/app/settings/api-keys', label: 'API & webhooks', Icon: KeyRound, group: 'platform' },
  { href: '/app/settings/feature-flags', label: 'Feature flags', Icon: ToggleLeft, group: 'platform' },
  { href: routes.app.settings.security(), label: 'Security', Icon: Lock, group: 'team' },
  { href: '/app/settings/data', label: 'Data', Icon: Database, group: 'platform' },
]

const GROUPS: { id: NavEntry['group']; label: string }[] = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'team', label: 'Team' },
  { id: 'data', label: 'CRM data' },
  { id: 'platform', label: 'Platform' },
]

export function SettingsNav() {
  return (
    <nav className="space-y-5">
      {GROUPS.map((g) => {
        const items = ENTRIES.filter((e) => e.group === g.id)
        return (
          <div key={g.id} className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {g.label}
            </p>
            <ul className="space-y-0.5">
              {items.map((e) => {
                const Icon = e.Icon
                return (
                  <li key={e.href}>
                    <NavLink
                      to={e.href}
                      end
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition',
                          'hover:bg-accent/40',
                          isActive && 'bg-accent text-accent-foreground font-medium',
                        )
                      }
                    >
                      <Icon className="size-4" />
                      <span>{e.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
            <Layers className="hidden" />
          </div>
        )
      })}
    </nav>
  )
}
