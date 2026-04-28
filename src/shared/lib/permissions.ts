import type { Permission } from '@/types/tenant'

/**
 * Pure permission helpers. UI gates only — backend authority is final.
 */

export function hasPermission(
  permissions: Permission[] | undefined,
  required: Permission | Permission[] | undefined,
): boolean {
  if (!required) return true
  const list = Array.isArray(required) ? required : [required]
  if (list.length === 0) return true
  if (!permissions || permissions.length === 0) return false
  return list.some((p) => permissions.includes(p))
}

export function hasAllPermissions(
  permissions: Permission[] | undefined,
  required: Permission[] | undefined,
): boolean {
  if (!required || required.length === 0) return true
  if (!permissions || permissions.length === 0) return false
  return required.every((p) => permissions.includes(p))
}
