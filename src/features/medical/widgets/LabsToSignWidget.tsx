import { Link } from 'react-router'
import { CheckCircle2, Microscope } from 'lucide-react'

import { Panel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import type { Widget } from '@/features/dashboard/widgets/types'
import { useLabInbox } from '../hooks'
import { AbnormalFlag } from '../components/AbnormalFlag'

function LabsToSignComponent() {
  const { tenant } = useTenant()
  const q = useLabInbox(tenant.id)
  const items = (q.data?.items ?? []).filter((i) => !i.signedAt).slice(0, 6)

  return (
    <Panel
      title="Lab inbox"
      description="Awaiting clinician sign-off"
      actions={
        <Link
          to="/app/medical/labs/inbox"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open inbox →
        </Link>
      }
    >
      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="flex items-center gap-2 py-4 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" /> Inbox zero — no results awaiting sign.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((r) => (
            <li key={r.reportId}>
              <Link
                to={`/app/medical/labs/${r.reportId}`}
                className="flex items-center gap-3 rounded-md border p-2 text-sm hover:bg-accent"
              >
                <Microscope className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-tight">{r.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.panelDisplay} · {formatRelative(r.effectiveDateTime)}
                  </p>
                </div>
                <AbnormalFlag flag={r.worstFlag} compact />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export const LabsToSignWidget: Widget = {
  id: 'medical.dashboard.labs-to-sign',
  Component: LabsToSignComponent,
  permission: 'dashboard:view',
  span: { col: 6 },
}
