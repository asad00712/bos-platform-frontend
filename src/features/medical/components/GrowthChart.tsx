import { useMemo } from 'react'

import { cn } from '@/shared/lib/utils'
import { BidiNum } from '@/shared/lib/bidi'
import { useUnitPreference } from '@/shared/hooks/useUnitPreference'

/**
 * Pediatric growth chart — minimal but clinically credible. Renders WHO
 * (0–24 mo) or CDC (2–20 yr) percentile bands with the patient's plotted
 * points overlaid. Bands are seeded from a small lookup table — sufficient
 * for the demo + the picker UX. Real production tables come from the WHO
 * GES dataset and CDC NCHS dataset.
 *
 * Three measures supported: weight-for-age, length/height-for-age,
 * head-circumference-for-age. BMI-for-age (CDC 2–20) is computed at the
 * call site from W/H if needed.
 */

export type GrowthChartKind = 'weight' | 'height' | 'head_circumference'
export type GrowthSource = 'who_0_24mo' | 'cdc_2_20yr'

type ReferencePoint = {
  /** Age in months for the WHO source, age in years for CDC. */
  x: number
  /** Per-percentile values; SI metric. */
  p3: number
  p15: number
  p50: number
  p85: number
  p97: number
}

type DataPoint = {
  /** Patient age at the measurement, same unit as the reference x-axis. */
  x: number
  /** Measured value, SI metric (kg / cm). */
  y: number
}

type Props = {
  source: GrowthSource
  kind: GrowthChartKind
  /** Patient sex; reference table differs by sex. */
  sex: 'male' | 'female'
  /** Patient measurements to plot. */
  points: DataPoint[]
  className?: string
}

/* ============== reference tables ============== */
/* Each row: x, p3, p15, p50, p85, p97. Values are illustrative and
   match published WHO / CDC growth standards within ~1 standard score.
   We only seed enough rows to draw a credible curve. */

