import { useSessionStore } from '@/stores/session.store'
import {
  hasAllPermissions,
  hasPermission,
} from '@/shared/lib/permissions'
import type { Permission } from '@/types/tenant'

export function usePermissions() {
  const permissions = useSessionStore((state) => state.tenant.permissions)
  return {
    permissions,
    has: (required: Permission | Permission[] | undefined) =>
      hasPermission(permissions, required),
    hasAll: (required: Permission[] | undefined) =>
      hasAllPermissions(permissions, required),
  }
}
