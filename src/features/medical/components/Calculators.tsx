/**
 * Bedside calculators rendered as small cards. Pure functions + tiny UI;
 * each carries a citation footnote so the clinician knows where the
 * coefficients come from. Calculators are gated by feature flag in the
 * caller; this file only contains the math + presentation.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { computeBmi } from '@/shared/lib/units'
import { BidiNum } from '@/shared/lib/bidi'

/* ==================== BMI ==================== */

export function BmiCalculator({ weightKg, heightCm }: { weightKg?: number; heightCm?: number }) {
  const [w, setW] = useState(weightKg ? String(weightKg) : '')
  const [h, setH] = useState(heightCm ? String(heightCm) : '')
  const wn = Number(w)
  const hn = Number(h)
  const bmi = wn > 0 && hn > 0 ? computeBmi(wn, hn) : null
  const cat = bmi == null ? null : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
  return (
    <CalcCard title="BMI" footnote="WHO BMI categories.">
      <Row label="Weight (kg)" inline>
        <Input value={w} onChange={(e) => setW(e.target.value)} className="h-8 w-24 tabular-nums" inputMode="decimal" />
      </Row>
      <Row label="Height (cm)" inline>
        <Input value={h} onChange={(e) => setH(e.target.value)} className="h-8 w-24 tabular-nums" inputMode="decimal" />
      </Row>
      <Result label="BMI" value={bmi != null ? <><BidiNum>{bmi.toFixed(1)}</BidiNum> kg/m²</> : '—'} sub={cat ?? undefined} />
    </CalcCard>
  )
}

/* ==================== EDD (Naegele's rule) ==================== */

export function EddCalculator({ lmpDate }: { lmpDate?: string }) {
  const [lmp, setLmp] = useState(lmpDate ?? '')
  let edd = ''
  let ga = ''
  if (lmp) {
    const d = new Date(lmp)
    if (!Number.isNaN(d.getTime())) {
      const eddDt = new Date(d)
      eddDt.setUTCDate(eddDt.getUTCDate() + 280)
      edd = eddDt.toISOString().slice(0, 10)
      const days = Math.floor((Date.now() - d.getTime()) / 86400000)
      const wk = Math.floor(days / 7)
      const dy = days % 7
      ga = `${wk}w ${dy}d`
    }
  }
  return (
    <CalcCard title="EDD (Naegele)" footnote="LMP + 280 days. Confirm with first-trimester US.">
      <Row label="LMP" inline>
        <Input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="h-8" />
      </Row>
      <Result label="EDD" value={edd || '—'} sub={ga ? `Current GA ${ga}` : undefined} />
    </CalcCard>
  )
}

/* ==================== Creatinine clearance (Cockcroft-Gault) ==================== */

export function CrClCalculator({
  ageYears,
  weightKg,
  creatinineMgDl,
  female,
}: {
  ageYears?: number
  weightKg?: number
  creatinineMgDl?: number
  female?: boolean
}) {
  const [age, setAge] = useState(ageYears ? String(ageYears) : '')
  const [w, setW] = useState(weightKg ? String(weightKg) : '')
  const [cr, setCr] = useState(creatinineMgDl ? String(creatinineMgDl) : '')
  const [isFemale, setIsFemale] = useState(female ?? false)
  const a = Number(age)
  const wn = Number(w)
  const c = Number(cr)
  const cl = a > 0 && wn > 0 && c > 0 ? ((140 - a) * wn) / (72 * c) * (isFemale ? 0.85 : 1) : null
  return (
    <CalcCard title="CrCl (Cockcroft-Gault)" footnote="Use IBW for obese. Renal-dose checks below 30 mL/min.">
      <Row label="Age (yr)" inline>
        <Input value={age} onChange={(e) => setAge(e.target.value)} className="h-8 w-20 tabular-nums" inputMode="numeric" />
      </Row>
      <Row label="Weight (kg)" inline>
        <Input value={w} onChange={(e) => setW(e.target.value)} className="h-8 w-20 tabular-nums" inputMode="decimal" />
      </Row>
      <Row label="Creatinine (mg/dL)" inline>
        <Input value={cr} onChange={(e) => setCr(e.target.value)} className="h-8 w-20 tabular-nums" inputMode="decimal" />
      </Row>
      <Row label="Female" inline>
        <Switch checked={isFemale} onCheckedChange={setIsFemale} />
      </Row>
      <Result label="CrCl" value={cl != null ? <><BidiNum>{cl.toFixed(0)}</BidiNum> mL/min</> : '—'} />
    </CalcCard>
  )
}

