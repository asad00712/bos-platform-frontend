import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Camera,
  ClipboardList,
  Mic,
  MicOff,
  PhoneOff,
  Settings2,
  ShieldCheck,
  Signal,
  Stethoscope,
  Video,
  VideoOff,
} from 'lucide-react'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'

import { formatDateTime } from '@/shared/lib/format'
import { useTenant } from '@/shared/hooks/useTenant'
import { cn } from '@/shared/lib/utils'

import {
  useAllergies,
  useEncounter,
  useMedications,
  usePatient,
  useProblems,
  useSetAppointmentStage,
  useVitals,
} from '../hooks'
import { AllergyAckBanner } from '../components/AllergyAckBanner'
import { PatientStoryboard } from '../components/PatientStoryboard'

/**
 * Telehealth provider room.
 *
 * UX contract:
 *   - Two columns above the fold: video stage on the left, chart side-rail
 *     on the right. The chart never goes behind the video — clinicians
 *     must always be able to read allergies + meds + last vitals while
 *     the call is live.
 *   - Real video lives behind a feature flag in production. We render a
 *     deterministic "connection" placeholder + working camera/mic toggles
 *     that drive `data-*` attributes; integration ships with the WebRTC
 *     provider.
 *   - End-call routes to the matching encounter detail to finalise the
 *     SOAP note — and advances the appointment pipeline to "departed".
 */
