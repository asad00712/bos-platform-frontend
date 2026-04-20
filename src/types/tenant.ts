export type VerticalType = 'medical' | 'law' | 'restaurant' | 'school' | 'gym'

export type TenantPlan = 'starter' | 'growth' | 'enterprise'

export type Permission =
  | 'dashboard:view'
  | 'patients:read'
  | 'patients:write'
  | 'appointments:read'
  | 'appointments:write'
  | 'billing:read'
  | 'billing:write'
  | 'hrm:read'
  | 'reports:read'
  | 'settings:manage'

export type TenantContext = {
  id: string
  slug: string
  name: string
  plan: TenantPlan
  vertical: VerticalType
  locale: string
  timezone: string
  permissions: Permission[]
}
