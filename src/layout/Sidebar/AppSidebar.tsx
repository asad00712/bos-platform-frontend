import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'

import { buildNavigation } from '@/config/navigation'
import { resolveFeatureFlag } from '@/config/features'
import { useTenant } from '@/shared/hooks/useTenant'
import { usePermissions } from '@/shared/hooks/usePermissions'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/shared/ui/sidebar'

import { TenantSwitcher } from './TenantSwitcher'
import { ProfileMenu } from '../Topbar/ProfileMenu'

export function AppSidebar() {
  const { tenant } = useTenant()
  const { has } = usePermissions()
  const { t } = useTranslation()
  const location = useLocation()

  const groups = useMemo(() => buildNavigation(tenant.vertical), [tenant.vertical])

  const showsAdvanced = tenant.caliber !== 'standard'
  const featureCtx = {
    plan: tenant.plan,
    caliber: tenant.caliber,
    size: tenant.size,
    overrides: tenant.featureFlags,
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <TenantSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => {
          if (group.advancedOnly && !showsAdvanced) return null
          if (group.feature && !resolveFeatureFlag(group.feature, featureCtx)) return null

          const visibleItems = group.items.filter((item) => {
            if (!has(item.permission)) return false
            if (item.feature && !resolveFeatureFlag(item.feature, featureCtx))
              return false
            return true
          })
          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={group.i18nKey}>
              <SidebarGroupLabel>{t(group.i18nKey)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`)
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={t(item.i18nKey)}
                        >
                          <NavLink to={item.path}>
                            <Icon />
                            <span>{t(item.i18nKey)}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        <ProfileMenu variant="sidebar" />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
