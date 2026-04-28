import { useEffect, useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'

import { useUnitPreference } from '@/shared/hooks/useUnitPreference'
import { computeBmi, fToC, cToF, lbToKg, kgToLb, inToCm, cmToIn } from '@/shared/lib/units'
import { BidiNum } from '@/shared/lib/bidi'

import type { VitalsEntryInput } from '../api/medical.contracts'

type Props = {
  patientId: string
  /** Pediatric? Adds head-circumference field. */
  isPeds: boolean
  /** Pediatric weight age band — drives the dosing-required hint. */
  showWeightRequiredHint?: boolean
  onSubmit: (input: VitalsEntryInput) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  /** Provide the encounterId when used inside an encounter shell. */
  encounterId?: string | null
  className?: string
}

type FieldState = {
  systolic: string
  diastolic: string
  hr: string
  rr: string
  spo2: string
  temp: string
  weight: string
  height: string
  pain: string
  hc: string
}

const EMPTY: FieldState = {
  systolic: '',
  diastolic: '',
  hr: '',
  rr: '',
  spo2: '',
  temp: '',
  weight: '',
  height: '',
  pain: '',
  hc: '',
}

/**
 * Vitals recorder. Always renders inputs in the tenant's preferred unit
 * system, then converts to canonical SI before submitting so the stored
 * value is lossless. Per medical-rule §1: storage stays canonical, only
 * display flips with the toggle.
 */
export function VitalsRecorder({
  patientId,
  isPeds,
  showWeightRequiredHint,
  onSubmit,
  onCancel,
  isSubmitting,
  encounterId,
  className,
}: Props) {
  const u = useUnitPreference()
  const [s, setS] = useState<FieldState>(EMPTY)

  // BMI live preview
  let liveBmi: number | null = null
  if (s.weight && s.height) {
    const wRaw = Number(s.weight)
    const hRaw = Number(s.height)
    if (!Number.isNaN(wRaw) && !Number.isNaN(hRaw) && wRaw > 0 && hRaw > 0) {
      const wKg = u.units === 'us' ? lbToKg(wRaw) : wRaw
      const hCm = u.units === 'us' ? inToCm(hRaw) : hRaw
      liveBmi = computeBmi(wKg, hCm)
    }
  }

  // When the user flips unit system, convert the in-progress entries so
  // they don't have to retype.
  const lastUnitsRef = useState<'metric' | 'us'>(u.units)
  useEffect(() => {
    const prev = lastUnitsRef[0]
    if (prev === u.units) return
    setS((cur) => {
      let next = { ...cur }
      const wNum = cur.weight ? Number(cur.weight) : NaN
      const hNum = cur.height ? Number(cur.height) : NaN
      const tNum = cur.temp ? Number(cur.temp) : NaN
      if (!Number.isNaN(wNum)) {
        next.weight = String(
          (u.units === 'us' ? kgToLb(wNum) : lbToKg(wNum)).toFixed(1),
        )
      }
      if (!Number.isNaN(hNum)) {
        next.height = String(
          (u.units === 'us' ? cmToIn(hNum) : inToCm(hNum)).toFixed(1),
        )
      }
      if (!Number.isNaN(tNum)) {
        next.temp = String((u.units === 'us' ? cToF(tNum) : fToC(tNum)).toFixed(1))
      }
      return next
    })
    lastUnitsRef[1](u.units)
  }, [u.units, lastUnitsRef])

  function build(): VitalsEntryInput {
    const wKg = s.weight
      ? u.units === 'us'
        ? lbToKg(Number(s.weight))
        : Number(s.weight)
      : null
    const hCm = s.height
      ? u.units === 'us'
        ? inToCm(Number(s.height))
        : Number(s.height)
      : null
    const tC = s.temp
      ? u.units === 'us'
        ? fToC(Number(s.temp))
        : Number(s.temp)
      : null
    const hcCm = s.hc ? (u.units === 'us' ? inToCm(Number(s.hc)) : Number(s.hc)) : null
    return {
      patientId,
      encounterId: encounterId ?? null,
      effectiveDateTime: new Date().toISOString(),
      systolic: s.systolic ? Number(s.systolic) : null,
      diastolic: s.diastolic ? Number(s.diastolic) : null,
      heartRate: s.hr ? Number(s.hr) : null,
      respiratoryRate: s.rr ? Number(s.rr) : null,
      spo2: s.spo2 ? Number(s.spo2) : null,
      temperatureC: tC,
      weightKg: wKg,
      heightCm: hCm,
      painScore: s.pain ? Number(s.pain) : null,
      headCircumferenceCm: hcCm,
    }
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field
            label="BP (sys/dia)"
            unit="mmHg"
            inputs={
              <div className="flex items-center gap-1.5">
                <Input
                  inputMode="numeric"
                  aria-label="Systolic"
                  value={s.systolic}
                  onChange={(e) => setS({ ...s, systolic: e.target.value })}
                  className="h-9 text-center tabular-nums"
                />
                <span className="text-muted-foreground">/</span>
                <Input
                  inputMode="numeric"
                  aria-label="Diastolic"
                  value={s.diastolic}
                  onChange={(e) => setS({ ...s, diastolic: e.target.value })}
                  className="h-9 text-center tabular-nums"
                />
              </div>
            }
          />
          <NumField label="HR" unit="/min" value={s.hr} onChange={(v) => setS({ ...s, hr: v })} />
          <NumField
            label="RR"
            unit="/min"
            value={s.rr}
            onChange={(v) => setS({ ...s, rr: v })}
          />
          <NumField
            label="SpO₂"
            unit="%"
            value={s.spo2}
            onChange={(v) => setS({ ...s, spo2: v })}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <NumField
            label="Temp"
            unit={u.preferred('temperature')}
            value={s.temp}
            onChange={(v) => setS({ ...s, temp: v })}
          />
          <NumField
            label="Weight"
            unit={u.preferred('weight')}
            value={s.weight}
            onChange={(v) => setS({ ...s, weight: v })}
            requiredHint={showWeightRequiredHint && !s.weight ? 'Required for peds prescribing' : undefined}
          />
          <NumField
            label="Height"
            unit={u.preferred('height')}
            value={s.height}
            onChange={(v) => setS({ ...s, height: v })}
          />
          <NumField
            label="Pain (0–10)"
            value={s.pain}
            onChange={(v) => setS({ ...s, pain: v })}
            max={10}
          />
        </div>

        {isPeds ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <NumField
              label="Head circumference"
              unit={u.units === 'us' ? 'in' : 'cm'}
              value={s.hc}
              onChange={(v) => setS({ ...s, hc: v })}
            />
          </div>
        ) : null}

        {liveBmi != null ? (
          <p className="text-xs text-muted-foreground">
            BMI <BidiNum className="font-semibold tabular-nums">{liveBmi.toFixed(1)}</BidiNum>{' '}
            <span className="text-muted-foreground/70">(computed)</span>
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          <Button type="button" variant="ghost" onClick={() => setS(EMPTY)}>
            <RotateCcw /> Clear
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="button" onClick={() => onSubmit(build())} disabled={isSubmitting}>
            <Save /> {isSubmitting ? 'Recording…' : 'Record vitals'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  unit,
  inputs,
}: {
  label: string
  unit?: string
  inputs: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label}
        {unit ? <span className="ms-1 font-normal text-muted-foreground">{unit}</span> : null}
      </Label>
      {inputs}
    </div>
  )
}

function NumField({
  label,
  unit,
  value,
  onChange,
  requiredHint,
  max,
}: {
  label: string
  unit?: string
  value: string
  onChange: (v: string) => void
  requiredHint?: string
  max?: number
}) {
  return (
    <Field
      label={label}
      unit={unit}
      inputs={
        <>
          <Input
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            max={max}
            className="h-9 text-center tabular-nums"
          />
          {requiredHint ? (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">{requiredHint}</p>
          ) : null}
        </>
      }
    />
  )
}