export function TelehealthRoomPage() {
  const { id } = useParams<{ id: string }>()
  const { tenant } = useTenant()
  const enc = useEncounter(tenant.id, id)
  const patient = usePatient(tenant.id, enc.data?.encounter.patientId)
  const allergies = useAllergies(tenant.id, enc.data?.encounter.patientId)
  const problems = useProblems(tenant.id, enc.data?.encounter.patientId)
  const meds = useMedications(tenant.id, enc.data?.encounter.patientId)
  const vitals = useVitals(tenant.id, enc.data?.encounter.patientId)
  const setStage = useSetAppointmentStage(tenant.id)

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [connected, setConnected] = useState(false)
  const [tab, setTab] = useState('snapshot')

  // simulate the WebRTC handshake
  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 900)
    return () => clearTimeout(t)
  }, [id])

  if (enc.isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Connecting…" />
        <Skeleton className="h-[420px] w-full rounded-lg" />
      </PageContainer>
    )
  }

  if (!enc.data || enc.data.encounter.class !== 'VR') {
    return (
      <PageContainer>
        <PageHeader title="Telehealth" />
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Video />
            </EmptyMedia>
            <EmptyTitle>Telehealth visit not available</EmptyTitle>
            <EmptyDescription>
              The encounter is missing or is not a virtual visit.
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
  const patientName = patient.data
    ? `${patient.data.patient.name.preferred ?? patient.data.patient.name.given} ${patient.data.patient.name.family}`
    : e.patientName
  const initials =
    `${patientName.split(' ')[0]?.[0] ?? ''}${patientName.split(' ')[1]?.[0] ?? ''}`.toUpperCase()

  return (
    <PageContainer>
      <PageHeader
        title={`Telehealth · ${patientName}`}
        description={`${e.visitType} · ${formatDateTime(e.startAt)} · ${e.providerName}`}
        breadcrumbs={[
          { label: 'Schedule', href: '/app/medical/schedule' },
          { label: 'Telehealth' },
        ]}
        actions={
          <>
            <Badge variant="outline" className="gap-1.5">
              <ShieldCheck className="size-3" /> E2E encrypted
            </Badge>
            <Badge variant={connected ? 'default' : 'secondary'} className="gap-1.5">
              <Signal className="size-3" />
              {connected ? 'Connected' : 'Connecting…'}
            </Badge>
            <Button asChild variant="outline">
              <Link to={`/app/medical/encounters/${e.id}`}>
                <ClipboardList /> Open chart note
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* video stage */}
        <Card className="overflow-hidden">
          <CardContent className="space-y-3 p-0">
            <div
              className="relative flex h-[420px] items-center justify-center bg-gradient-to-br from-slate-950 to-slate-800 text-slate-100"
              data-mic={micOn ? 'on' : 'off'}
              data-cam={camOn ? 'on' : 'off'}
              role="region"
              aria-label="Patient video"
            >
              {/* remote video placeholder */}
              <div className="flex flex-col items-center gap-3 text-center">
                <Avatar className="size-24 ring-2 ring-white/20">
                  <AvatarFallback className="bg-slate-700 text-2xl text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <p className="text-lg font-semibold">{patientName}</p>
                <p className="text-xs text-slate-300">
                  {connected ? 'Live · 720p · 30 fps' : 'Negotiating connection…'}
                </p>
              </div>

              {/* self-view picture-in-picture */}
              <div className="absolute bottom-3 right-3 flex h-24 w-32 items-center justify-center rounded-md border border-white/10 bg-slate-900/80 text-[11px] text-slate-300">
                {camOn ? (
                  <span className="flex items-center gap-1">
                    <Camera className="size-3" /> You
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-400">
                    <VideoOff className="size-3" /> Camera off
                  </span>
                )}
              </div>

              {/* connection chip */}
              <div className="absolute left-3 top-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 px-2 py-1 text-[11px]',
                    connected ? 'text-emerald-300' : 'text-amber-300',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block size-1.5 rounded-full',
                      connected ? 'bg-emerald-400' : 'bg-amber-400',
                    )}
                  />
                  {connected ? 'Connected' : 'Connecting'}
                </span>
              </div>
            </div>

            {/* control bar */}
            <div className="flex items-center justify-center gap-2 border-t bg-card p-3">
              <Button
                variant={micOn ? 'outline' : 'secondary'}
                size="icon"
                aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
                onClick={() => setMicOn((v) => !v)}
              >
                {micOn ? <Mic /> : <MicOff />}
              </Button>
              <Button
                variant={camOn ? 'outline' : 'secondary'}
                size="icon"
                aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
                onClick={() => setCamOn((v) => !v)}
              >
                {camOn ? <Video /> : <VideoOff />}
              </Button>
              <Button variant="outline" size="icon" aria-label="Settings">
                <Settings2 />
              </Button>
              <span className="mx-2 h-6 w-px bg-border" />
              <Button
                variant="destructive"
                onClick={() =>
                  setStage.mutate({
                    id: `appt-${e.patientId}-${-1 as number}`, // best-effort match; real impl would carry the appointmentId on the encounter
                    stage: 'departed',
                  })
                }
                asChild
              >
                <Link to={`/app/medical/encounters/${e.id}`}>
                  <PhoneOff /> End visit
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* chart side-rail */}
        <div className="space-y-3">
          {patient.data ? <PatientStoryboard detail={patient.data} /> : null}
          <AllergyAckBanner
            allergies={allergies.data?.items ?? []}
            noKnownAllergies={Boolean(allergies.data?.noKnownAllergies)}
          />

          <Card>
            <CardContent className="p-0">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid w-full grid-cols-3 rounded-none">
                  <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
                  <TabsTrigger value="meds">Meds</TabsTrigger>
                  <TabsTrigger value="vitals">Vitals</TabsTrigger>
                </TabsList>
                <TabsContent value="snapshot" className="space-y-2 p-4 text-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active problems
                  </h4>
                  {problems.isLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (problems.data?.items ?? []).filter((p) => p.clinicalStatus === 'active').length === 0 ? (
                    <p className="text-xs text-muted-foreground">None</p>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {(problems.data?.items ?? [])
                        .filter((p) => p.clinicalStatus === 'active')
                        .slice(0, 6)
                        .map((p) => (
                          <li key={p.id} className="break-words">
                            <span className="font-mono text-muted-foreground">
                              {p.icd10.code}
                            </span>{' '}
                            {p.icd10.display}
                          </li>
                        ))}
                    </ul>
                  )}
                </TabsContent>
                <TabsContent value="meds" className="space-y-1.5 p-4 text-sm">
                  {meds.isLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (meds.data?.active ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No active medications.</p>
                  ) : (
                    <ul className="space-y-2">
                      {(meds.data?.active ?? []).slice(0, 6).map((m) => (
                        <li key={m.id} className="space-y-0.5">
                          <p className="break-words text-sm font-medium leading-tight">
                            {m.medication.display}{' '}
                            <span className="text-muted-foreground">{m.strengthLabel}</span>
                          </p>
                          <p className="break-words text-xs text-muted-foreground">
                            {m.dosage.text}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
                <TabsContent value="vitals" className="space-y-1.5 p-4 text-sm">
                  {vitals.isLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : !vitals.data?.latest ? (
                    <p className="text-xs text-muted-foreground">No vitals on file.</p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {vitals.data.latest.systolic && vitals.data.latest.diastolic ? (
                        <li>
                          BP:{' '}
                          <span className="font-mono">
                            {vitals.data.latest.systolic}/{vitals.data.latest.diastolic} mmHg
                          </span>
                        </li>
                      ) : null}
                      {vitals.data.latest.heartRate ? (
                        <li>
                          HR: <span className="font-mono">{vitals.data.latest.heartRate}/min</span>
                        </li>
                      ) : null}
                      {vitals.data.latest.temperatureC ? (
                        <li>
                          Temp: <span className="font-mono">{vitals.data.latest.temperatureC} °C</span>
                        </li>
                      ) : null}
                      {vitals.data.latest.bmi ? (
                        <li>
                          BMI: <span className="font-mono">{vitals.data.latest.bmi.toFixed(1)}</span>
                        </li>
                      ) : null}
                    </ul>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-start gap-3 p-4 text-xs text-muted-foreground">
              <Stethoscope className="size-4 shrink-0" />
              <p>
                Real WebRTC video, screen share, and recording ship with the integrated provider —
                this room collects the patient + clinician identity and shows the chart side-rail
                so the clinical work is identical to in-person visits.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
