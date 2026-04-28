import { useState } from 'react'
import { useParams } from 'react-router'

import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

import { useTenant } from '@/shared/hooks/useTenant'
import { formatDateTime } from '@/shared/lib/format'
import { BidiNum } from '@/shared/lib/bidi'

import { usePatient, useRecordVitals, useVitals } from '../../hooks'
import { VitalsRecorder } from '../../components/VitalsRecorder'
import { AbnormalFlag } from '../../components/AbnormalFlag'
import type { Observation } from '../../api/medical.contracts'

export function VitalsPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const v = useVitals(tenant.id, id)
  const patient = usePatient(tenant.id, id)
  const record = useRecordVitals(tenant.id, id ?? '')
  const [open, setOpen] = useState(false)

  const isPeds = (patient.data?.age ?? 99) < 18
  const isStaleWeight =
    isPeds && (patient.data?.snapshot.pedsWeightStaleDays ?? 0) > 30

  // Group flowsheet by datetime
  const byDate = new Map<string, Observation[]>()
  for (const o of v.data?.flowsheet ?? []) {
    const list = byDate.get(o.effectiveDateTime) ?? []
    list.push(o)
    byDate.set(o.effectiveDateTime, list)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Vitals</h2>
          <p className="text-sm text-muted-foreground">
            Tenant unit preferences are applied to the display only. Stored values keep their
            source unit.
          </p>
        </div>
        {!open ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            Record vitals
          </Button>
        ) : null}
      </header>

      {open && id ? (
        <VitalsRecorder
          patientId={id}
          encounterId={null}
          isPeds={isPeds}
          showWeightRequiredHint={isStaleWeight}
          onSubmit={async (input) => {
            await record.mutateAsync(input)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
          isSubmitting={record.isPending}
        />
      ) : null}

      {v.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-start">When</th>
                <th className="p-3 text-end">BP</th>
                <th className="p-3 text-end">HR</th>
                <th className="p-3 text-end">Temp</th>
                <th className="p-3 text-end">Wt</th>
                <th className="p-3 text-end">Ht</th>
              </tr>
            </thead>
            <tbody>
              {[...byDate.entries()]
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([dt, list]) => {
                  const bp = list.find((o) => o.code.code === '85354-9')
                  const hr = list.find((o) => o.code.code === '8867-4')
                  const temp = list.find((o) => o.code.code === '8310-5')
                  const wt = list.find((o) => o.code.code === '29463-7')
                  const ht = list.find((o) => o.code.code === '8302-2')
                  return (
                    <tr key={dt} className="border-t">
                      <td className="p-3 text-xs text-muted-foreground">{formatDateTime(dt)}</td>
                      <td className="p-3 text-end tabular-nums">
                        {bp?.valueText ? <BidiNum>{bp.valueText.replace(' mmHg', '')}</BidiNum> : '—'}
                        {bp ? (
                          <AbnormalFlag flag={bp.interpretation} compact className="ms-2" />
                        ) : null}
                      </td>
                      <td className="p-3 text-end tabular-nums">
                        {hr?.value ? <BidiNum>{hr.value.value}</BidiNum> : '—'}
                        {hr ? <AbnormalFlag flag={hr.interpretation} compact className="ms-2" /> : null}
                      </td>
                      <td className="p-3 text-end tabular-nums">
                        {temp?.value ? <BidiNum>{temp.value.value}</BidiNum> : '—'}
                        {temp ? (
                          <AbnormalFlag flag={temp.interpretation} compact className="ms-2" />
                        ) : null}
                      </td>
                      <td className="p-3 text-end tabular-nums">
                        {wt?.value ? <BidiNum>{wt.value.value}</BidiNum> : '—'}
                      </td>
                      <td className="p-3 text-end tabular-nums">
                        {ht?.value ? <BidiNum>{ht.value.value}</BidiNum> : '—'}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
