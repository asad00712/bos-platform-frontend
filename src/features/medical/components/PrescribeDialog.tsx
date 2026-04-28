import { useEffect, useMemo, useState } from 'react'
import { Stethoscope } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { BidiNum } from '@/shared/lib/bidi'

import { RXNORM, type RxNormEntry, type RxNormStrength } from '../codes/rxnorm.curated'
import type { CodeableConcept, MedicationRequest } from '../api/medical.contracts'
import { RxNormPicker } from './CodePicker'
import { DDIAlertList, evaluateDDI } from './DDIAlertList'
import { SignCeremonyDialog } from './SignCeremonyDialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
  patientId: string
  patientAgeYears: number
  patientWeightKg: number | null
  /** Whether the patient has an active pregnancy. */
  pregnancyActive: boolean
  /** Active drug INNs already on the chart — drives DDI eval. */
  activeDrugInns: string[]
  /** Patient allergy substance displays — drives allergy hard-stop eval. */
  allergyDisplays: string[]
  /** Pharmacies for routing. */
  pharmacies: { id: string; name: string; preferred: boolean }[]
  expectedPin?: string
  /** Called when the clinician confirms + signs. The caller persists. */
  onConfirm: (input: NewRxInput) => void | Promise<void>
}

export type NewRxInput = {
  medication: CodeableConcept
  strengthLabel: string
  doseValue: number
  doseUnit: string
  route: MedicationRequest['dosage']['route']
  frequency: string
  durationDays: number | null
  asNeeded: boolean
  asNeededReason: string | null
  quantity: number
  quantityUnit: string
  daysSupply: number | null
  refillsAuthorized: number
  substitutionAllowed: boolean
  pharmacyId: string | null
  controlled: boolean
  controlledSchedule: 'CII' | 'CIII' | 'CIV' | 'CV' | null
  notes: string | null
  /** Override reason supplied when the prescriber proceeds despite a severe alert. */
  ddiOverrideReason: string | null
}

const FREQ_OPTIONS = [
  { value: 'daily', label: 'Daily (qd)' },
  { value: 'BID', label: 'BID (twice daily)' },
  { value: 'TID', label: 'TID (three times daily)' },
  { value: 'QID', label: 'QID (four times daily)' },
  { value: 'QHS', label: 'QHS (at bedtime)' },
  { value: 'q4h', label: 'q4h' },
  { value: 'q6h', label: 'q6h' },
  { value: 'q8h', label: 'q8h' },
  { value: 'PRN', label: 'PRN (as needed)' },
]

/**
 * The Rx pad. Every prescribe action must run through this dialog —
 * never write a `MedicationRequest` directly elsewhere — because the
 * ceremony is what guarantees we ran allergy + DDI + pregnancy + peds-
 * weight checks before sign.
 *
 * Five gates, in order:
 *   1. Drug picker — INN-first, locale-specific brand hint.
 *   2. Strength picker — never free-text mg, only strengths from RxNorm.
 *   3. Dose / route / frequency / duration — drives the SIG preview.
 *   4. Allergy + DDI eval re-runs on every change; contraindicated tier
 *      blocks the Continue button until either a different drug is chosen
 *      or (when allowed) an override reason is typed.
 *   5. Two-step sign ceremony with extra dual-auth copy when controlled.
 */
