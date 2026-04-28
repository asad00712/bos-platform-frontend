/**
 * i18n namespaces. Adding a new feature? Append its namespace here so
 * type-safe lookup and the resource loader stay in sync.
 */
export const NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'crm',
  'scheduling',
  'billing',
  'hrm',
  'documents',
  'communication',
  'automation',
  'reports',
  'settings',
  'notifications',
  'support',
  'audit',
  'profile',
  'dental',
  'school',
  'medical',
  'law',
  'restaurant',
  'gym',
  'salon',
  'retail',
  'errors',
  'validation',
] as const

export type Namespace = (typeof NAMESPACES)[number]

export const SUPPORTED_LOCALES = ['en', 'ar', 'ur', 'es', 'hi'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** Locales that should render right-to-left. */
export const RTL_LOCALES: Locale[] = ['ar', 'ur']

export const DEFAULT_LOCALE: Locale = 'en'
