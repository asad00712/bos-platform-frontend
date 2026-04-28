import { useSessionStore } from '@/stores/session.store'
import type { TenantBranding, TenantContext } from '@/types/tenant'

import type {
  BrandingInput,
  IntegrationsResponse,
  InviteInput,
  Member,
  MembersResponse,
  OrganizationProfile,
  OrganizationProfileInput,
  Role,
  RolesResponse,
} from './settings.contracts'

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

let members: Member[] = [
  {
    id: 'mem-001',
    firstName: 'Owner',
    lastName: '',
    email: 'owner@acmedental.com',
    roleId: 'role.owner',
    roleName: 'Owner',
    status: 'active',
    invitedAt: null,
    lastActiveAt: daysAgo(0),
  },
  {
    id: 'mem-002',
    firstName: 'Maya',
    lastName: 'Patel',
    email: 'maya@acmedental.com',
    roleId: 'role.admin',
    roleName: 'Admin',
    status: 'active',
    invitedAt: daysAgo(540),
    lastActiveAt: daysAgo(0),
  },
  {
    id: 'mem-003',
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed@acmedental.com',
    roleId: 'role.clinician',
    roleName: 'Clinician',
    status: 'active',
    invitedAt: daysAgo(820),
    lastActiveAt: daysAgo(0),
  },
  {
    id: 'mem-004',
    firstName: 'Lina',
    lastName: 'Diaz',
    email: 'lina@acmedental.com',
    roleId: 'role.clinician',
    roleName: 'Clinician',
    status: 'active',
    invitedAt: daysAgo(310),
    lastActiveAt: daysAgo(2),
  },
  {
    id: 'mem-005',
    firstName: 'Tomás',
    lastName: 'Hidalgo',
    email: 'tomas@acmedental.com',
    roleId: 'role.front_desk',
    roleName: 'Front desk',
    status: 'active',
    invitedAt: daysAgo(120),
    lastActiveAt: daysAgo(0),
  },
  {
    id: 'mem-006',
    firstName: 'Noah',
    lastName: 'Williams',
    email: 'noah@acmedental.com',
    roleId: 'role.billing',
    roleName: 'Billing',
    status: 'invited',
    invitedAt: daysAgo(2),
    lastActiveAt: null,
  },
]

let roles: Role[] = [
  {
    id: 'role.owner',
    name: 'Owner',
    description: 'Full access. One per tenant.',
    permissions: ['*'],
    builtIn: true,
    memberCount: 1,
  },
  {
    id: 'role.admin',
    name: 'Admin',
    description: 'Manage settings, members, and modules.',
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
    ],
    builtIn: true,
    memberCount: 1,
  },
  {
    id: 'role.clinician',
    name: 'Clinician',
    description: 'Run patients, schedules, and clinical workflows.',
    permissions: [
      'dashboard:view',
      'crm:read',
      'scheduling:read',
      'scheduling:write',
      'documents:read',
      'documents:write',
      'communication:read',
      'communication:write',
      'dental:read',
      'dental:write',
    ],
    builtIn: true,
    memberCount: 2,
  },
  {
    id: 'role.front_desk',
    name: 'Front desk',
    description: 'Bookings, check-ins, and contact management.',
    permissions: [
      'dashboard:view',
      'crm:read',
      'crm:write',
      'scheduling:read',
      'scheduling:write',
      'communication:read',
      'communication:write',
    ],
    builtIn: true,
    memberCount: 1,
  },
  {
    id: 'role.billing',
    name: 'Billing',
    description: 'Invoicing, payments, and accounts receivable.',
    permissions: [
      'dashboard:view',
      'crm:read',
      'billing:read',
      'billing:write',
      'reports:read',
    ],
    builtIn: true,
    memberCount: 1,
  },
]

