import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  HeartPulse,
  Microscope,
  Pill,
  Receipt,
  Stethoscope,
  Video,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'

import {
  useAddAddendum,
  useAllergies,
  useEncounter,
  usePatient,
  usePractitioners,
  useRecordVitals,
  useSaveNoteDraft,
  useSignNote,
} from '../hooks'
import { AllergyAckBanner } from '../components/AllergyAckBanner'
import { PatientStoryboard } from '../components/PatientStoryboard'
import { SignCeremonyDialog } from '../components/SignCeremonyDialog'
import { SoapNoteEditor } from '../components/SoapNoteEditor'
import { VitalsRecorder } from '../components/VitalsRecorder'
import { BidiCode } from '@/shared/lib/bidi'
import type { SoapNote } from '../api/medical.contracts'

const STATUS_TONE: Record<string, string> = {
  planned: 'border-sky-500/40 bg-sky-500/5 text-sky-700 dark:text-sky-300',
  arrived: 'border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300',
  in_progress: 'border-primary/40 bg-primary/10 text-primary',
  finished: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
  cancelled: 'border-rose-500/40 bg-rose-500/5 text-rose-700 dark:text-rose-300',
}

export function EncounterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()

  const enc = useEncounter(tenant.id, id)
  const patient = usePatient(tenant.id, enc.data?.encounter.patientId)
  const allergies = useAllergies(tenant.id, enc.data?.encounter.patientId)
  const practitioners = usePractitioners(tenant.id)

  const saveDraft = useSaveNoteDraft(tenant.id, id ?? '')
  const signNote = useSignNote(tenant.id, id ?? '')
  const addAddendum = useAddAddendum(tenant.id, id ?? '')
  const recordVitals = useRecordVitals(tenant.id, enc.data?.encounter.patientId ?? '')

  const [signing, setSigning] = useState<{ open: boolean; soap: SoapNote | null }>({
    open: false,
    soap: null,
  })
  const [vitalsOpen, setVitalsOpen] = useState(false)

  if (enc.isLoading || !enc.data || patient.isLoading || !patient.data) {
    return (
      <PageContainer>
        <PageHeader title="Loading encounter…" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </PageContainer>
    )
  }

  if (enc.isError) {
    return (
      <PageContainer>
        <PageHeader title="Encounter" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Stethoscope />
            </EmptyMedia>
            <EmptyTitle>Encounter not found</EmptyTitle>
            <EmptyDescription>
              {(enc.error as Error)?.message ?? 'It may have been removed.'}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/app/medical/schedule">
              <ArrowLeft /> Back to schedule
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    )
  }

  const e = enc.data.encounter
  const note = enc.data.note
  const provider = practitioners.data?.find((p) => p.id === e.providerId)
  const expectedPin = provider?.signaturePin ?? '0001'
  const isPeds = patient.data.age < 18

  return (
    <PageContainer>
      <PageHeader
        title={`Encounter · ${e.visitType}`}
        description={`${formatDateTime(e.startAt)} · ${e.providerName} · ${e.locationName}`}
        breadcrumbs={[
          { label: 'Schedule', href: '/app/medical/schedule' },
          { label: e.patientName, href: `/app/medical/patients/${e.patientId}` },
          { label: e.visitType },
        ]}
        actions={
          <>
            <BidiCode className="text-xs text-muted-foreground">{e.id}</BidiCode>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase ${
                STATUS_TONE[e.status] ?? ''
              }`}
            >
              {e.status.replace('_', ' ')}
            </span>
            {e.class === 'VR' ? (
              <Badge variant="outline" className="gap-1">
                <Video className="size-3" /> Telehealth
              </Badge>
            ) : null}
            <Button variant="outline" asChild>
              <Link to={`/app/medical/encounters/${e.id}/superbill`}>
                <Receipt /> Superbill
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/app/medical/patients/${e.patientId}`}>Open chart</Link>
            </Button>
          </>
        }
      />

      <PatientStoryboard detail={patient.data} />

      <AllergyAckBanner
        allergies={allergies.data?.items ?? []}
        noKnownAllergies={Boolean(allergies.data?.noKnownAllergies)}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SoapNoteEditor
            note={note}
            onSaveDraft={async (soap) => {
              await saveDraft.mutateAsync(soap)
            }}
            onRequestSign={(soap) =>
              setSigning({ open: true, soap })
            }
            onAddAddendum={async (text) => {
              await addAddendum.mutateAsync({ authorId: e.providerId, text })
            }}
            isSavingDraft={saveDraft.isPending}
          />
        </div>

        <div className="space-y-4">
          {/* vitals */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <HeartPulse className="size-4" /> Vitals
                </h3>
                <Button size="sm" variant="outline" onClick={() => setVitalsOpen((v) => !v)}>
                  {vitalsOpen ? 'Cancel' : 'Record'}
                </Button>
              </div>
              {patient.data.snapshot.latestVitals ? (
                <p className="text-xs text-muted-foreground">
                  Latest {formatRelative(patient.data.snapshot.latestVitals.effectiveDateTime)}
                </p>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400">No vitals on this chart</p>
              )}
            </CardContent>
          </Card>

          {vitalsOpen ? (
            <VitalsRecorder
              patientId={e.patientId}
              encounterId={e.id}
              isPeds={isPeds}
              showWeightRequiredHint={isPeds && (patient.data.snapshot.pedsWeightStaleDays ?? 0) > 30}
              onSubmit={async (input) => {
                await recordVitals.mutateAsync(input)
                setVitalsOpen(false)
              }}
              onCancel={() => setVitalsOpen(false)}
              isSubmitting={recordVitals.isPending}
            />
          ) : null}

          {/* orders + meds inline summaries */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <ClipboardList className="size-4" /> Orders this visit
              </h3>
              {enc.data.orders.length === 0 ? (
                <p className="text-xs text-muted-foreground">None placed yet</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {enc.data.orders.slice(0, 6).map((o) => (
                    <li key={o.id} className="flex items-baseline gap-2">
                      <Badge variant="outline" className="uppercase">
                        {o.category}
                      </Badge>
                      <BidiCode className="text-xs text-muted-foreground">{o.code.code}</BidiCode>
                      <span className="break-words">{o.code.display}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Pill className="size-4" /> Prescriptions this visit
              </h3>
              {enc.data.rxThisVisit.length === 0 ? (
                <p className="text-xs text-muted-foreground">None written yet</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {enc.data.rxThisVisit.map((rx) => (
                    <li key={rx.id} className="space-y-0.5">
                      <p className="break-words font-medium leading-tight">
                        {rx.medication.display}
                        <span className="ms-1 text-muted-foreground">{rx.strengthLabel}</span>
                      </p>
                      <p className="break-words text-xs text-muted-foreground">{rx.dosage.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/app/medical/patients/${e.patientId}/medications`}>
                  Open Rx pad
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-5 text-sm">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Microscope className="size-4" /> Quick links
              </h3>
              <Link to={`/app/medical/patients/${e.patientId}/labs`} className="block text-primary hover:underline">Labs →</Link>
              <Link to={`/app/medical/patients/${e.patientId}/imaging`} className="block text-primary hover:underline">Imaging →</Link>
              <Link to={`/app/medical/patients/${e.patientId}/history`} className="block text-primary hover:underline">History →</Link>
              <Link to={`/app/medical/labs/inbox`} className="block text-primary hover:underline">Lab inbox →</Link>
              <Link to={`/app/medical/schedule`} className="block text-muted-foreground hover:underline">
                <CalendarClock className="me-1 inline size-3" /> Back to schedule
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <SignCeremonyDialog
        open={signing.open}
        onOpenChange={(o) => setSigning((s) => ({ ...s, open: o }))}
        title="Sign progress note"
        description="Confirm the assessment, plan, and orders before signing."
        expectedPin={expectedPin}
        onConfirm={async () => {
          if (signing.soap) {
            await saveDraft.mutateAsync(signing.soap)
          }
          await signNote.mutateAsync(e.providerId)
        }}
        preview={
          signing.soap ? (
            <div className="space-y-1 text-sm">
              <p className="font-medium">{e.patientName} · {e.visitType}</p>
              <p className="text-xs text-muted-foreground">
                Encounter {e.id} · {formatDateTime(e.startAt)} · {e.providerName}
              </p>
              <p className="mt-2">
                <span className="font-medium">CC:</span>{' '}
                <span>{signing.soap.subjective.chiefComplaint || '—'}</span>
              </p>
              <p>
                <span className="font-medium">A:</span>{' '}
                {signing.soap.assessment.length === 0
                  ? '—'
                  : signing.soap.assessment.map((a) => a.icd10.display || a.icd10.code).join(', ')}
              </p>
              <p className="break-words">
                <span className="font-medium">P:</span>{' '}
                {signing.soap.plan.slice(0, 200) || '—'}
              </p>
            </div>
          ) : null
        }
      />
    </PageContainer>
  )
}
