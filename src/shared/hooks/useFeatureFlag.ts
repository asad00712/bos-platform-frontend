import { useSessionStore } from '@/stores/session.store'
import {
  CALIBERS,
  PLAN_TIERS,
  resolveFeatureFlag,
  tierForPlan,
} from '@/config/features'
import type { FeatureKey } from '@/types/tenant'

/** True when the named feature is enabled for the active tenant. */
export function useFeatureFlag(key: FeatureKey): boolean {
  const tenant = useSessionStore((s) => s.tenant)
  return resolveFeatureFlag(key, {
    plan: tenant.plan,
    caliber: tenant.caliber,
    size: tenant.size,
    overrides: tenant.featureFlags,
  })
}

/** Plan tier object for the active tenant. */
export function usePlanTier() {
  const plan = useSessionStore((s) => s.tenant.plan)
  return tierForPlan(plan)
}

/** Caliber metadata for the active tenant. */
export function useCaliber() {
  const caliber = useSessionStore((s) => s.tenant.caliber)
  return CALIBERS[caliber]
}

export const ALL_PLAN_TIERS = PLAN_TIERS