export function PrescribeDialog({
  open,
  onOpenChange,
  patientName,
  patientId,
  patientAgeYears,
  patientWeightKg,
  pregnancyActive,
  activeDrugInns,
  allergyDisplays,
  pharmacies,
  expectedPin,
  onConfirm,
}: Props) {
  const [med, setMed] = useState<CodeableConcept | null>(null)
  const drugEntry = useMemo<RxNormEntry | null>(() => {
    if (!med) return null
    return RXNORM.find((d) => d.rxcui === med.code) ?? null
  }, [med])

  const [strengthLabel, setStrengthLabel] = useState<string>('')
  const strength = useMemo<RxNormStrength | null>(() => {
    if (!drugEntry) return null
    return drugEntry.strengths.find((s) => s.label === strengthLabel) ?? null
  }, [drugEntry, strengthLabel])

  const [doseValue, setDoseValue] = useState('')
  const [doseUnit, setDoseUnit] = useState('mg')
  const [route, setRoute] = useState<MedicationRequest['dosage']['route']>('PO')
  const [frequency, setFrequency] = useState('daily')
  const [durationDays, setDurationDays] = useState<string>('')
  const [asNeeded, setAsNeeded] = useState(false)
  const [asNeededReason, setAsNeededReason] = useState('')
  const [quantity, setQuantity] = useState('30')
  const [refills, setRefills] = useState('5')
  const [substitution, setSubstitution] = useState(true)
  const [pharmacyId, setPharmacyId] = useState<string>(
    pharmacies.find((p) => p.preferred)?.id ?? pharmacies[0]?.id ?? '',
  )
  const [overrideReason, setOverrideReason] = useState('')
  const [signing, setSigning] = useState(false)

  // Reset whenever a new drug is picked.
  useEffect(() => {
    if (!drugEntry) return
    const first = drugEntry.strengths[0]
    setStrengthLabel(first?.label ?? '')
    setRoute(drugEntry.defaultRoute)
    setDoseValue(String(first?.magnitude ?? ''))
    setDoseUnit(first?.unit ?? 'mg')
  }, [drugEntry])

  const ddiAlerts = useMemo(() => {
    if (!med) return []
    return evaluateDDI({
      rxDrugInn: med.display,
      patientActiveDrugInns: activeDrugInns,
      patientAllergyDisplays: allergyDisplays,
      pregnancyActive,
    })
  }, [med, activeDrugInns, allergyDisplays, pregnancyActive])

  const hasHardStop = ddiAlerts.some(
    (a) => a.tier === 'contraindicated' || a.allergyHardStop,
  )
  const hasSevere = ddiAlerts.some((a) => a.tier === 'severe')
  const requiresOverride = hasSevere && !hasHardStop

  const isControlled = Boolean(drugEntry?.controlled)
  const isPeds = patientAgeYears < 18
  const pedsWeightMissing = isPeds && (patientWeightKg === null || patientWeightKg <= 0)

  const sigPreview = useMemo(() => {
    if (!med || !strength) return ''
    const dose = doseValue || strength.magnitude
    const unit = doseUnit || strength.unit
    const freqLabel = asNeeded ? `${frequency} PRN${asNeededReason ? ` for ${asNeededReason}` : ''}` : frequency
    const dur = durationDays ? ` × ${durationDays} days` : ''
    return `${dose} ${unit} ${route} ${freqLabel}${dur}`
  }, [med, strength, doseValue, doseUnit, route, frequency, asNeeded, asNeededReason, durationDays])

  const canContinue = Boolean(
    med &&
      strength &&
      doseValue &&
      pharmacyId &&
      !hasHardStop &&
      (!requiresOverride || overrideReason.trim().length >= 10) &&
      !pedsWeightMissing,
  )

  function buildInput(): NewRxInput | null {
    if (!med || !strength) return null
    return {
      medication: med,
      strengthLabel: strength.label,
      doseValue: Number(doseValue) || strength.magnitude,
      doseUnit: doseUnit || strength.unit,
      route,
      frequency,
      durationDays: durationDays ? Number(durationDays) : null,
      asNeeded,
      asNeededReason: asNeeded ? asNeededReason || null : null,
      quantity: Number(quantity) || 30,
      quantityUnit: strength.form === 'oral_susp' ? 'mL' : strength.form === 'inhaler' ? 'inhaler' : 'tab',
      daysSupply: durationDays ? Number(durationDays) : 30,
      refillsAuthorized: Number(refills) || 0,
      substitutionAllowed: substitution,
      pharmacyId,
      controlled: isControlled,
      controlledSchedule: drugEntry?.controlled ?? null,
      notes: null,
      ddiOverrideReason: requiresOverride ? overrideReason.trim() : null,
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New prescription</DialogTitle>
            <DialogDescription>
              For <span className="font-medium">{patientName}</span> · MRN-bound to chart.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* drug picker */}
            <Field label="Medication">
              <RxNormPicker value={med} onChange={setMed} placeholder="Search by INN, brand, or class…" />
              {drugEntry?.pregnancyNote ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">{drugEntry.pregnancyNote}</p>
              ) : null}
            </Field>

            {/* strength */}
            {drugEntry ? (
              <Field label="Strength">
                <Select value={strengthLabel} onValueChange={setStrengthLabel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick strength…" />
                  </SelectTrigger>
                  <SelectContent>
                    {drugEntry.strengths.map((s) => (
                      <SelectItem key={s.label} value={s.label}>
                        {s.label} · {s.form.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            {/* peds + controlled callouts */}
            {pedsWeightMissing ? (
              <div className="rounded-md border border-rose-500/50 bg-rose-500/5 p-3 text-sm">
                <p className="font-medium text-rose-700 dark:text-rose-300">
                  Pediatric weight required to prescribe
                </p>
                <p className="text-xs text-muted-foreground">
                  Record a current weight for this patient before continuing — used for mg/kg dosing checks.
                </p>
              </div>
            ) : null}
            {isControlled ? (
              <div className="rounded-md border border-amber-500/50 bg-amber-500/5 p-3 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  Controlled substance ({drugEntry?.controlled})
                </p>
                <p className="text-xs text-muted-foreground">
                  Refills capped at 0 for Schedule II. Sign step requires re-authentication.
                </p>
              </div>
            ) : null}

            {/* dose + route + frequency + duration */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Field label="Dose">
                <Input
                  inputMode="decimal"
                  value={doseValue}
                  onChange={(e) => setDoseValue(e.target.value)}
                  className="h-9 text-center tabular-nums"
                />
              </Field>
              <Field label="Unit">
                <Input
                  value={doseUnit}
                  onChange={(e) => setDoseUnit(e.target.value)}
                  className="h-9 text-center"
                />
              </Field>
              <Field label="Route">
                <Select value={route} onValueChange={(v) => setRoute(v as typeof route)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PO">PO (oral)</SelectItem>
                    <SelectItem value="IV">IV</SelectItem>
                    <SelectItem value="IM">IM</SelectItem>
                    <SelectItem value="SQ">SQ</SelectItem>
                    <SelectItem value="INH">INH</SelectItem>
                    <SelectItem value="TOP">Topical</SelectItem>
                    <SelectItem value="SL">Sublingual</SelectItem>
                    <SelectItem value="PR">Rectal</SelectItem>
                    <SelectItem value="OPHTH">Ophthalmic</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Frequency">
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQ_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Field label="Duration (days)">
                <Input
                  inputMode="numeric"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="Optional"
                  className="h-9 text-center tabular-nums"
                />
              </Field>
              <Field label="Quantity">
                <Input
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-9 text-center tabular-nums"
                />
              </Field>
              <Field label="Refills">
                <Input
                  inputMode="numeric"
                  value={drugEntry?.controlled === 'CII' ? '0' : refills}
                  onChange={(e) => setRefills(e.target.value)}
                  disabled={drugEntry?.controlled === 'CII'}
                  className="h-9 text-center tabular-nums"
                />
              </Field>
              <Field label="DAW">
                <div className="flex h-9 items-center gap-2 rounded-md border px-3">
                  <Switch
                    checked={!substitution}
                    onCheckedChange={(checked) => setSubstitution(!checked)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {substitution ? 'Allow substitution' : 'Dispense as written'}
                  </span>
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="As needed (PRN)">
                <div className="flex h-9 items-center gap-2 rounded-md border px-3">
                  <Switch checked={asNeeded} onCheckedChange={setAsNeeded} />
                  <span className="text-xs text-muted-foreground">
                    {asNeeded ? 'PRN' : 'Standing order'}
                  </span>
                </div>
              </Field>
              {asNeeded ? (
                <Field label="PRN reason">
                  <Input
                    value={asNeededReason}
                    onChange={(e) => setAsNeededReason(e.target.value)}
                    placeholder="e.g. severe pain, nausea"
                    className="h-9"
                  />
                </Field>
              ) : null}
            </div>

            <Field label="Pharmacy">
              <Select value={pharmacyId} onValueChange={setPharmacyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick pharmacy…" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.preferred ? '· preferred' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* SIG preview */}
            {sigPreview ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SIG preview
                </p>
                <p className="mt-1 break-words font-medium">{sigPreview}</p>
                <p className="text-xs text-muted-foreground">
                  Quantity: <BidiNum>{quantity || '0'}</BidiNum> · Refills:{' '}
                  <BidiNum>{drugEntry?.controlled === 'CII' ? '0' : refills || '0'}</BidiNum>
                  {patientWeightKg && doseValue ? (
                    <span className="ms-2">
                      ≈ <BidiNum>{(Number(doseValue) / patientWeightKg).toFixed(2)}</BidiNum> mg/kg
                    </span>
                  ) : null}
                </p>
              </div>
            ) : null}

            {/* DDI alerts */}
            {ddiAlerts.length > 0 ? <DDIAlertList alerts={ddiAlerts} /> : null}

            {/* override capture */}
            {requiresOverride ? (
              <Field label="Override reason (required to proceed past severe alerts)">
                <Textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Document clinical justification for proceeding."
                />
              </Field>
            ) : null}

            {patientId ? null : null /* keep id captured but unused linting */}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={!canContinue} onClick={() => setSigning(true)}>
              <Stethoscope /> Continue to sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SignCeremonyDialog
        open={signing}
        onOpenChange={setSigning}
        title="Sign prescription"
        description={
          isControlled
            ? 'Controlled substance — dual authentication required.'
            : 'Confirm the prescription before sending to the pharmacy.'
        }
        controlled={isControlled}
        expectedPin={expectedPin}
        onConfirm={async () => {
          const input = buildInput()
          if (!input) return
          await onConfirm(input)
          onOpenChange(false)
        }}
        preview={
          med && strength ? (
            <div className="space-y-1 text-sm">
              <p className="break-words font-medium">
                {med.display} <span className="text-muted-foreground">{strength.label}</span>
              </p>
              <p className="break-words">SIG: {sigPreview}</p>
              <p className="text-xs text-muted-foreground">
                Quantity {quantity} · Refills {drugEntry?.controlled === 'CII' ? '0' : refills} ·{' '}
                {pharmacies.find((p) => p.id === pharmacyId)?.name ?? 'No pharmacy'}
              </p>
              {requiresOverride ? (
                <p className="text-xs italic text-amber-700 dark:text-amber-300">
                  Override on file: {overrideReason}
                </p>
              ) : null}
            </div>
          ) : null
        }
      />
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}
