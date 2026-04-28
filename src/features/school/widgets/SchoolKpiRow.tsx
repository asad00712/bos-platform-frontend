import {
  CalendarCheck,
  GraduationCap,
  Megaphone,
  Wallet,
} from 'lucide-react'

import { KpiCard } from '@/shared/ui/kpi-card'
import { useTenant } from '@/shared/hooks/useTenant'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useSchoolOverview } from '../hooks'

function SchoolKpiRowComponent() {
  const { tenant } = useTenant()
  const q = useSchoolOverview(tenant.id)

  if (q.isLoading || !q.data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCard key={i} label="" value={0} isLoading />
        ))}
      </div>
    )
  }

  const o = q.data
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Enrolled students"
        value={o.totalStudents}
        caption={`${o.totalTeachers} teachers · ${o.totalClasses} classes`}
        icon={<GraduationCap className="size-4" />}
      />
      <KpiCard
        label="Attendance today"
        value={o.presentToday}
        caption={`${(o.attendanceRate * 100).toFixed(1)}% rate`}
        icon={<CalendarCheck className="size-4" />}
      />
      <KpiCard
        label="Fees this term"
        value={o.feesCollectedTerm}
        currency={o.currency}
        caption={`${formatCurrency(o.feesOutstanding, o.currency)} outstanding`}
        icon={<Wallet className="size-4" />}
      />
      <KpiCard
        label="Upcoming exams"
        value={o.upcomingExams}
        caption={`${o.unreadAnnouncements} unread announcements`}
        icon={<Megaphone className="size-4" />}
      />
    </div>
  )
}

function formatCurrency(n: number, code: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `${code} ${n}`
  }
}

export const SchoolKpiRowWidget: Widget = {
  id: 'school.dashboard.kpi-row',
  Component: SchoolKpiRowComponent,
  permission: 'dashboard:view',
  span: { col: 12 },
}
