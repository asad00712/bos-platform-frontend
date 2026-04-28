import { create } from 'zustand'
import type { UserResponse } from '@/types/auth'
import type { TenantContext } from '@/types/tenant'

export type SessionStatus = 'pending' | 'ready'

type SessionState = {
  status: SessionStatus
  accessToken: string | null
  accessTokenExpiresAt: string | null
  user: UserResponse | null
  tenant: TenantContext
  /**
   * BE-style RBAC permission slugs (e.g. `tenant:contacts:view_branch`).
   * Distinct from `tenant.permissions` which is the legacy feature-flag
   * union. Empty set means "permissions not loaded yet" — the
   * `useHasPermission` hook treats that as permissive (mock mode).
   */
  permissions: Set<string>
  setAuthenticatedSession: (payload: {
    accessToken: string
    accessTokenExpiresAt: string
    user: UserResponse
  }) => void
  setAccessToken: (payload: {
    accessToken: string
    accessTokenExpiresAt: string
  }) => void
  setPermissions: (permissions: Iterable<string>) => void
  setStatus: (status: SessionStatus) => void
  setTenant: (tenant: TenantContext) => void
  clearSession: () => void
}

const demoTenant: TenantContext = {
  id: 'demo-dental-tenant',
  slug: 'acme-dental',
  name: 'Acme Dental Clinic',
  plan: 'growth',
  vertical: 'dental',
  caliber: 'professional',
  size: 'small',
  locale: 'en-US',
  timezone: 'Asia/Karachi',
  currency: 'USD',
  locations: [
    { id: 'loc-main', name: 'Main office', current: true, timezone: 'America/Los_Angeles' },
  ],
  usage: {
    members: 6,
    memberLimit: 15,
    locations: 1,
    locationLimit: 3,
    storageGb: 4.2,
    storageGbLimit: 50,
  },
  permissions: [
    'dashboard:view',
    'crm:read',
    'crm:write',
    'scheduling:read',
    'scheduling:write',
    'billing:read',
    'billing:write',
    'hrm:read',
    'hrm:write',
    'documents:read',
    'documents:write',
    'communication:read',
    'communication:write',
    'reports:read',
    'audit:view',
    'settings:manage',
    'dental:read',
    'dental:write',
    'school:read',
    'school:write',
    'medical:read',
    'medical:write',
    'medical:rx:write',
    'medical:results:sign',
    'medical:results:release',
    'medical:billing:read',
    'medical:billing:write',
    'medical:audit:view',
  ],
  clinicalLocale: {
    digits: 'western',
    units: 'us',
    dateSecondary: null,
  },
  branding: {
    appName: 'BOS',
  },
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'pending',
  accessToken: null,
  accessTokenExpiresAt: null,
  user: null,
  tenant: demoTenant,
  permissions: new Set<string>(),
  setAuthenticatedSession: ({ accessToken, accessTokenExpiresAt, user }) =>
    set({ status: 'ready', accessToken, accessTokenExpiresAt, user }),
  setAccessToken: ({ accessToken, accessTokenExpiresAt }) =>
    set({ accessToken, accessTokenExpiresAt }),
  setPermissions: (permissions) => set({ permissions: new Set(permissions) }),
  setStatus: (status) => set({ status }),
  setTenant: (tenant) => set({ tenant }),
  clearSession: () =>
    set({
      status: 'ready',
      accessToken: null,
      accessTokenExpiresAt: null,
      user: null,
      permissions: new Set<string>(),
    }),
}))
