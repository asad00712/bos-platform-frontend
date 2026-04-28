import {
  AiInsightWidget,
  KpiRowWidget,
  OpenTasksWidget,
  RecentActivityWidget,
  RecentClientsWidget,
  RevenueByWeekWidget,
  SalesPipelineWidget,
} from '../widgets'
import type { DashboardLayout } from './types'

/**
 * Dental-tuned dashboard. Drops the platform-wide "active verticals"
 * grid and "revenue by vertical" donut (those are platform-admin
 * concerns); foregrounds tasks + recent patients (recent-clients in
 * a dental tenant = recent patients).
 */
export const DentalDashboardLayout: DashboardLayout = {
  id: 'dashboard.layouts.dental',
  widgets: [
    AiInsightWidget,
    KpiRowWidget,
    RevenueByWeekWidget,
    RecentActivityWidget,
    OpenTasksWidget,
    SalesPipelineWidget,
    RecentClientsWidget,
  ],
}
