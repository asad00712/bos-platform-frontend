import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  Menu,
  Plus,
  Search,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import { NavLink, Outlet } from 'react-router'
import { navigationGroups } from '../config/navigation'
import { useSessionStore } from '../stores/session.store'
import { getVerticalTheme } from '../themes/verticals'
import type { Permission } from '../types/tenant'

export function AppShell() {
  const tenant = useSessionStore((state) => state.tenant)
  const user = useSessionStore((state) => state.user)
  const theme = getVerticalTheme(tenant.vertical)

  return (
    <div
      className="app-shell"
      style={
        {
          '--tenant-accent': theme.accent,
          '--tenant-accent-soft': theme.accentSoft,
        } as CSSProperties
      }
    >
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-block">
          <div className="brand-mark">B</div>
          <div>
            <p className="eyebrow">BOS</p>
            <strong>Operating System</strong>
          </div>
        </div>

        <button className="tenant-switcher" type="button">
          <Building2 size={18} aria-hidden="true" />
          <span>
            <strong>{tenant.name}</strong>
            <small>{theme.name} · {tenant.plan}</small>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>

        <nav className="nav-groups">
          {navigationGroups.map((group) => (
            <section className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items
                .filter((item) => canAccess(tenant.permissions, item.permission))
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink className="nav-link" key={item.path} to={item.path}>
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
            </section>
          ))}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" aria-label="Open navigation">
            <Menu size={20} aria-hidden="true" />
          </button>
          <label className="global-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder={`Search ${theme.terminology.customers}, invoices, visits`}
            />
          </label>
          <div className="topbar-actions">
            <button className="command-button" type="button">
              <Plus size={17} aria-hidden="true" />
              <span>Quick Create</span>
            </button>
            <button className="icon-button" type="button" aria-label="Help">
              <CircleHelp size={19} aria-hidden="true" />
            </button>
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={19} aria-hidden="true" />
            </button>
            <button className="profile-button" type="button">
              <span>{getInitials(user?.firstName, user?.lastName)}</span>
              <small>{user?.firstName ?? 'Owner'}</small>
            </button>
          </div>
        </header>

        <main className="page-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function canAccess(
  permissions: Permission[],
  requiredPermission: Permission | undefined,
): boolean {
  return !requiredPermission || permissions.includes(requiredPermission)
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.[0] ?? 'B'
  const last = lastName?.[0] ?? 'O'
  return `${first}${last}`.toUpperCase()
}
