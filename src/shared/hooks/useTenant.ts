import { useSessionStore } from '@/stores/session.store'
import { getVertical } from '@/config/verticals'

/**
 * Active tenant + its vertical config. The session store currently holds
 * the demo tenant; once tenant-service ships, replace this with a query.
 */
export function useTenant() {
  const tenant = useSessionStore((state) => state.tenant)
  const vertical = getVertical(tenant.vertical)
  return {
    tenant,
    vertical,
    branding: tenant.branding,
  }
}