const WHO_WEIGHT_BOY: ReferencePoint[] = [
  { x: 0, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.4 },
  { x: 3, p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.2, p97: 7.9 },
  { x: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.9, p97: 9.7 },
  { x: 9, p3: 7.4, p15: 8.1, p50: 8.9, p85: 10.0, p97: 10.9 },
  { x: 12, p3: 8.1, p15: 8.9, p50: 9.6, p85: 10.8, p97: 11.8 },
  { x: 18, p3: 9.2, p15: 10.0, p50: 10.9, p85: 12.2, p97: 13.3 },
  { x: 24, p3: 10.1, p15: 11.0, p50: 12.2, p85: 13.6, p97: 14.8 },
]
const WHO_WEIGHT_GIRL: ReferencePoint[] = [
  { x: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
  { x: 3, p3: 4.6, p15: 5.1, p50: 5.8, p85: 6.6, p97: 7.4 },
  { x: 6, p3: 5.8, p15: 6.5, p50: 7.3, p85: 8.3, p97: 9.2 },
  { x: 9, p3: 6.7, p15: 7.4, p50: 8.2, p85: 9.3, p97: 10.4 },
  { x: 12, p3: 7.4, p15: 8.1, p50: 8.9, p85: 10.1, p97: 11.4 },
  { x: 18, p3: 8.4, p15: 9.2, p50: 10.2, p85: 11.6, p97: 13.0 },
  { x: 24, p3: 9.4, p15: 10.4, p50: 11.5, p85: 13.0, p97: 14.5 },
]

const WHO_HEIGHT_BOY: ReferencePoint[] = [
  { x: 0, p3: 46.3, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.4 },
  { x: 3, p3: 58.4, p15: 60.0, p50: 61.4, p85: 63.5, p97: 65.5 },
  { x: 6, p3: 63.6, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.6 },
  { x: 9, p3: 67.5, p15: 69.7, p50: 72.0, p85: 74.2, p97: 76.5 },
  { x: 12, p3: 71.0, p15: 73.4, p50: 75.7, p85: 78.1, p97: 80.5 },
  { x: 18, p3: 76.9, p15: 79.6, p50: 82.3, p85: 85.0, p97: 87.7 },
  { x: 24, p3: 81.7, p15: 84.8, p50: 87.8, p85: 90.9, p97: 93.9 },
]
const WHO_HEIGHT_GIRL: ReferencePoint[] = [
  { x: 0, p3: 45.6, p15: 47.2, p50: 49.1, p85: 51.0, p97: 52.9 },
  { x: 3, p3: 57.1, p15: 58.7, p50: 60.4, p85: 62.5, p97: 64.5 },
  { x: 6, p3: 61.2, p15: 63.5, p50: 65.7, p85: 68.1, p97: 70.3 },
  { x: 9, p3: 65.0, p15: 67.5, p50: 70.1, p85: 72.6, p97: 75.0 },
  { x: 12, p3: 68.9, p15: 71.4, p50: 74.0, p85: 76.6, p97: 79.2 },
  { x: 18, p3: 74.9, p15: 77.8, p50: 80.7, p85: 83.6, p97: 86.5 },
  { x: 24, p3: 80.0, p15: 83.2, p50: 86.4, p85: 89.6, p97: 92.9 },
]

const WHO_HC_BOY: ReferencePoint[] = [
  { x: 0, p3: 32.6, p15: 33.9, p50: 34.5, p85: 35.7, p97: 37.0 },
  { x: 3, p3: 38.0, p15: 39.0, p50: 40.5, p85: 42.0, p97: 43.0 },
  { x: 6, p3: 41.0, p15: 42.0, p50: 43.5, p85: 45.0, p97: 46.0 },
  { x: 12, p3: 43.5, p15: 45.0, p50: 46.0, p85: 47.5, p97: 49.0 },
  { x: 18, p3: 45.0, p15: 46.5, p50: 47.5, p85: 49.0, p97: 50.5 },
  { x: 24, p3: 46.0, p15: 47.5, p50: 48.5, p85: 50.0, p97: 51.5 },
]
const WHO_HC_GIRL: ReferencePoint[] = [
  { x: 0, p3: 32.0, p15: 33.0, p50: 33.9, p85: 35.0, p97: 36.2 },
  { x: 3, p3: 37.0, p15: 38.0, p50: 39.5, p85: 41.0, p97: 42.0 },
  { x: 6, p3: 40.0, p15: 41.0, p50: 42.0, p85: 43.5, p97: 45.0 },
  { x: 12, p3: 42.5, p15: 43.5, p50: 45.0, p85: 46.5, p97: 47.5 },
  { x: 18, p3: 44.0, p15: 45.0, p50: 46.0, p85: 47.5, p97: 48.5 },
  { x: 24, p3: 45.0, p15: 46.0, p50: 47.0, p85: 48.5, p97: 49.5 },
]

const CDC_WEIGHT_BOY: ReferencePoint[] = [
  { x: 2, p3: 10.5, p15: 11.5, p50: 12.5, p85: 13.7, p97: 15.1 },
  { x: 5, p3: 15.0, p15: 16.4, p50: 18.4, p85: 20.6, p97: 23.0 },
  { x: 8, p3: 20.0, p15: 22.0, p50: 25.5, p85: 30.0, p97: 35.0 },
  { x: 12, p3: 28.0, p15: 31.0, p50: 38.5, p85: 47.5, p97: 56.0 },
  { x: 16, p3: 41.0, p15: 47.0, p50: 60.0, p85: 73.0, p97: 86.0 },
  { x: 20, p3: 53.0, p15: 60.0, p50: 70.0, p85: 85.0, p97: 100.0 },
]
const CDC_WEIGHT_GIRL: ReferencePoint[] = [
  { x: 2, p3: 10.0, p15: 10.9, p50: 12.0, p85: 13.4, p97: 14.9 },
  { x: 5, p3: 14.5, p15: 16.0, p50: 18.0, p85: 20.5, p97: 23.5 },
  { x: 8, p3: 19.5, p15: 21.5, p50: 25.5, p85: 30.5, p97: 36.0 },
  { x: 12, p3: 28.0, p15: 32.0, p50: 41.0, p85: 50.0, p97: 60.0 },
  { x: 16, p3: 42.0, p15: 48.0, p50: 56.0, p85: 67.0, p97: 80.0 },
  { x: 20, p3: 47.0, p15: 53.0, p50: 60.0, p85: 73.0, p97: 90.0 },
]
const CDC_HEIGHT_BOY: ReferencePoint[] = [
  { x: 2, p3: 82.5, p15: 84.5, p50: 87.5, p85: 90.5, p97: 93.0 },
  { x: 5, p3: 102.0, p15: 105.0, p50: 109.0, p85: 113.0, p97: 117.0 },
  { x: 8, p3: 117.0, p15: 121.0, p50: 127.0, p85: 132.0, p97: 137.0 },
  { x: 12, p3: 137.0, p15: 142.0, p50: 149.0, p85: 156.0, p97: 161.0 },
  { x: 16, p3: 158.0, p15: 162.0, p50: 172.0, p85: 180.0, p97: 186.0 },
  { x: 20, p3: 165.0, p15: 169.0, p50: 176.0, p85: 184.0, p97: 190.0 },
]
const CDC_HEIGHT_GIRL: ReferencePoint[] = [
  { x: 2, p3: 81.0, p15: 83.5, p50: 86.5, p85: 89.5, p97: 92.0 },
  { x: 5, p3: 101.0, p15: 104.0, p50: 108.0, p85: 112.0, p97: 116.0 },
  { x: 8, p3: 117.0, p15: 121.0, p50: 127.0, p85: 132.0, p97: 137.0 },
  { x: 12, p3: 137.0, p15: 143.0, p50: 151.0, p85: 158.0, p97: 163.0 },
  { x: 16, p3: 152.0, p15: 156.0, p50: 163.0, p85: 168.0, p97: 173.0 },
  { x: 20, p3: 153.0, p15: 158.0, p50: 164.0, p85: 169.0, p97: 174.0 },
]

function pickReference(source: GrowthSource, kind: GrowthChartKind, sex: 'male' | 'female'): ReferencePoint[] | null {
  if (source === 'who_0_24mo') {
    if (kind === 'weight') return sex === 'male' ? WHO_WEIGHT_BOY : WHO_WEIGHT_GIRL
    if (kind === 'height') return sex === 'male' ? WHO_HEIGHT_BOY : WHO_HEIGHT_GIRL
    if (kind === 'head_circumference') return sex === 'male' ? WHO_HC_BOY : WHO_HC_GIRL
  }
  if (source === 'cdc_2_20yr') {
    if (kind === 'weight') return sex === 'male' ? CDC_WEIGHT_BOY : CDC_WEIGHT_GIRL
    if (kind === 'height') return sex === 'male' ? CDC_HEIGHT_BOY : CDC_HEIGHT_GIRL
  }
  return null
}

const KIND_LABEL: Record<GrowthChartKind, string> = {
  weight: 'Weight for age',
  height: 'Length / height for age',
  head_circumference: 'Head circumference for age',
}

const KIND_UNIT: Record<GrowthChartKind, string> = {
  weight: 'kg',
  height: 'cm',
  head_circumference: 'cm',
}

const PERCENTILE_BAND_TONE: { key: keyof Omit<ReferencePoint, 'x'>; opacity: number }[] = [
  { key: 'p3', opacity: 0.08 },
  { key: 'p15', opacity: 0.16 },
  { key: 'p50', opacity: 0.24 },
  { key: 'p85', opacity: 0.16 },
  { key: 'p97', opacity: 0.08 },
]

export function GrowthChart({ source, kind, sex, points, className }: Props) {
  const u = useUnitPreference()
  const ref = pickReference(source, kind, sex)

  const layout = useMemo(() => {
    const width = 720
    const height = 320
    const padding = { top: 16, right: 16, bottom: 32, left: 40 }
    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom
    if (!ref || ref.length === 0) {
      return { width, height, padding, innerW, innerH, xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
    }
    const xMin = ref[0]!.x
    const xMax = ref[ref.length - 1]!.x
    const yValues = ref.flatMap((r) => [r.p3, r.p97])
    const dataYs = points.map((p) => p.y)
    const yMin = Math.min(...yValues, ...dataYs)
    const yMax = Math.max(...yValues, ...dataYs)
    return { width, height, padding, innerW, innerH, xMin, xMax, yMin, yMax }
  }, [ref, points])

  if (!ref) {
    return (
      <div className={cn('rounded-md border bg-muted/30 p-6 text-center text-sm text-muted-foreground', className)}>
        No reference table available for this combination.
      </div>
    )
  }
  const refTable: ReferencePoint[] = ref

  function projectX(x: number): number {
    return layout.padding.left + ((x - layout.xMin) / (layout.xMax - layout.xMin)) * layout.innerW
  }
  function projectY(y: number): number {
    return layout.padding.top + (1 - (y - layout.yMin) / (layout.yMax - layout.yMin)) * layout.innerH
  }

  function bandPath(low: keyof Omit<ReferencePoint, 'x'>, high: keyof Omit<ReferencePoint, 'x'>): string {
    const top = refTable.map((r) => `${projectX(r.x)},${projectY(r[high])}`).join(' L ')
    const bottom = [...refTable]
      .reverse()
      .map((r) => `${projectX(r.x)},${projectY(r[low])}`)
      .join(' L ')
    return `M ${top} L ${bottom} Z`
  }

  function linePath(percentile: keyof Omit<ReferencePoint, 'x'>): string {
    return refTable.map((r, i) => `${i === 0 ? 'M' : 'L'} ${projectX(r.x)} ${projectY(r[percentile])}`).join(' ')
  }

  const xAxisLabel = source === 'who_0_24mo' ? 'Age (months)' : 'Age (years)'

  // Convert SI metric values to display unit for the patient point labels
  const displayConverter = (yKg: number): { value: number; unit: string } => {
    if (kind === 'weight') return u.display('weight', yKg, 'kg')
    return u.display('height', yKg, 'cm')
  }

  return (
    <div className={cn('space-y-2', className)}>
      <header className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold">{KIND_LABEL[kind]}</h4>
        <p className="text-xs text-muted-foreground">
          {source === 'who_0_24mo' ? 'WHO 0–24 mo' : 'CDC 2–20 yr'} · {sex === 'male' ? 'Boys' : 'Girls'}
        </p>
      </header>
      <svg
        role="img"
        aria-label={`${KIND_LABEL[kind]} growth chart`}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="w-full rounded-md border bg-card"
      >
        {/* shaded percentile bands */}
        <g className="text-primary">
          <path d={bandPath('p3', 'p97')} fill="currentColor" opacity={PERCENTILE_BAND_TONE[0]!.opacity} />
          <path d={bandPath('p15', 'p85')} fill="currentColor" opacity={PERCENTILE_BAND_TONE[1]!.opacity} />
        </g>
        {/* percentile lines */}
        <g fill="none" stroke="currentColor" strokeWidth={1} className="text-muted-foreground/70" strokeDasharray="3 3">
          <path d={linePath('p3')} />
          <path d={linePath('p15')} />
          <path d={linePath('p85')} />
          <path d={linePath('p97')} />
        </g>
        <g fill="none" stroke="currentColor" strokeWidth={1.5} className="text-primary">
          <path d={linePath('p50')} />
        </g>
        {/* x axis */}
        <g className="text-xs text-muted-foreground">
          <line
            x1={layout.padding.left}
            x2={layout.padding.left + layout.innerW}
            y1={layout.height - layout.padding.bottom}
            y2={layout.height - layout.padding.bottom}
            stroke="currentColor"
            opacity={0.4}
          />
          {ref.map((r) => (
            <g key={r.x}>
              <line
                x1={projectX(r.x)}
                x2={projectX(r.x)}
                y1={layout.height - layout.padding.bottom}
                y2={layout.height - layout.padding.bottom + 4}
                stroke="currentColor"
                opacity={0.4}
              />
              <text
                x={projectX(r.x)}
                y={layout.height - layout.padding.bottom + 16}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
              >
                {r.x}
              </text>
            </g>
          ))}
          <text
            x={layout.padding.left + layout.innerW / 2}
            y={layout.height - 4}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
          >
            {xAxisLabel}
          </text>
        </g>
        {/* y axis */}
        <g className="text-xs text-muted-foreground">
          <line
            x1={layout.padding.left}
            x2={layout.padding.left}
            y1={layout.padding.top}
            y2={layout.height - layout.padding.bottom}
            stroke="currentColor"
            opacity={0.4}
          />
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = layout.padding.top + layout.innerH * (1 - frac)
            const value = layout.yMin + (layout.yMax - layout.yMin) * frac
            return (
              <g key={frac}>
                <line x1={layout.padding.left - 4} x2={layout.padding.left} y1={y} y2={y} stroke="currentColor" opacity={0.4} />
                <text x={layout.padding.left - 6} y={y + 3} textAnchor="end" fontSize={10} fill="currentColor">
                  {value.toFixed(value < 10 ? 1 : 0)}
                </text>
              </g>
            )
          })}
          <text
            x={6}
            y={layout.padding.top + layout.innerH / 2}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            transform={`rotate(-90, 14, ${layout.padding.top + layout.innerH / 2})`}
          >
            {KIND_UNIT[kind]}
          </text>
        </g>
        {/* patient points + connector */}
        {points.length > 1 ? (
          <path
            d={points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${projectX(p.x)} ${projectY(p.y)}`)
              .join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-rose-500"
          />
        ) : null}
        <g>
          {points.map((p, i) => (
            <circle
              key={`${p.x}-${i}`}
              cx={projectX(p.x)}
              cy={projectY(p.y)}
              r={4}
              fill="white"
              stroke="currentColor"
              strokeWidth={2}
              className="text-rose-500"
            >
              <title>
                age {p.x} → {p.y} {KIND_UNIT[kind]}
              </title>
            </circle>
          ))}
        </g>
      </svg>
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <Legend swatch="bg-primary/30" label="3rd–97th band" />
        <Legend swatch="bg-primary" label="50th percentile" />
        <Legend swatch="bg-rose-500" label="Patient" />
        {points.length > 0 ? (
          <span className="ms-auto text-xs">
            Latest:&nbsp;
            <BidiNum>
              {(() => {
                const last = points[points.length - 1]!
                const d = displayConverter(last.y)
                return `${d.value.toFixed(1)} ${d.unit}`
              })()}
            </BidiNum>
          </span>
        ) : null}
      </div>
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn('inline-block size-2 rounded-full', swatch)} />
      <span>{label}</span>
    </span>
  )
}
