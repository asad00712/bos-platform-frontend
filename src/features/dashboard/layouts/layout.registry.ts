import type { VerticalType } from '@/types/tenant'
import { DefaultDashboardLayout } from './DefaultDashboardLayout'
import { DentalDashboardLayout } from './DentalDashboardLayout'
import { MedicalDashboardLayout } from './MedicalDashboardLayout'
import { SchoolDashboardLayout } from './SchoolDashboardLayout'
import type { DashboardLayout } from './types'

/**
 * Resolves the dashboard layout for a given tenant vertical (and, in
 * the future, role). Adding a new layout = adding one entry here.
 */
export function getDashboardLayout(vertical: VerticalType): DashboardLayout {
  if (vertical === 'dental') return DentalDashboardLayout
  if (vertical === 'school') return SchoolDashboardLayout
  if (vertical === 'medical') return MedicalDashboardLayout
  return DefaultDashboardLayout
}
