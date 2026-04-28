import { useParams } from 'react-router'
import { Eye, ShieldAlert } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatDateTime } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import { useAuditEvents } from '../../hooks'

const ACTION_LABEL: Record<string, string> = {
  chart_open: 'Opened chart',
  patient_view: 'Viewed patient',
  note_save_draft: 'Saved note draft',
  note_sign: 'Signed note',
  rx_sign: 'Signed prescription',
  order_sign: 'Signed order',
  result_sign: 'Signed result',
  allergy_add: 'Added allergy',
  patient_export: 'Exported chart',
  break_glass_open: 'Opened emergency access',
  break_glass_close: 'Closed emergency access',
}

export function AccessLogPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const q = useAuditEvents(tenant.id, id)

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Access log</h2>
        <p className="text-sm text-muted-foreground">
          Every chart action is recorded for HIPAA-style accountability.
        </p>
      </header>

      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (q.data?.items ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No access events recorded yet.</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {(q.data?.items ?? []).map((e) => (
            <li
              key={e.id}
              className={`flex flex-wrap items-center gap-2 rounded-md border p-2.5 ${
                e.breakGlass ? 'border-rose-500/40 bg-rose-500/5' : ''
              }`}
            >
              {e.breakGlass ? (
                <ShieldAlert className="size-4 text-rose-500" />
              ) : (
                <Eye className="size-4 text-muted-foreground" />
              )}
              <span className="font-medium">{e.actorName}</span>
              <span className="text-muted-foreground">
                {ACTION_LABEL[e.action] ?? e.action}
              </span>
              {e.breakGlass ? (
                <Badge variant="destructive">Break-glass</Badge>
              ) : null}
              <span className="ms-auto text-xs text-muted-foreground">
                {formatDateTime(e.occurredAt)} · {e.ip}
              </span>
              {e.reason ? (
                <p className="w-full pt-1 text-xs italic text-muted-foreground">
                  Reason: {e.reason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
