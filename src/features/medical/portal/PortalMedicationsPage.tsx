import { useState } from 'react'
import { Pill, RefreshCw } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { toast } from 'sonner'

import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'

import { useMedications } from '../hooks'
import { PORTAL_PATIENT_ID } from './portalConstants'

export function PortalMedicationsPage() {
  const { tenant } = useTenant()
  const q = useMedications(tenant.id, PORTAL_PATIENT_ID)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [note, setNote] = useState('')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Medications</h1>
        <p className="text-sm text-muted-foreground">
          Active prescriptions and refill requests. Always take medications exactly as your provider directed.
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active prescriptions
        </h2>
        {q.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (q.data?.active ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No active prescriptions.</p>
        ) : (
          <ul className="space-y-2">
            {q.data!.active.map((m) => (
              <li key={m.id}>
                <Card>
                  <CardContent className="space-y-2 p-4 text-sm">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Pill className="size-4 shrink-0 text-primary" />
                      <span className="break-words font-medium">
                        {m.medication.display}{' '}
                        <span className="text-muted-foreground">{m.strengthLabel}</span>
                      </span>
                      {m.controlled ? (
                        <Badge variant="destructive" className="text-[10px] uppercase">
                          {m.controlledSchedule ?? 'Controlled'}
                        </Badge>
                      ) : null}
                      <span className="ms-auto text-xs text-muted-foreground">
                        Authored {formatRelative(m.authoredOn)}
                      </span>
                    </div>
                    <p className="break-words text-sm">{m.dosage.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.refillsRemaining} of {m.refillsAuthorized} refills remaining
                    </p>

                    {requesting === m.id ? (
                      <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                        <Label className="text-xs">Note for the pharmacy / provider</Label>
                        <Textarea
                          rows={2}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Optional — e.g. allergic-pharmacy preference, dose change request"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRequesting(null)
                              setNote('')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setRequesting(null)
                              setNote('')
                              toast.success('Refill requested', {
                                description: `${m.medication.display} ${m.strengthLabel}`,
                              })
                            }}
                          >
                            Send request
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={m.refillsRemaining === 0 || m.controlledSchedule === 'CII'}
                          onClick={() => setRequesting(m.id)}
                        >
                          <RefreshCw /> Request refill
                        </Button>
                      </div>
                    )}
                    {m.controlledSchedule === 'CII' ? (
                      <p className="text-[11px] text-muted-foreground">
                        Schedule II controlled substances cannot be refilled — your provider must
                        write a new prescription.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(q.data?.homeMeds ?? []).length > 0 ? (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Self-reported / over-the-counter
          </h2>
          <ul className="space-y-2 text-sm">
            {q.data!.homeMeds.map((m) => (
              <li key={m.id} className="rounded-md border p-3">
                <p className="font-medium">
                  {m.medication.display}{' '}
                  <span className="text-muted-foreground">{m.strengthLabel}</span>
                </p>
                {m.notes ? <p className="text-xs text-muted-foreground">{m.notes}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
