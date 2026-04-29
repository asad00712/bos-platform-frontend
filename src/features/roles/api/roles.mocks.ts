import type { TenantPermission, TenantRole } from '@/types/crm'

const TENANT_BRANCH = 'br-main'

/**
 * Catalog of permission slugs the BE exposes (from crm-core's
 * @RequirePermission decorators + the Permission seed table). Grouped by
 * module so the editor can render a checkbox tree.
 */
export const PERMISSION_CATALOG: TenantPermission[] = [
  /* contacts */
  { slug: 'tenant:contacts:view_branch', module: 'contacts', action: 'view_branch', description: 'View contacts in the active branch' },
  { slug: 'tenant:contacts:create', module: 'contacts', action: 'create', description: 'Create contacts' },
  { slug: 'tenant:contacts:update', module: 'contacts', action: 'update', description: 'Update contacts' },
  { slug: 'tenant:contacts:delete', module: 'contacts', action: 'delete', description: 'Soft-delete contacts' },

  /* leads */
  { slug: 'tenant:leads:view_branch', module: 'leads', action: 'view_branch', description: 'View leads in the active branch' },
  { slug: 'tenant:leads:create', module: 'leads', action: 'create', description: 'Create leads' },
  { slug: 'tenant:leads:update', module: 'leads', action: 'update', description: 'Update leads' },
  { slug: 'tenant:leads:delete', module: 'leads', action: 'delete', description: 'Delete leads' },
  { slug: 'tenant:leads:configure', module: 'leads', action: 'configure', description: 'Manage statuses, assignment, webhooks' },

  /* tags */
  { slug: 'tenant:tags:manage', module: 'tags', action: 'manage', description: 'Create / update / delete tags' },

  /* contact sources */
  { slug: 'tenant:contact-sources:manage', module: 'contact-sources', action: 'manage', description: 'Manage contact sources' },

  /* custom fields */
  { slug: 'tenant:custom-fields:manage', module: 'custom-fields', action: 'manage', description: 'Manage custom field definitions' },

  /* branches */
  { slug: 'tenant:branches:manage', module: 'branches', action: 'manage', description: 'Manage tenant branches' },

  /* staff */
  { slug: 'tenant:users:invite', module: 'staff', action: 'invite', description: 'Invite new staff members' },
  { slug: 'tenant:users:manage_roles', module: 'staff', action: 'manage_roles', description: 'Assign roles, remove staff' },
  { slug: 'tenant:staff:round_robin', module: 'staff', action: 'round_robin', description: 'Toggle round-robin availability' },

  /* roles */
  { slug: 'tenant:roles:manage', module: 'roles', action: 'manage', description: 'Manage roles & permissions' },
]

/**
 * Seed roles. Owner has every permission; Manager has most; Staff has the
 * minimum to operate; Viewer is read-only. The "current user" mock starts
 * as Owner — see roles.api current() — so the FE renders nothing hidden
 * by RBAC by default.
 */
let store: TenantRole[] = [
  {
    id: 'role-owner',
    branchId: TENANT_BRANCH,
    name: 'Owner',
    description: 'Full access to every tenant feature.',
    isSystem: true,
    permissionSlugs: PERMISSION_CATALOG.map((p) => p.slug),
    createdAt: new Date(Date.now() - 365 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 365 * 86_400_000).toISOString(),
  },
  {
    id: 'role-manager',
    branchId: TENANT_BRANCH,
    name: 'Manager',
    description: 'Operational lead — runs the pipeline and the team.',
    isSystem: false,
    permissionSlugs: [
      'tenant:contacts:view_branch',
      'tenant:contacts:create',
      'tenant:contacts:update',
      'tenant:contacts:delete',
      'tenant:leads:view_branch',
      'tenant:leads:create',
      'tenant:leads:update',
      'tenant:leads:delete',
      'tenant:leads:configure',
      'tenant:tags:manage',
      'tenant:contact-sources:manage',
      'tenant:custom-fields:manage',
      'tenant:users:invite',
      'tenant:staff:round_robin',
    ],
    createdAt: new Date(Date.now() - 200 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
  },
  {
    id: 'role-staff',
    branchId: TENANT_BRANCH,
    name: 'Staff',
    description: 'Day-to-day operator — runs contacts and leads.',
    isSystem: false,
    permissionSlugs: [
      'tenant:contacts:view_branch',
      'tenant:contacts:create',
      'tenant:contacts:update',
      'tenant:leads:view_branch',
      'tenant:leads:create',
      'tenant:leads:update',
    ],
    createdAt: new Date(Date.now() - 200 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
  },
  {
    id: 'role-viewer',
    branchId: TENANT_BRANCH,
    name: 'Viewer',
    description: 'Read-only access to contacts and leads.',
    isSystem: false,
    permissionSlugs: ['tenant:contacts:view_branch', 'tenant:leads:view_branch'],
    createdAt: new Date(Date.now() - 200 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 86_400_000).toISOString(),
  },
]

/* Current user role mapping — drives useHasPermission until the BE wires
 * this from /auth/me. Default to Owner so nothing is hidden. */
let currentUserRoleId = 'role-owner'

export const roleMocks = {
  listPermissions(): TenantPermission[] {
    return PERMISSION_CATALOG
  },

  list(): TenantRole[] {
    return [...store]
  },

  get(id: string): TenantRole | null {
    return store.find((r) => r.id === id) ?? null
  },

  create(input: { name: string; description?: string; permissionSlugs: string[] }): TenantRole {
    const now = new Date().toISOString()
    const next: TenantRole = {
      id: `role-${Date.now()}`,
      branchId: TENANT_BRANCH,
      name: input.name,
      description: input.description ?? null,
      isSystem: false,
      permissionSlugs: input.permissionSlugs,
      createdAt: now,
      updatedAt: now,
    }
    store = [...store, next]
    return next
  },

  update(
    id: string,
    patch: Partial<{ name: string; description: string | null; permissionSlugs: string[] }>,
  ): TenantRole | null {
    const idx = store.findIndex((r) => r.id === id)
    if (idx < 0) return null
    store[idx] = { ...store[idx], ...patch, updatedAt: new Date().toISOString() }
    return store[idx]
  },

  remove(id: string): boolean {
    const target = store.find((r) => r.id === id)
    if (!target || target.isSystem) return false
    const before = store.length
    store = store.filter((r) => r.id !== id)
    return store.length < before
  },

  /** Current user role (mock for `useHasPermission` bootstrap). */
  currentRoleId(): string {
    return currentUserRoleId
  },
  setCurrentRole(id: string): void {
    if (store.some((r) => r.id === id)) {
      currentUserRoleId = id
    }
  },
}
