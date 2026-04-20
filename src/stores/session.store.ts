import { create } from 'zustand'
import type { UserResponse } from '../types/auth'
import type { TenantContext } from '../types/tenant'

type SessionState = {
  accessToken: string | null
  accessTokenExpiresAt: string | null
  user: UserResponse | null
  tenant: TenantContext
  setAuthenticatedSession: (payload: {
    accessToken: string
    accessTokenExpiresAt: string
    user: UserResponse
  }) => void
  clearSession: () => void
}

const demoTenant: TenantContext = {
  id: 'demo-medical-tenant',
  slug: 'acme-clinic',
  name: 'Acme Medical Clinic',
  plan: 'growth',
  vertical: 'medical',
  locale: 'en-US',
  timezone: 'Asia/Karachi',
  permissions: [
    'dashboard:view',
    'patients:read',
    'patients:write',
    'appointments:read',
    'appointments:write',
    'billing:read',
    'hrm:read',
    'reports:read',
    'settings:manage',
  ],
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  accessTokenExpiresAt: null,
  user: null,
  tenant: demoTenant,
  setAuthenticatedSession: ({ accessToken, accessTokenExpiresAt, user }) =>
    set({ accessToken, accessTokenExpiresAt, user }),
  clearSession: () =>
    set({
      accessToken: null,
      accessTokenExpiresAt: null,
      user: null,
    }),
}))
