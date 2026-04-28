import {
  BillingSnapshotWidget,
  LabsToSignWidget,
  MedicalKpiRowWidget,
  RefillsRecallsWidget,
  TodaysScheduleWidget,
} from '@/features/medical/widgets'
import type { DashboardLayout } from './types'

/**
 * Medical-tuned dashboard. Foregrounds the daily clinic workhorses:
 * today's schedule, lab results to sign, pharmacy refills + recall
 * outreach, and AR/denial billing health.
 */
export const MedicalDashboardLayout: DashboardLayout = {
  id: 'dashboard.layouts.medical',
  widgets: [
    MedicalKpiRowWidget,
    TodaysScheduleWidget,
    LabsToSignWidget,
    RefillsRecallsWidget,
    BillingSnapshotWidget,
  ],
}