const integrations: IntegrationsResponse = {
  items: [
    {
      id: 'int.stripe',
      name: 'Stripe',
      description: 'Card payments and payouts.',
      category: 'payments',
      connected: true,
      iconKey: 'stripe',
    },
    {
      id: 'int.twilio',
      name: 'Twilio',
      description: 'SMS reminders and 2FA.',
      category: 'communication',
      connected: true,
      iconKey: 'twilio',
    },
    {
      id: 'int.sendgrid',
      name: 'SendGrid',
      description: 'Transactional email.',
      category: 'communication',
      connected: true,
      iconKey: 'sendgrid',
    },
    {
      id: 'int.gcal',
      name: 'Google Calendar',
      description: 'Two-way calendar sync per staff member.',
      category: 'calendar',
      connected: false,
      iconKey: 'gcal',
    },
    {
      id: 'int.qbo',
      name: 'QuickBooks',
      description: 'Sync invoices and payments to your books.',
      category: 'accounting',
      connected: false,
      iconKey: 'qbo',
    },
    {
      id: 'int.s3',
      name: 'AWS S3',
      description: 'Bring your own storage bucket for documents.',
      category: 'storage',
      connected: false,
      iconKey: 's3',
    },
  ],
}

function tenantToProfile(t: TenantContext): OrganizationProfile {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    locale: t.locale,
    timezone: t.timezone,
    currency: t.currency ?? 'USD',
    plan: t.plan,
    vertical: t.vertical,
  }
}

export const settingsMocks = {
  organization(): OrganizationProfile {
    return tenantToProfile(useSessionStore.getState().tenant)
  },

  saveOrganization(input: OrganizationProfileInput): OrganizationProfile {
    const state = useSessionStore.getState()
    const next: TenantContext = {
      ...state.tenant,
      name: input.name,
      slug: input.slug,
      locale: input.locale,
      timezone: input.timezone,
      currency: input.currency,
    }
    state.setTenant(next)
    return tenantToProfile(next)
  },

  branding(): TenantBranding {
    return useSessionStore.getState().tenant.branding ?? {}
  },

  saveBranding(input: BrandingInput): TenantBranding {
    const state = useSessionStore.getState()
    const next: TenantBranding = {
      ...(state.tenant.branding ?? {}),
      ...input,
      logoUrl: input.logoUrl || undefined,
      faviconUrl: input.faviconUrl || undefined,
    }
    state.setTenant({ ...state.tenant, branding: next })
    return next
  },

  members(): MembersResponse {
    return { items: [...members], total: members.length }
  },

  invite(input: InviteInput): Member {
    const role = roles.find((r) => r.id === input.roleId)
    const created: Member = {
      id: `mem-${Date.now()}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      roleId: input.roleId,
      roleName: role?.name ?? 'Member',
      status: 'invited',
      invitedAt: new Date().toISOString(),
      lastActiveAt: null,
    }
    members = [created, ...members]
    if (role) {
      const idx = roles.findIndex((r) => r.id === role.id)
      if (idx >= 0) roles[idx] = { ...roles[idx], memberCount: roles[idx].memberCount + 1 }
    }
    return created
  },

  removeMember(id: string): boolean {
    const m = members.find((x) => x.id === id)
    if (!m) return false
    members = members.filter((x) => x.id !== id)
    const idx = roles.findIndex((r) => r.id === m.roleId)
    if (idx >= 0) {
      roles[idx] = {
        ...roles[idx],
        memberCount: Math.max(0, roles[idx].memberCount - 1),
      }
    }
    return true
  },

  changeMemberRole(id: string, roleId: string): Member | null {
    const idx = members.findIndex((m) => m.id === id)
    if (idx < 0) return null
    const oldRoleId = members[idx].roleId
    const role = roles.find((r) => r.id === roleId)
    if (!role) return null
    members[idx] = { ...members[idx], roleId: role.id, roleName: role.name }
    // Adjust counts.
    roles = roles.map((r) => {
      if (r.id === oldRoleId) return { ...r, memberCount: Math.max(0, r.memberCount - 1) }
      if (r.id === role.id) return { ...r, memberCount: r.memberCount + 1 }
      return r
    })
    return members[idx]
  },

  roles(): RolesResponse {
    return { items: [...roles] }
  },

  integrations(): IntegrationsResponse {
    return integrations
  },
}
