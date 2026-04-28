import { Clock } from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { KpiCard } from '@/shared/ui/kpi-card'

import { useTenant } from '@/shared/hooks/useTenant'
import { formatDate } from '@/shared/lib/format'

import { useHrmOverview, useTodayAttendance } from '../hooks'
import { AttendanceTable } from '../components/AttendanceTable'

export function AttendancePage() {
  const { tenant } = useTenant()
  const overview = useHrmOverview(tenant.id)
  const list = useTodayAttendance(tenant.id)

  return (
    <PageContainer>
      <PageHeader
        title="Attendance"
        description={formatDate(new Date(), { dateStyle: 'full' })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Headcount"
          value={overview.data?.headcount ?? 0}
          icon={<Clock className="size-4" />}
          isLoading={overview.isLoading}
        />
        <KpiCard
          label="Present today"
          value={overview.data?.presentToday ?? 0}
          icon={<Clock className="size-4" />}
          isLoading={overview.isLoading}
        />
        <KpiCard
          label="On leave today"
          value={overview.data?.onLeaveToday ?? 0}
          icon={<Clock className="size-4" />}
          isLoading={overview.isLoading}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <AttendanceTable data={list.data?.items} isLoading={list.isLoading} />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
