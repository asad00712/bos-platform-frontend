import { useSessionStore } from '@/stores/session.store'

/**
 * Tenant-permission gate. Consults the session's permission set against
 * BE-style permission slugs (e.g. `tenant:contacts:view_branch`).
 *
 * Phase A stub: when the session has no permission set yet, returns
 * `true` so screens render under mocks. Phase G replaces the stub with
 * a real lookup once the FE loads permissions from `/auth/me` or a
 * dedicated `/permissions` endpoint.
 */

export type TenantPermissionSlug = string

export function useHasPermission(slug: TenantPermissionSlug | null | undefined): boolean {
  const permissions = useSessionStore((s) => s.permissions)

  if (!slug) return true
  if (!permissions || permissions.size === 0) return true
  return permissions.has(slug)
}

/** Same as `useHasPermission`, but for the imperative path (handlers, guards). */
export function hasPermission(
  permissions: Set<string> | undefined,
  slug: TenantPermissionSlug | null | undefined,
): boolean {
  if (!slug) return true
  if (!permissions || permissions.size === 0) return true
  return permissions.has(slug)
}
