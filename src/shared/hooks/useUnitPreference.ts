import { convertForDisplay, preferredUnit } from '@/shared/lib/units'
import type { ClinicalQuantityKind } from '@/shared/lib/units'
import { useClinicalLocale } from '@/shared/hooks/useClinicalLocale'

/**
 * Per-quantity-kind unit preference + lossless conversion helper.
 *
 * Usage:
 *   const u = useUnitPreference()
 *   const { value, unit } = u.display('weight', 23.4, 'kg')
 *   //   → { value: 51.6, unit: 'lb' } when tenant.units = 'us'
 *   //   → { value: 23.4, unit: 'kg' } otherwise
 *
 * Hard rule (master-plan + medical rule #14): NEVER mutate stored values
 * with the converted output. Always preserve the source unit + value
 * upstream so flipping back is exact.
 */
export function useUnitPreference() {
  const { units } = useClinicalLocale()

  return {
    units,
    /** Preferred display unit string for a given clinical quantity kind. */
    preferred(kind: ClinicalQuantityKind): string {
      return preferredUnit(kind, units)
    },
    /** Lossless display conversion from a stored (value, sourceUnit). */
    display(
      kind: ClinicalQuantityKind,
      value: number,
      sourceUnit: string,
    ): { value: number; unit: string } {
      return convertForDisplay(kind, value, sourceUnit, units)
    },
  }
}
