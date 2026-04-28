import {
  CalendarCheck,
  FileSignature,
  Pill,
  Stethoscope,
} from 'lucide-react'

import { KpiCard } from '@/shared/ui/kpi-card'
import { useTenant } from '@/shared/hooks/useTenant'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useMedicalOverview } from '../hooks'

function MedicalKpiRowComponent() {
  const { tenant } = useTenant()
  const q = useMedicalOverview(tenant.id)

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
        label="Today's schedule"
        value={o.patientsTodayScheduled}
        caption={`${o.patientsArrived} arrived / roomed`}
        icon={<CalendarCheck className="size-4" />}
      />
      <KpiCard
        label="Lab results to sign"
        value={o.labsToSign}
        caption="Awaiting clinician release"
        icon={<FileSignature className="size-4" />}
      />
      <KpiCard
        label="Pending refills"
        value={o.refillsPending}
        caption={`${o.recallsDue} recalls due/overdue`}
        icon={<Pill className="size-4" />}
      />
      <KpiCard
        label="Active panel"
        value={o.patientsTotal}
        caption={`${o.messagesUnread} unread portal messages`}
        icon={<Stethoscope className="size-4" />}
      />
    </div>
  )
}

export const MedicalKpiRowWidget: Widget = {
  id: 'medical.dashboard.kpi-row',
  Component: MedicalKpiRowComponent,
  permission: 'dashboard:view',
  span: { col: 12 },
}
