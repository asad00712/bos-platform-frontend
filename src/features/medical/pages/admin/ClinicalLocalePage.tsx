import { Calendar, Hash, Languages, Ruler, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { PageContainer } from '@/layout/PageContainer'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/shared/ui/radio-group'
import { Separator } from '@/shared/ui/separator'

import { BidiNum } from '@/shared/lib/bidi'
import { formatHijri } from '@/shared/lib/hijri'
import { useClinicalLocale } from '@/shared/hooks/useClinicalLocale'
import { useTenant } from '@/shared/hooks/useTenant'
import { useSessionStore } from '@/stores/session.store'
import type { ClinicalLocale, UnitSystem } from '@/types/tenant'

/**
 * Clinical-locale settings — drives which calendar to show alongside
 * Gregorian, what digit system to use in patient-facing portal prose,
 * and the unit system for vitals + labs displays. Stored values stay
 * canonical; only the rendered display flips.
 */
export function ClinicalLocalePage() {
  const { tenant } = useTenant()
  const setTenant = useSessionStore((s) => s.setTenant)
  const cl = useClinicalLocale()

  function update(patch: Partial<ClinicalLocale>) {
    setTenant({
      ...tenant,
      clinicalLocale: { ...(tenant.clinicalLocale ?? {}), ...patch },
    })
    toast.success('Clinical locale updated', {
      description: 'Display preferences saved for this tenant.',
    })
  }

  const today = new Date()

  return (
    <PageContainer>
      <PageHeader
        title="Clinical locale"
        description="Calendar, digits, and unit-system preferences for this tenant."
        breadcrumbs={[
          { label: 'Medical', href: '/app/medical/patients' },
          { label: 'Clinical locale' },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* secondary calendar */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <header className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Secondary calendar
              </h2>
            </header>
            <p className="text-xs text-muted-foreground">
              When set, every clinical surface that shows a date adds a Hijri (Umm al-Qura)
              annotation alongside Gregorian. Storage stays Gregorian ISO-8601.
            </p>
            <RadioGroup
              value={cl.dateSecondary ?? 'none'}
              onValueChange={(v) =>
                update({ dateSecondary: v === 'hijri' ? 'hijri' : null })
              }
              className="space-y-2"
            >
              <Option value="none" label="Gregorian only" hint="Default" />
              <Option
                value="hijri"
                label="Gregorian + Hijri"
                hint="Common for KSA / Pakistan / UAE tenants"
              />
            </RadioGroup>

            <Separator />
            <p className="text-xs text-muted-foreground">Live preview</p>
            <p className="text-sm">
              Today:{' '}
              <BidiNum>
                {today.toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </BidiNum>
              {cl.dateSecondary === 'hijri' ? (
                <>
                  <span className="text-muted-foreground"> · </span>
                  <BidiNum>{formatHijri(today)}</BidiNum>
                </>
              ) : null}
            </p>
          </CardContent>
        </Card>

        {/* unit system */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <header className="flex items-center gap-2">
              <Ruler className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Unit system
              </h2>
            </header>
            <p className="text-xs text-muted-foreground">
              Display only. Stored values keep their source unit so flipping is lossless.
              Conversions are UCUM-aligned.
            </p>
            <RadioGroup
              value={cl.units}
              onValueChange={(v) => update({ units: v as UnitSystem })}
              className="space-y-2"
            >
              <Option value="metric" label="Metric (kg, cm, °C, mmol/L)" hint="Default outside the US" />
              <Option value="us" label="US (lb, in, °F, mg/dL)" hint="Common in US tenants" />
            </RadioGroup>
            <Separator />
            <p className="text-xs text-muted-foreground">Live preview</p>
            <ul className="space-y-1 text-sm">
              <li>
                Weight 76.4 kg →{' '}
                <span className="font-medium tabular-nums">
                  <BidiNum>
                    {cl.units === 'us' ? (76.4 / 0.45359237).toFixed(1) : '76.4'}
                  </BidiNum>{' '}
                  {cl.units === 'us' ? 'lb' : 'kg'}
                </span>
              </li>
              <li>
                Temperature 36.6 °C →{' '}
                <span className="font-medium tabular-nums">
                  <BidiNum>
                    {cl.units === 'us' ? ((36.6 * 9) / 5 + 32).toFixed(1) : '36.6'}
                  </BidiNum>{' '}
                  {cl.units === 'us' ? '°F' : '°C'}
                </span>
              </li>
              <li>
                Glucose 152 mg/dL →{' '}
                <span className="font-medium tabular-nums">
                  <BidiNum>{cl.units === 'us' ? '152' : (152 / 18.0182).toFixed(1)}</BidiNum>{' '}
                  {cl.units === 'us' ? 'mg/dL' : 'mmol/L'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* digit system */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <header className="flex items-center gap-2">
              <Hash className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Digit system
              </h2>
            </header>
            <p className="text-xs text-muted-foreground">
              Western Arabic digits (0123456789) are used for all clinical fields by default. Eastern
              Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) are allowed only in patient-facing portal prose, never
              in dosing, vitals, lab results, or dates inside the chart — to prevent misread harm.
            </p>
            <RadioGroup
              value={cl.digits}
              onValueChange={(v) => update({ digits: v as 'western' | 'eastern' })}
              className="space-y-2"
            >
              <Option value="western" label="Western (0–9)" hint="Required for clinical fields" />
              <Option
                value="eastern"
                label="Eastern Arabic-Indic (٠–٩)"
                hint="Patient-portal prose only"
              />
            </RadioGroup>
          </CardContent>
        </Card>

        {/* RTL note */}
        <Card>
          <CardContent className="space-y-2 p-5">
            <header className="flex items-center gap-2">
              <Languages className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Bidirectional safety
              </h2>
            </header>
            <p className="text-sm">
              Every numeric value, code, and reference range is wrapped in <code>&lt;bdi&gt;</code> so
              they stay LTR-isolated even inside Arabic / Urdu paragraphs. Dose strings like{' '}
              <code className="rounded bg-muted px-1 font-mono">120/80</code>,{' '}
              <code className="rounded bg-muted px-1 font-mono">5 mg/kg</code>, and reference ranges{' '}
              <code className="rounded bg-muted px-1 font-mono">70–99</code> render correctly in any
              UI language.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              No clinical surface depends on color or direction alone for meaning.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function Option({ value, label, hint }: { value: string; label: string; hint: string }) {
  return (
    <Label className="flex cursor-pointer items-start gap-2 rounded-md border p-3 transition-colors hover:bg-accent">
      <RadioGroupItem value={value} className="mt-0.5" />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium leading-tight">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </Label>
  )
}
