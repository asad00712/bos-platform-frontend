import {
  ActiveVerticalsWidget,
  AiInsightWidget,
  KpiRowWidget,
  OpenTasksWidget,
  RecentActivityWidget,
  RecentClientsWidget,
  RevenueByVerticalWidget,
  RevenueByWeekWidget,
  SalesPipelineWidget,
} from '../widgets'
import type { DashboardLayout } from './types'

export const DefaultDashboardLayout: DashboardLayout = {
  id: 'dashboard.layouts.default',
  widgets: [
    AiInsightWidget,
    KpiRowWidget,
    RevenueByWeekWidget,
    RecentActivityWidget,
    OpenTasksWidget,
    SalesPipelineWidget,
    RevenueByVerticalWidget,
    ActiveVerticalsWidget,
    RecentClientsWidget,
  ],
}
