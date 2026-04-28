import { useState } from 'react'
import { useParams } from 'react-router'
import { ArrowDownToLine, History, Pill, Plus } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTenant } from '@/shared/hooks/useTenant'
import { formatRelative } from '@/shared/lib/format'
import { BidiNum } from '@/shared/lib/bidi'

import {
  useAllergies,
  useDiscontinueRx,
  useMedications,
  usePatient,
  usePharmacies,
  usePregnancy,
  usePrescribe,
} from '../../hooks'
import { PrescribeDialog } from '../../components/PrescribeDialog'
import type { MedicationRequest } from '../../api/medical.contracts'

export function MedicationsPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const [open, setOpen] = useState(false)

  const meds = useMedications(tenant.id, id)
  const patient = usePatient(tenant.id, id)
  const allergies = useAllergies(tenant.id, id)
  const pregnancy = usePregnancy(tenant.id, id)
  const pharmacies = usePharmacies(tenant.id)
  const prescribe = usePrescribe(tenant.id, id ?? '')
  const discontinue = useDiscontinueRx(tenant.id, id ?? '')

  const isLoading = meds.isLoading || patient.isLoading || allergies.isLoading || pharmacies.isLoading

  if (isLoading || !patient.data) {
    return <Skeleton className="h-48 w-full" />
  }

  const active = meds.data?.active ?? []
  const prior = meds.data?.prior ?? []
  const home = meds.data?.homeMeds ?? []

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Medications</h2>
          <p className="text-sm text-muted-foreground">
            Active prescriptions, home meds, and prior history. New Rx runs through allergy + interaction checks.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus /> New Rx
        </Button>
      </header>

      <Section icon={<Pill className="size-4" />} title={`Active (${active.length})`}>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active medications.</p>
        ) : (
          <ul className="space-y-2">
            {active.map((rx) => (
              <RxRow
                key={rx.id}
                rx={rx}
                onDiscontinue={() => discontinue.mutate({ id: rx.id, status: 'stopped' })}
              />
            ))}
          </ul>
        )}
      </Section>

      <Section icon={<ArrowDownToLine className="size-4" />} title={`Home meds — patient-reported (${home.length})`} muted>
        {home.length === 0 ? (
          <p className="text-sm text-muted-foreground">None reported.</p>
        ) : (
          <ul className="space-y-2">
            {home.map((m) => (
              <li key={m.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">
                  {m.medication.display}{' '}
                  <span className="text-muted-foreground">{m.strengthLabel}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Source: {m.source} · started {formatRelative(m.effectivePeriod.start)}
                </p>
                {m.notes ? <p className="mt-1 text-xs">{m.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section icon={<History className="size-4" />} title={`Prior (${prior.length})`} muted>
        {prior.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discontinued prescriptions.</p>
        ) : (
          <ul className="space-y-2">
            {prior.map((rx) => (
              <RxRow key={rx.id} rx={rx} muted />
            ))}
          </ul>
        )}
      </Section>

      {open ? (
        <PrescribeDialog
          open={open}
          onOpenChange={setOpen}
          patientName={`${patient.data.patient.name.preferred ?? patient.data.patient.name.given} ${patient.data.patient.name.family}`}
          patientId={patient.data.patient.id}
          patientAgeYears={patient.data.age}
          patientWeightKg={patient.data.snapshot.latestVitals?.weightKg ?? null}
          pregnancyActive={Boolean(pregnancy.data)}
          activeDrugInns={active.map((m) => m.medication.display)}
          allergyDisplays={(allergies.data?.items ?? []).map((a) => a.substance.display)}
          pharmacies={(pharmacies.data ?? []).map((p) => ({ id: p.id, name: p.name, preferred: p.preferred }))}
          onConfirm={async (input) => {
            await prescribe.mutateAsync({
              encounterId: null,
              medication: input.medication,
              strengthLabel: input.strengthLabel,
              dosage: {
                text: `${input.doseValue} ${input.doseUnit} ${input.route} ${input.frequency}${input.durationDays ? ` × ${input.durationDays} days` : ''}${input.asNeeded ? ' PRN' : ''}`,
                doseValue: input.doseValue,
                doseUnit: input.doseUnit,
                route: input.route,
                frequency: input.frequency,
                durationDays: input.durationDays,
                asNeeded: input.asNeeded,
                asNeededReason: input.asNeededReason,
              },
              quantity: input.quantity,
              quantityUnit: input.quantityUnit,
              daysSupply: input.daysSupply,
              refillsAuthorized: input.refillsAuthorized,
              substitutionAllowed: input.substitutionAllowed,
              pharmacyId: input.pharmacyId,
              controlled: input.controlled,
              controlledSchedule: input.controlledSchedule,
              notes: input.ddiOverrideReason ? `DDI override: ${input.ddiOverrideReason}` : null,
            })
          }}
        />
      ) : null}
    </div>
  )
}

function RxRow({
  rx,
  muted,
  onDiscontinue,
}: {
  rx: MedicationRequest
  muted?: boolean
  onDiscontinue?: () => void
}) {
  return (
    <li className={`rounded-md border p-3 text-sm ${muted ? 'opacity-80' : ''}`}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-medium">
          {rx.medication.display}{' '}
          <span className="text-muted-foreground">{rx.strengthLabel}</span>
        </span>
        {rx.controlled ? (
          <Badge variant="destructive" className="text-[10px] uppercase">
            {rx.controlledSchedule ?? 'Controlled'}
          </Badge>
        ) : null}
        {!rx.substitutionAllowed ? (
          <Badge variant="outline" className="text-[10px] uppercase">DAW</Badge>
        ) : null}
        <span className="ms-auto text-xs text-muted-foreground">
          Authored {formatRelative(rx.authoredOn)}
        </span>
      </div>
      <p className="break-words text-xs text-muted-foreground">{rx.dosage.text}</p>
      <p className="text-xs">
        Quantity <BidiNum>{rx.quantity}</BidiNum> {rx.quantityUnit}
        {rx.daysSupply ? <> · <BidiNum>{rx.daysSupply}</BidiNum>d supply</> : null}
        {' · refills '}
        <BidiNum>{rx.refillsRemaining}</BidiNum>/<BidiNum>{rx.refillsAuthorized}</BidiNum>
      </p>
      {!muted && onDiscontinue ? (
        <div className="mt-2 flex justify-end">
          <Button size="sm" variant="outline" onClick={onDiscontinue}>
            Discontinue
          </Button>
        </div>
      ) : null}
    </li>
  )
}

function Section({
  icon,
  title,
  muted,
  children,
}: {
  icon: React.ReactNode
  title: string
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={muted ? 'opacity-90' : undefined}>
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  )
}
