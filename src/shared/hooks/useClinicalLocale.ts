import { useMemo } from 'react'

import { useTenant } from '@/shared/hooks/useTenant'
import type { UnitSystem } from '@/types/tenant'

export type ResolvedClinicalLocale = {
  /** Render Hijri alongside Gregorian on DOB / encounter / Rx surfaces. */
  dateSecondary: 'hijri' | null
  /** Western digits for clinical fields by default; Eastern allowed only
   *  in patient-facing portal prose when tenant opts in. */
  digits: 'western' | 'eastern'
  /** Default unit system (drives display, never storage). */
  units: UnitSystem
}

/**
 * Resolve the clinical-locale flags for the active tenant. Falls back to
 * sensible defaults when the tenant doesn't carry an explicit override:
 *   - no secondary calendar
 *   - Western digits everywhere clinical
 *   - metric units globally; US units only when tenant.locale starts with `en-US`
 *
 * Components that need this: Hijri date, BidiNum, vitals recorder,
 * lab result row, prescription pad.
 */
export function useClinicalLocale(): ResolvedClinicalLocale {
  const { tenant } = useTenant()
  return useMemo(() => {
    const cl = tenant.clinicalLocale ?? {}
    const units: UnitSystem =
      cl.units ?? (tenant.locale?.startsWith('en-US') ? 'us' : 'metric')
    return {
      dateSecondary: cl.dateSecondary ?? null,
      digits: cl.digits ?? 'western',
      units,
    }
  }, [tenant.clinicalLocale, tenant.locale])
}
