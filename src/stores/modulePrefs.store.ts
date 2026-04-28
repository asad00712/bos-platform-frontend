import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Per-user, per-module preferences. Stored in localStorage so they
 * persist across reloads. Each module reads its own slice via a typed
 * selector — never mutate the store from outside that slice.
 *
 * Shape rule: every module key is a flat record of primitive prefs.
 * Avoid nesting. Add a new key when you need a new module.
 */

export type Density = 'comfortable' | 'compact'
export type CrmListView = 'table' | 'kanban'
export type SchedulingView = 'day' | 'week' | 'month' | 'agenda'
export type BillingTaxMode = 'inclusive' | 'exclusive'
export type DashboardDateRange = '7d' | '30d' | '90d' | 'ytd' | 'all'

type ModulePrefs = {
  /** Surface-wide chrome density. */
  density: Density

  /** CRM. */
  crm: {
    listView: CrmListView
    showArchived: boolean
    /** Default sort key — module-defined. */
    sortBy: string
  }

  /** Scheduling. */
  scheduling: {
    defaultView: SchedulingView
    slotMinutes: number
    weekStartsOn: 0 | 1 | 6 // Sun / Mon / Sat
    showCancelled: boolean
  }

  /** Billing. */
  billing: {
    taxMode: BillingTaxMode
    defaultDueDays: number
    autoSendReminders: boolean
  }

  /** Dashboard. */
  dashboard: {
    dateRange: DashboardDateRange
    showRevenueChart: boolean
    showPipeline: boolean
  }

  /** Medical. */
  medical: {
    defaultSpecialty: 'fm' | 'peds' | 'ob' | 'psych' | 'cardio' | 'derm' | 'im'
    autoSaveDraftSeconds: number
    confirmBeforeSign: boolean
  }

  /** School. */
  school: {
    defaultClassId: string | null
    showInactiveStudents: boolean
  }

  /** Dental. */
  dental: {
    chartNumberSystem: 'fdi' | 'universal' | 'palmer'
    showHistoricalToothMarks: boolean
  }

  /** Mutators — one per module to avoid blast-radius. */
  setDensity: (v: Density) => void
  setCrm: (patch: Partial<ModulePrefs['crm']>) => void
  setScheduling: (patch: Partial<ModulePrefs['scheduling']>) => void
  setBilling: (patch: Partial<ModulePrefs['billing']>) => void
  setDashboard: (patch: Partial<ModulePrefs['dashboard']>) => void
  setMedical: (patch: Partial<ModulePrefs['medical']>) => void
  setSchool: (patch: Partial<ModulePrefs['school']>) => void
  setDental: (patch: Partial<ModulePrefs['dental']>) => void

  /** Hard reset everything in one place — shown in the global preferences page. */
  resetAll: () => void
}

const initial: Omit<
  ModulePrefs,
  | 'setDensity'
  | 'setCrm'
  | 'setScheduling'
  | 'setBilling'
  | 'setDashboard'
  | 'setMedical'
  | 'setSchool'
  | 'setDental'
  | 'resetAll'
> = {
  density: 'comfortable',
  crm: { listView: 'table', showArchived: false, sortBy: 'updatedAt' },
  scheduling: {
    defaultView: 'week',
    slotMinutes: 30,
    weekStartsOn: 1,
    showCancelled: false,
  },
  billing: { taxMode: 'exclusive', defaultDueDays: 30, autoSendReminders: true },
  dashboard: { dateRange: '30d', showRevenueChart: true, showPipeline: true },
  medical: {
    defaultSpecialty: 'fm',
    autoSaveDraftSeconds: 8,
    confirmBeforeSign: true,
  },
  school: { defaultClassId: null, showInactiveStudents: false },
  dental: {
    chartNumberSystem: 'fdi',
    showHistoricalToothMarks: true,
  },
}

export const useModulePrefs = create<ModulePrefs>()(
  persist(
    (set) => ({
      ...initial,
      setDensity: (density) => set({ density }),
      setCrm: (patch) => set((s) => ({ crm: { ...s.crm, ...patch } })),
      setScheduling: (patch) =>
        set((s) => ({ scheduling: { ...s.scheduling, ...patch } })),
      setBilling: (patch) => set((s) => ({ billing: { ...s.billing, ...patch } })),
      setDashboard: (patch) =>
        set((s) => ({ dashboard: { ...s.dashboard, ...patch } })),
      setMedical: (patch) => set((s) => ({ medical: { ...s.medical, ...patch } })),
      setSchool: (patch) => set((s) => ({ school: { ...s.school, ...patch } })),
      setDental: (patch) => set((s) => ({ dental: { ...s.dental, ...patch } })),
      resetAll: () => set(initial),
    }),
    {
      name: 'bos.module-prefs',
      version: 1,
    },
  ),
)
