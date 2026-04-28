import { Link } from 'react-router'
import {
  Activity,
  AlertTriangle,
  Baby,
  BadgeCheck,
  Eye,
  Languages,
  Pill,
  ShieldAlert,
  Star,
  TriangleAlert,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'

import { BidiCode, BidiNum } from '@/shared/lib/bidi'
import { useUnitPreference } from '@/shared/hooks/useUnitPreference'

import type { PatientDetail } from '../api/medical.contracts'
import { HijriDate } from './HijriDate'

type Props = {
  detail: PatientDetail
  /** Visible when the active user has audit:view. */
  onPeekAudit?: () => void
  className?: string
}

/**
 * Always-on banner above every chart. Carries the high-stakes signals
 * — patient identity, allergies, age band, peds-weight staleness,
 * pregnancy status, latest vitals, active problems and meds — at a
 * glance. Below-the-fold sections must never duplicate or contradict
 * what's here.
 */
export function PatientStoryboard({ detail, onPeekAudit, className }: Props) {
  const u = useUnitPreference()
  const { patient, primaryProviderName, age, ageBand, snapshot } = detail
  const initials = `${patient.name.given[0] ?? ''}${patient.name.family[0] ?? ''}`.toUpperCase()
  const fullName = `${patient.name.preferred ?? patient.name.given} ${patient.name.family}`
  const bp =
    snapshot.latestVitals?.systolic && snapshot.latestVitals.diastolic
      ? `${snapshot.latestVitals.systolic}/${snapshot.latestVitals.diastolic}`
      : null
  const tempC = snapshot.latestVitals?.temperatureC
  const tempDisplay = tempC !== undefined && tempC !== null ? u.display('temperature', tempC, '°C') : null
  const weightDisplay =
    snapshot.latestVitals?.weightKg != null
      ? u.display('weight', snapshot.latestVitals.weightKg, 'kg')
      : null
  const heightDisplay =
    snapshot.latestVitals?.heightCm != null
      ? u.display('height', snapshot.latestVitals.heightCm, 'cm')
      : null

  const highAllergies = snapshot.activeAllergies.filter((a) => a.criticality === 'high')
  const isPeds = age < 18
  const isStaleWeight =
    isPeds && snapshot.pedsWeightStaleDays !== null && snapshot.pedsWeightStaleDays > 30

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-start gap-4 p-4 md:p-5">
          {/* identity */}
          <div className="flex items-center gap-3">
            <Avatar className="size-14">
              <AvatarFallback className="text-base font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold leading-tight">{fullName}</h2>
                {patient.flags.includes('vip') ? (
                  <Badge className="gap-1">
                    <Star className="size-3" /> VIP
                  </Badge>
                ) : null}
                {patient.flags.includes('sensitive_record') ? (
                  <Badge variant="destructive" className="gap-1">
                    <ShieldAlert className="size-3" /> Sensitive
                  </Badge>
                ) : null}
                {patient.flags.includes('fall_risk') ? (
                  <Badge variant="outline" className="gap-1">
                    <TriangleAlert className="size-3" /> Fall risk
                  </Badge>
                ) : null}
                {patient.flags.includes('dnr') ? (
                  <Badge variant="destructive">DNR</Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                <BidiCode>{patient.mrn}</BidiCode>
                <span className="mx-1.5">·</span>
                <span className="capitalize">{patient.sexAtBirth}</span>
                {patient.pronouns ? (
                  <span className="text-muted-foreground/80"> ({patient.pronouns})</span>
                ) : null}
                <span className="mx-1.5">·</span>
                <BidiNum>{age}y</BidiNum>
                <span className="ms-1 text-muted-foreground/70 capitalize">({ageBand})</span>
              </p>
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>DOB</span>
                <HijriDate date={patient.dateOfBirth} inline />
                {primaryProviderName ? (
                  <>
                    <span className="mx-1">·</span>
                    <span>{primaryProviderName}</span>
                  </>
                ) : null}
                {patient.interpreterNeeded ? (
                  <Badge variant="outline" className="ms-1 gap-1 text-[10px]">
                    <Languages className="size-3" /> {patient.preferredLanguage} · interpreter
                  </Badge>
                ) : null}
              </p>
            </div>
          </div>

          {/* vitals snapshot */}
          {snapshot.latestVitals ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 ms-auto text-sm">
              {bp ? (
                <Stat label="BP" value={<BidiNum>{bp}</BidiNum>} unit="mmHg" />
              ) : null}
              {snapshot.latestVitals.heartRate != null ? (
                <Stat label="HR" value={<BidiNum>{snapshot.latestVitals.heartRate}</BidiNum>} unit="/min" />
              ) : null}
              {tempDisplay ? (
                <Stat
                  label="Temp"
                  value={<BidiNum>{tempDisplay.value.toFixed(1)}</BidiNum>}
                  unit={tempDisplay.unit}
                />
              ) : null}
              {weightDisplay ? (
                <Stat
                  label="Wt"
                  value={<BidiNum>{weightDisplay.value.toFixed(1)}</BidiNum>}
                  unit={weightDisplay.unit}
                  staleHint={isStaleWeight ? `${snapshot.pedsWeightStaleDays}d old` : undefined}
                />
              ) : null}
              {heightDisplay ? (
                <Stat
                  label="Ht"
                  value={<BidiNum>{heightDisplay.value.toFixed(1)}</BidiNum>}
                  unit={heightDisplay.unit}
                />
              ) : null}
              {snapshot.latestVitals.bmi != null ? (
                <Stat label="BMI" value={<BidiNum>{snapshot.latestVitals.bmi.toFixed(1)}</BidiNum>} />
              ) : null}
              {onPeekAudit ? (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onPeekAudit} aria-label="Recent chart accesses">
                        <Eye className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Recent chart accesses</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 md:p-5">
          {/* allergies */}
          <Section
            icon={<ShieldAlert className="size-4" />}
            title="Allergies"
            tone={highAllergies.length > 0 ? 'rose' : 'muted'}
          >
            {snapshot.activeAllergies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No allergies on file</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {snapshot.activeAllergies.map((a) => (
                  <li key={a.substance.code} className="flex flex-wrap items-baseline gap-1.5">
                    {a.criticality === 'high' ? (
                      <Badge variant="destructive" className="text-[10px]">
                        HIGH
                      </Badge>
                    ) : null}
                    <span className="font-medium">{a.substance.display}</span>
                    {a.reactionText ? (
                      <span className="text-xs text-muted-foreground">— {a.reactionText}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* problems */}
          <Section icon={<Activity className="size-4" />} title="Active problems">
            {snapshot.activeProblems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active problems</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {snapshot.activeProblems.slice(0, 6).map((c) => (
                  <li key={c.code} className="flex items-baseline gap-1.5">
                    <BidiCode className="text-xs text-muted-foreground">{c.code}</BidiCode>
                    <span>{c.display}</span>
                  </li>
                ))}
                {snapshot.activeProblems.length > 6 ? (
                  <li className="text-xs text-muted-foreground">
                    + {snapshot.activeProblems.length - 6} more
                  </li>
                ) : null}
              </ul>
            )}
          </Section>

          {/* meds */}
          <Section icon={<Pill className="size-4" />} title="Active medications">
            {snapshot.activeMedications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active medications</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {snapshot.activeMedications.slice(0, 6).map((m, idx) => (
                  <li key={`${m.medication.code}-${idx}`} className="space-y-0.5">
                    {/* never-truncate drug name — wrap rather than ellipsis */}
                    <p className="break-words font-medium leading-tight">
                      {m.medication.display}
                      <span className="ms-1 text-muted-foreground">{m.strengthLabel}</span>
                    </p>
                    <p className="break-words text-xs text-muted-foreground">{m.dosageText}</p>
                  </li>
                ))}
                {snapshot.activeMedications.length > 6 ? (
                  <li className="text-xs text-muted-foreground">
                    + {snapshot.activeMedications.length - 6} more
                  </li>
                ) : null}
              </ul>
            )}
          </Section>
        </div>

        {/* peds + OB strips */}
        {snapshot.activePregnancy || isStaleWeight ? (
          <>
            <Separator />
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-5">
              {snapshot.activePregnancy ? (
                <Badge variant="outline" className="gap-1.5 border-fuchsia-500/40 bg-fuchsia-500/5 text-fuchsia-700 dark:text-fuchsia-300">
                  <Baby className="size-3.5" />
                  <BidiNum>{snapshot.activePregnancy.gaWeeks}</BidiNum>w{' '}
                  <BidiNum>{snapshot.activePregnancy.gaDays}</BidiNum>d · G
                  <BidiNum>{snapshot.activePregnancy.gravida}</BidiNum>P
                  <BidiNum>{snapshot.activePregnancy.para}</BidiNum>
                </Badge>
              ) : null}
              {isStaleWeight ? (
                <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="size-3.5" />
                  <span className="font-medium">Pediatric weight is stale —</span>
                  <BidiNum className="font-semibold">{snapshot.pedsWeightStaleDays}d</BidiNum>
                  <span>old. Required for prescribing.</span>
                  <Button asChild size="sm" variant="outline" className="ms-1 h-6">
                    <Link to={`/app/medical/patients/${patient.id}/vitals`}>Record now</Link>
                  </Button>
                </div>
              ) : null}
              {patient.flags.includes('allergy_high') ? (
                <Badge variant="destructive" className="gap-1">
                  <BadgeCheck className="size-3" /> High-risk allergy
                </Badge>
              ) : null}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
  unit,
  staleHint,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  staleHint?: string
}) {
  return (
    <div className="flex flex-col items-start leading-tight">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-base font-semibold tabular-nums">
        {value}
        {unit ? <span className="ms-0.5 text-xs font-normal text-muted-foreground">{unit}</span> : null}
      </span>
      {staleHint ? (
        <span className="text-[10px] text-amber-600 dark:text-amber-400">{staleHint}</span>
      ) : null}
    </div>
  )
}

function Section({
  icon,
  title,
  tone = 'muted',
  children,
}: {
  icon: React.ReactNode
  title: string
  tone?: 'rose' | 'muted'
  children: React.ReactNode
}) {
  return (
    <div className={cn('rounded-md border p-3', tone === 'rose' && 'border-rose-500/40 bg-rose-500/5')}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  )
}
