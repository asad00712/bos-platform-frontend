import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  HeartPulse,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldCheck,
  UsersRound,
  Workflow,
} from 'lucide-react'
import type { NavigationGroup } from '../types/navigation'

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Command',
    items: [
      {
        label: 'Dashboard',
        path: '/app/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard:view',
      },
      {
        label: 'Clinical Workspace',
        path: '/app/medical',
        icon: HeartPulse,
        permission: 'patients:read',
      },
    ],
  },
  {
    label: 'Core Modules',
    items: [
      {
        label: 'Patients',
        path: '/app/patients',
        icon: UsersRound,
        permission: 'patients:read',
      },
      {
        label: 'Scheduling',
        path: '/app/scheduling',
        icon: CalendarDays,
        permission: 'appointments:read',
      },
      {
        label: 'Billing',
        path: '/app/billing',
        icon: CreditCard,
        permission: 'billing:read',
      },
      {
        label: 'HRM',
        path: '/app/hrm',
        icon: ClipboardList,
        permission: 'hrm:read',
      },
      {
        label: 'Documents',
        path: '/app/documents',
        icon: FileText,
      },
      {
        label: 'Communication',
        path: '/app/communication',
        icon: MessageSquareText,
      },
      {
        label: 'Automation',
        path: '/app/automation',
        icon: Workflow,
      },
    ],
  },
  {
    label: 'Governance',
    items: [
      {
        label: 'Analytics',
        path: '/app/analytics',
        icon: BarChart3,
        permission: 'reports:read',
      },
      {
        label: 'Audit & Access',
        path: '/app/audit',
        icon: ShieldCheck,
      },
      {
        label: 'Settings',
        path: '/app/settings',
        icon: Settings,
        permission: 'settings:manage',
      },
      {
        label: 'System Health',
        path: '/app/health',
        icon: Activity,
      },
    ],
  },
]