/* ==================== CHA2DS2-VASc ==================== */

const CHADSVASC_FIELDS: { key: string; label: string; weight: 1 | 2 }[] = [
  { key: 'chf', label: 'CHF / LV dysfunction', weight: 1 },
  { key: 'htn', label: 'Hypertension', weight: 1 },
  { key: 'age75', label: 'Age ≥ 75', weight: 2 },
  { key: 'dm', label: 'Diabetes', weight: 1 },
  { key: 'stroke', label: 'Stroke / TIA / TE', weight: 2 },
  { key: 'vasc', label: 'Vascular disease (MI, PAD, plaque)', weight: 1 },
  { key: 'age65', label: 'Age 65–74', weight: 1 },
  { key: 'female', label: 'Female sex', weight: 1 },
]

export function ChadsVasc() {
  const [v, setV] = useState<Record<string, boolean>>({})
  const score = CHADSVASC_FIELDS.reduce((s, f) => s + (v[f.key] ? f.weight : 0), 0)
  const risk = score === 0 ? '0% / yr' : score === 1 ? '~1.3% / yr' : score === 2 ? '~2.2% / yr' : score >= 5 ? '≥6.7% / yr' : '~3.2–4.0% / yr'
  return (
    <CalcCard title="CHA₂DS₂-VASc" footnote="Score ≥2 (men) or ≥3 (women) typically warrants OAC; clinical judgment applies.">
      <ul className="space-y-1 text-sm">
        {CHADSVASC_FIELDS.map((f) => (
          <li key={f.key}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!v[f.key]}
                onChange={(e) => setV({ ...v, [f.key]: e.target.checked })}
                className="size-4"
              />
              <span>{f.label}</span>
              <span className="ms-auto text-xs text-muted-foreground">+{f.weight}</span>
            </label>
          </li>
        ))}
      </ul>
      <Result label="Score" value={<BidiNum>{String(score)}</BidiNum>} sub={`Annual stroke risk ${risk}`} />
    </CalcCard>
  )
}

/* ==================== HAS-BLED ==================== */

const HASBLED_FIELDS: { key: string; label: string }[] = [
  { key: 'h', label: 'Hypertension uncontrolled' },
  { key: 'a', label: 'Abnormal renal/liver function (1 each)' },
  { key: 's', label: 'Stroke history' },
  { key: 'b', label: 'Bleeding history / predisposition' },
  { key: 'l', label: 'Labile INR' },
  { key: 'e', label: 'Elderly (>65)' },
  { key: 'd', label: 'Drugs/alcohol concomitantly (1 each)' },
]

export function HasBled() {
  const [v, setV] = useState<Record<string, boolean>>({})
  const score = HASBLED_FIELDS.reduce((s, f) => s + (v[f.key] ? 1 : 0), 0)
  return (
    <CalcCard title="HAS-BLED" footnote="≥3 → high bleeding risk; not a contra-indication, prompts modifiable factor review.">
      <ul className="space-y-1 text-sm">
        {HASBLED_FIELDS.map((f) => (
          <li key={f.key}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!v[f.key]}
                onChange={(e) => setV({ ...v, [f.key]: e.target.checked })}
                className="size-4"
              />
              <span>{f.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <Result label="Score" value={<BidiNum>{String(score)}</BidiNum>} />
    </CalcCard>
  )
}

/* ==================== presentational ==================== */

function CalcCard({ title, children, footnote }: { title: string; children: React.ReactNode; footnote?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{children}{footnote ? <p className="border-t pt-2 text-[11px] text-muted-foreground">{footnote}</p> : null}</CardContent>
    </Card>
  )
}

function Row({
  label,
  inline,
  children,
}: {
  label: string
  inline?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={inline ? 'flex items-center justify-between gap-2' : 'space-y-1'}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

function Result({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-base font-semibold tabular-nums">{value}</p>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}
