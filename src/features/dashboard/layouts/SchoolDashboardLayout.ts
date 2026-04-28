import {
  AnnouncementsWidget,
  AttendanceTodayWidget,
  FeesCollectionWidget,
  SchoolKpiRowWidget,
  UpcomingExamsWidget,
} from '@/features/school/widgets'
import type { DashboardLayout } from './types'

/**
 * School-tuned dashboard. Foregrounds the daily school workhorses:
 * attendance status, fee collection, upcoming exams, and broadcast
 * announcements. Drops the cross-vertical platform widgets (active
 * verticals grid, revenue donut, sales pipeline) in favor of school
 * operational signals.
 */
export const SchoolDashboardLayout: DashboardLayout = {
  id: 'dashboard.layouts.school',
  widgets: [
    SchoolKpiRowWidget,
    AttendanceTodayWidget,
    FeesCollectionWidget,
    UpcomingExamsWidget,
    AnnouncementsWidget,
  ],
}
