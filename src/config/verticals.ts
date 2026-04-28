import type { VerticalType } from '@/types/tenant'

/**
 * Vertical registry. Drives sidebar accent color, dashboard layout
 * choice, default modules visible, and per-vertical i18n namespace
 * for terminology overrides.
 *
 * Tenant branding (logoUrl, primaryColor) overrides this at runtime
 * via useTenantTheme(); these are sensible vertical defaults.
 */

export type ModuleId =
  | 'dashboard'
  | 'crm'
  | 'scheduling'
  | 'billing'
  | 'hrm'
  | 'documents'
  | 'communication'
  | 'automation'
  | 'reports'
  | 'audit'
  | 'settings'
  | 'support'
  /* vertical-specific */
  | 'dental'
  | 'school'
  | 'medical'
  | 'law'
  | 'restaurant'
  | 'gym'
  | 'salon'
  | 'retail'

export type VerticalConfig = {
  id: VerticalType
  /** i18n key under `common.verticals.<id>` */
  i18nKey: string
  /** English fallback shown when an override translation is missing. */
  defaultName: string
  /** OKLCH color used as --primary when no tenant override. */
  primary: string
  /** Modules this vertical exposes by default. */
  modules: ModuleId[]
  /** i18n namespace for vertical-specific terminology + screens. */
  namespace: string
}

export const verticals: Record<VerticalType, VerticalConfig> = {
  dental: {
    id: 'dental',
    i18nKey: 'verticals.dental',
    defaultName: 'Dental Clinic',
    primary: 'oklch(0.65 0.13 220)',
    namespace: 'dental',
    modules: [
      'dashboard',
      'dental',
      'crm',
      'scheduling',
      'billing',
      'hrm',
      'documents',
      'communication',
      'reports',
      'settings',
    ],
  },
  school: {
    id: 'school',
    i18nKey: 'verticals.school',
    defaultName: 'School',
    primary: 'oklch(0.55 0.18 295)',
    namespace: 'school',
    modules: [
      'dashboard',
      'school',
      'crm',
      'scheduling',
      'billing',
      'hrm',
      'documents',
      'communication',
      'reports',
      'settings',
    ],
  },
  medical: {
    id: 'medical',
    i18nKey: 'verticals.medical',
    defaultName: 'Medical Clinic',
    primary: 'oklch(0.6 0.13 180)',
    namespace: 'medical',
    modules: [
      'dashboard',
      'medical',
      'crm',
      'scheduling',
      'billing',
      'hrm',
      'documents',
      'communication',
      'reports',
      'settings',
    ],
  },
  law: {
    id: 'law',
    i18nKey: 'verticals.law',
    defaultName: 'Law Firm',
    primary: 'oklch(0.45 0.06 250)',
    namespace: 'law',
    modules: [
      'dashboard',
      'law',
      'crm',
      'scheduling',
      'billing',
      'hrm',
      'documents',
      'communication',
      'reports',
      'settings',
    ],
  },
  restaurant: {
    id: 'restaurant',
    i18nKey: 'verticals.restaurant',
    defaultName: 'Restaurant',
    primary: 'oklch(0.7 0.18 50)',
    namespace: 'restaurant',
    modules: [
      'dashboard',
      'restaurant',
      'crm',
      'scheduling',
      'billing',
      'hrm',
      'reports',
      'settings',
    ],
  },
  gym: {
    id: 'gym',
    i18nKey: 'verticals.gym',
    defaultName: 'Gym',
    primary: 'oklch(0.62 0.22 25)',
    namespace: 'gym',
    modules: [
      'dashboard',
      'gym',
      'crm',
      'scheduling',
      'billing',
      'hrm',
      'reports',
      'settings',
    ],
  },
  salon: {
    id: 'salon',
    i18nKey: 'verticals.salon',
    defaultName: 'Salon',
    primary: 'oklch(0.7 0.2 0)',
    namespace: 'salon',
    modules: [
      'dashboard',
      'salon',
      'crm',
      'scheduling',
      'billing',
      'hrm',
      'reports',
      'settings',
    ],
  },
  retail: {
    id: 'retail',
    i18nKey: 'verticals.retail',
    defaultName: 'Retail',
    primary: 'oklch(0.62 0.14 155)',
    namespace: 'retail',
    modules: [
      'dashboard',
      'retail',
      'crm',
      'billing',
      'hrm',
      'reports',
      'settings',
    ],
  },
}

export function getVertical(id: VerticalType): VerticalConfig {
  return verticals[id]
}
