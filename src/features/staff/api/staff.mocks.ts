import type { Staff, StaffInvite } from '@/types/crm'

const TENANT_ID = 'demo-dental-tenant'
const TENANT_BRANCH_MAIN = 'br-main'
const TENANT_BRANCH_DOWNTOWN = 'br-downtown'

let staffStore: Staff[] = [
  {
    userId: 'user-owner',
    tenantId: TENANT_ID,
    email: 'owner@acme-dental.com',
    firstName: 'Adriana',
    lastName: 'Cruz',
    status: 'active',
    roleIds: ['role-owner'],
    branchIds: [TENANT_BRANCH_MAIN, TENANT_BRANCH_DOWNTOWN],
    roundRobinAvailable: false,
    invitedAt: null,
    joinedAt: new Date(Date.now() - 365 * 86_400_000).toISOString(),
  },
  {
    userId: 'user-ahmed',
    tenantId: TENANT_ID,
    email: 'ahmed@acme-dental.com',
    firstName: 'Ahmed',
    lastName: 'Khan',
    status: 'active',
    roleIds: ['role-manager'],
    branchIds: [TENANT_BRANCH_MAIN],
    roundRobinAvailable: true,
    invitedAt: null,
    joinedAt: new Date(Date.now() - 200 * 86_400_000).toISOString(),
  },
  {
    userId: 'user-maya',
    tenantId: TENANT_ID,
    email: 'maya@acme-dental.com',
    firstName: 'Maya',
    lastName: 'Patel',
    status: 'active',
    roleIds: ['role-staff'],
    branchIds: [TENANT_BRANCH_MAIN, TENANT_BRANCH_DOWNTOWN],
    roundRobinAvailable: true,
    invitedAt: null,
    joinedAt: new Date(Date.now() - 90 * 86_400_000).toISOString(),
  },
  {
    userId: 'user-sami',
    tenantId: TENANT_ID,
    email: 'sami@acme-dental.com',
    firstName: 'Sami',
    lastName: null,
    status: 'invited',
    roleIds: ['role-viewer'],
    branchIds: [TENANT_BRANCH_MAIN],
    roundRobinAvailable: false,
    invitedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    joinedAt: null,
  },
]

let inviteStore: StaffInvite[] = [
  {
    id: 'inv-sami',
    email: 'sami@acme-dental.com',
    roleId: 'role-viewer',
    branchId: TENANT_BRANCH_MAIN,
    invitedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 86_400_000).toISOString(),
    acceptedAt: null,
    invitedByUserId: 'user-owner',
  },
]

const FAKE_INVITE_TOKEN = 'demo-invite-token'

export type StaffInviteInput = {
  email: string
  roleId: string
  branchId: string
}

export const staffMocks = {
  /* ── staff ─────────────────────────────────────────── */
  list(branchId?: string): Staff[] {
    if (branchId) {
      return staffStore.filter((s) => s.branchIds.includes(branchId))
    }
    return [...staffStore]
  },

  setRole(userId: string, roleIds: string[]): Staff | null {
    const idx = staffStore.findIndex((s) => s.userId === userId)
    if (idx < 0) return null
    staffStore[idx] = { ...staffStore[idx], roleIds }
    return staffStore[idx]
  },

  setRoundRobin(userId: string, available: boolean): Staff | null {
    const idx = staffStore.findIndex((s) => s.userId === userId)
    if (idx < 0) return null
    staffStore[idx] = { ...staffStore[idx], roundRobinAvailable: available }
    return staffStore[idx]
  },

  remove(userId: string): boolean {
    const before = staffStore.length
    staffStore = staffStore.filter((s) => s.userId !== userId)
    return staffStore.length < before
  },

  /* ── invites ───────────────────────────────────────── */
  invites(): StaffInvite[] {
    return [...inviteStore]
  },

  invite(input: StaffInviteInput): { invite: StaffInvite; staff: Staff } {
    const now = new Date().toISOString()
    const expires = new Date(Date.now() + 7 * 86_400_000).toISOString()
    const invite: StaffInvite = {
      id: `inv-${Date.now()}`,
      email: input.email,
      roleId: input.roleId,
      branchId: input.branchId,
      invitedAt: now,
      expiresAt: expires,
      acceptedAt: null,
      invitedByUserId: 'user-owner',
    }
    inviteStore = [invite, ...inviteStore]

    /* Mirror as a staff row in invited state so the table shows it. */
    const placeholder: Staff = {
      userId: `user-pending-${Date.now()}`,
      tenantId: TENANT_ID,
      email: input.email,
      firstName: null,
      lastName: null,
      status: 'invited',
      roleIds: [input.roleId],
      branchIds: [input.branchId],
      roundRobinAvailable: false,
      invitedAt: now,
      joinedAt: null,
    }
    staffStore = [...staffStore, placeholder]
    return { invite, staff: placeholder }
  },

  cancelInvite(id: string): boolean {
    const target = inviteStore.find((i) => i.id === id)
    if (!target) return false
    inviteStore = inviteStore.filter((i) => i.id !== id)
    /* drop placeholder staff */
    staffStore = staffStore.filter(
      (s) => !(s.email === target.email && s.status === 'invited'),
    )
    return true
  },

  /** FE for the BE auth-service.invite-accept flow. */
  acceptInvite(input: {
    token: string
    firstName: string
    lastName?: string
    password: string
  }): {
    invite: StaffInvite
    staff: Staff
  } {
    const target =
      inviteStore.find((i) => i.id === input.token) ??
      /* allow demo token */
      (input.token === FAKE_INVITE_TOKEN ? inviteStore[0] : undefined)
    if (!target) throw new Error('Invalid or expired invite token.')
    if (target.acceptedAt) throw new Error('Invite already accepted.')
    if (input.password.length < 10) {
      throw new Error('Password must be at least 10 characters.')
    }

    const now = new Date().toISOString()
    const accepted: StaffInvite = { ...target, acceptedAt: now }
    inviteStore = inviteStore.map((i) => (i.id === target.id ? accepted : i))

    const idx = staffStore.findIndex(
      (s) => s.email === target.email && s.status === 'invited',
    )
    const promoted: Staff = {
      userId: idx >= 0 ? staffStore[idx].userId : `user-${Date.now()}`,
      tenantId: TENANT_ID,
      email: target.email,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
      status: 'active',
      roleIds: [target.roleId],
      branchIds: [target.branchId],
      roundRobinAvailable: false,
      invitedAt: target.invitedAt,
      joinedAt: now,
    }
    if (idx >= 0) {
      staffStore[idx] = promoted
    } else {
      staffStore = [...staffStore, promoted]
    }
    return { invite: accepted, staff: promoted }
  },

  describeInvite(token: string): StaffInvite | null {
    return (
      inviteStore.find((i) => i.id === token) ??
      (token === FAKE_INVITE_TOKEN ? inviteStore[0] ?? null : null)
    )
  },
}
