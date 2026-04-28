import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareText,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smile,
  Sparkles,
  Stethoscope,
  UsersRound,
  Utensils,
  Wallet,
  Workflow,
  Dumbbell,
} from 'lucide-react'

import type { NavigationGroup, NavigationItem } from '@/types/navigation'
import type { Permission, VerticalType } from '@/types/tenant'
import { routes } from '@/routes/routeMap'

const VERTICAL_NAV: Record<VerticalType, { i18nKey: string; path: string; icon: typeof LayoutDashboard }> = {
  dental: { i18nKey: 'navigation.dentalWorkspace', path: routes.app.dental.root(), icon: Smile },
  school: { i18nKey: 'navigation.schoolWorkspace', path: routes.app.school.root(), icon: GraduationCap },
  medical: { i18nKey: 'navigation.medicalWorkspace', path: routes.app.medical.root(), icon: Stethoscope },
  law: { i18nKey: 'navigation.lawWorkspace', path: '/app/law', icon: Scale },
  restaurant: { i18nKey: 'navigation.restaurantWorkspace', path: '/app/restaurant', icon: Utensils },
  gym: { i18nKey: 'navigation.gymWorkspace', path: '/app/gym', icon: Dumbbell },
  salon: { i18nKey: 'navigation.salonWorkspace', path: '/app/salon', icon: Sparkles },
  retail: { i18nKey: 'navigation.retailWorkspace', path: '/app/retail', icon: ShoppingBag },
}

/**
 * Builds the sidebar navigation for the active vertical. Items are
 * filtered by RBAC at render time inside the Sidebar component.
 */
export function buildNavigation(vertical: VerticalType): NavigationGroup[] {
  const verticalEntry = VERTICAL_NAV[vertical]

  const groups: NavigationGroup[] = [
    {
      i18nKey: 'navigation.groups.command',
      items: [
        {
          i18nKey: 'navigation.dashboard',
          path: routes.app.dashboard(),
          icon: LayoutDashboard,
          permission: 'dashboard:view',
        },
        {
          i18nKey: verticalEntry.i18nKey,
          path: verticalEntry.path,
          icon: verticalEntry.icon,
        },
      ],
    },
    {
      i18nKey: 'navigation.groups.modules',
      items: [
        {
          i18nKey: 'navigation.crm',
          path: routes.app.crm.root(),
          icon: UsersRound,
          permission: 'crm:read',
        },
        {
          i18nKey: 'navigation.scheduling',
          path: routes.app.scheduling.root(),
          icon: CalendarDays,
          permission: 'scheduling:read',
        },
        {
          i18nKey: 'navigation.billing',
          path: routes.app.billing.root(),
          icon: CreditCard,
          permission: 'billing:read',
        },
        {
          i18nKey: 'navigation.hrm',
          path: routes.app.hrm.root(),
          icon: ClipboardList,
          permission: 'hrm:read',
        },
        {
          i18nKey: 'navigation.documents',
          path: routes.app.documents(),
          icon: FileText,
          permission: 'documents:read',
        },
        {
          i18nKey: 'navigation.communication',
          path: routes.app.communication(),
          icon: MessageSquareText,
          permission: 'communication:read',
        },
        {
          i18nKey: 'navigation.automation',
          path: routes.app.automation(),
          icon: Workflow,
          permission: 'automation:read',
          feature: 'automation_builder',
        },
      ],
    },
    {
      i18nKey: 'navigation.groups.intelligence',
      advancedOnly: true,
      items: [
        {
          i18nKey: 'navigation.reports',
          path: routes.app.reports(),
          icon: BarChart3,
          permission: 'reports:read',
        },
        {
          i18nKey: 'navigation.audit',
          path: routes.app.audit(),
          icon: ShieldCheck,
          permission: 'audit:view',
          feature: 'audit_log',
        },
      ],
    },
    {
      i18nKey: 'navigation.groups.workspace',
      items: [
        {
          i18nKey: 'navigation.notifications',
          path: routes.app.notifications(),
          icon: Bell,
        },
        {
          i18nKey: 'navigation.support',
          path: routes.app.support(),
          icon: LifeBuoy,
        },
        {
          i18nKey: 'navigation.settings',
          path: routes.app.settings.root(),
          icon: Settings,
          permission: 'settings:manage',
        },
      ],
    },
  ]

  return groups.map((group) => ({
    ...group,
    items: group.items.filter(Boolean) as NavigationItem[],
  }))
}

type QuickCreateAction = {
  i18nKey: string
  icon: typeof Wallet
  permission: Permission
  path: string
}

/** Quick-create menu source. */
export const quickCreateActions: QuickCreateAction[] = [
  { i18nKey: 'quickCreate.contact', icon: UsersRound, permission: 'crm:write', path: routes.app.crm.contactNew() },
  { i18nKey: 'quickCreate.appointment', icon: CalendarDays, permission: 'scheduling:write', path: routes.app.scheduling.appointmentNew() },
  { i18nKey: 'quickCreate.invoice', icon: Wallet, permission: 'billing:write', path: routes.app.billing.invoiceNew() },
  { i18nKey: 'quickCreate.task', icon: Bot, permission: 'automation:write', path: routes.app.automation() },
]
