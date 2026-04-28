import {
  Activity,
  CalendarPlus,
  CreditCard,
  FileSignature,
  Home,
  Languages,
  Microscope,
  Moon,
  Pill,
  Settings,
  Stethoscope,
  Sun,
  UserPlus,
  Users,
} from 'lucide-react'
import { registerCommands, type CommandAction } from './commandRegistry'

/**
 * Registers the global command-palette catalogue. Called once from
 * `main.tsx` on app boot. Modules can append more later via
 * `registerCommand` from anywhere — HMR-safe (idempotent by id).
 *
 * Sections used (kept stable for consistent grouping in the palette):
 *   "Create"     → actions that open a new-resource dialog or wizard.
 *   "Navigate"   → actions that route the user to a high-traffic page.
 *   "Toggle"     → preferences and per-session toggles.
 *   "Workspace"  → tenant-level concerns (settings, locale, billing).
 *   "Clinical"   → medical-vertical actions; gated by `verticals: ['medical']`.
 *   "Patients"   → dental-vertical patient actions.
 *   "School"     → school-vertical actions.
 */
const COMMANDS: CommandAction[] = [
  /* Create */
  {
    id: 'cmd.create.contact',
    section: 'Create',
    label: 'New contact',
    shortcut: 'C',
    icon: UserPlus,
    permission: 'crm:write',
    keywords: ['lead', 'customer', 'add'],
    run: ({ navigate }) => navigate('/app/crm/contacts'),
  },
  {
    id: 'cmd.create.appointment',
    section: 'Create',
    label: 'New appointment',
    shortcut: 'A',
    icon: CalendarPlus,
    permission: 'scheduling:write',
    keywords: ['book', 'visit', 'slot'],
    run: ({ navigate }) => navigate('/app/scheduling'),
  },
  {
    id: 'cmd.create.invoice',
    section: 'Create',
    label: 'New invoice',
    shortcut: 'I',
    icon: CreditCard,
    permission: 'billing:write',
    keywords: ['bill', 'charge'],
    run: ({ navigate }) => navigate('/app/billing/invoices'),
  },
  {
    id: 'cmd.create.patient',
    section: 'Patients',
    label: 'Admit dental patient',
    icon: UserPlus,
    permission: 'dental:write',
    verticals: ['dental'],
    run: ({ navigate }) => navigate('/app/dental/patients'),
  },
  {
    id: 'cmd.create.student',
    section: 'School',
    label: 'Admit student',
    icon: UserPlus,
    permission: 'school:write',
    verticals: ['school'],
    run: ({ navigate }) => navigate('/app/school/students'),
  },
  {
    id: 'cmd.create.medical-patient',
    section: 'Clinical',
    label: 'New patient',
    icon: UserPlus,
    permission: 'medical:write',
    verticals: ['medical'],
    run: ({ navigate }) => navigate('/app/medical/patients'),
  },

  /* Navigate */
  {
    id: 'cmd.nav.dashboard',
    section: 'Navigate',
    label: 'Dashboard',
    shortcut: 'G then D',
    icon: Home,
    keywords: ['home'],
    run: ({ navigate }) => navigate('/app/dashboard'),
  },
  {
    id: 'cmd.nav.crm',
    section: 'Navigate',
    label: 'Contacts',
    shortcut: 'G then C',
    icon: Users,
    permission: 'crm:read',
    run: ({ navigate }) => navigate('/app/crm'),
  },
  {
    id: 'cmd.nav.schedule',
    section: 'Navigate',
    label: 'Schedule',
    shortcut: 'G then S',
    icon: CalendarPlus,
    permission: 'scheduling:read',
    run: ({ navigate }) => navigate('/app/scheduling'),
  },
  {
    id: 'cmd.nav.lab-inbox',
    section: 'Clinical',
    label: 'Lab inbox',
    shortcut: 'G then L',
    icon: Microscope,
    verticals: ['medical'],
    permission: 'medical:results:sign',
    run: ({ navigate }) => navigate('/app/medical/labs/inbox'),
  },
  {
    id: 'cmd.nav.refill-queue',
    section: 'Clinical',
    label: 'Refill queue',
    icon: Pill,
    verticals: ['medical'],
    permission: 'medical:rx:write',
    run: ({ navigate }) => navigate('/app/medical/rx/refills'),
  },
  {
    id: 'cmd.nav.front-desk',
    section: 'Clinical',
    label: 'Front desk',
    icon: Stethoscope,
    verticals: ['medical'],
    permission: 'medical:read',
    run: ({ navigate }) => navigate('/app/medical/front-desk'),
  },
  {
    id: 'cmd.nav.activity',
    section: 'Navigate',
    label: 'Activity',
    icon: Activity,
    permission: 'audit:view',
    run: ({ navigate }) => navigate('/app/audit'),
  },

  /* Workspace */
  {
    id: 'cmd.ws.settings',
    section: 'Workspace',
    label: 'Settings',
    shortcut: 'G then ,',
    icon: Settings,
    permission: 'settings:manage',
    run: ({ navigate }) => navigate('/app/settings'),
  },
  {
    id: 'cmd.ws.preferences',
    section: 'Workspace',
    label: 'Preferences (per-module)',
    icon: Settings,
    run: ({ navigate }) => navigate('/app/settings/preferences'),
  },
  {
    id: 'cmd.ws.sign-clinical',
    section: 'Clinical',
    label: 'Clinical-locale settings',
    icon: FileSignature,
    verticals: ['medical'],
    permission: 'settings:manage',
    run: ({ navigate }) => navigate('/app/medical/admin/clinical-locale'),
  },

  /* Toggles — wired by the palette consumer to the right Zustand stores at run time. */
  {
    id: 'cmd.toggle.theme.light',
    section: 'Toggle',
    label: 'Switch to light theme',
    icon: Sun,
    keywords: ['mode'],
    run: () => {
      document.documentElement.classList.remove('dark')
      try {
        localStorage.setItem('bos.theme', 'light')
      } catch {
        /* ignore */
      }
    },
  },
  {
    id: 'cmd.toggle.theme.dark',
    section: 'Toggle',
    label: 'Switch to dark theme',
    icon: Moon,
    keywords: ['mode'],
    run: () => {
      document.documentElement.classList.add('dark')
      try {
        localStorage.setItem('bos.theme', 'dark')
      } catch {
        /* ignore */
      }
    },
  },
  {
    id: 'cmd.toggle.locale.en',
    section: 'Toggle',
    label: 'Switch to English',
    icon: Languages,
    run: () => {
      try {
        localStorage.setItem('bos.locale', 'en')
        location.reload()
      } catch {
        /* ignore */
      }
    },
  },
  {
    id: 'cmd.toggle.locale.ar',
    section: 'Toggle',
    label: 'Switch to العربية',
    icon: Languages,
    run: () => {
      try {
        localStorage.setItem('bos.locale', 'ar')
        location.reload()
      } catch {
        /* ignore */
      }
    },
  },
]

let booted = false
export function bootstrapCommands(): void {
  if (booted) return
  registerCommands(COMMANDS)
  booted = true
}
