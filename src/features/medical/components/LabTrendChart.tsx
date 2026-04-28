import { useMemo } from 'react'

import { cn } from '@/shared/lib/utils'
import { BidiNum } from '@/shared/lib/bidi'

import type { Observation } from '../api/medical.contracts'
import { AbnormalFlag } from './AbnormalFlag'

type Point = {
  effectiveDateTime: string
  value: number
  unit: string
  interpretation: Observation['interpretation']
}

type Props = {
  /** Analyte LOINC code, just for the title row. */
  analyteDisplay: string
  points: Point[]
  /** Optional reference range — drawn as a green band. */
  referenceLow?: number | null
  referenceHigh?: number | null
  /** Critical thresholds painted as red dotted lines. */
  criticalLow?: number | null
  criticalHigh?: number | null
  className?: string
}

/**
 * Compact line chart for a single analyte over time. Reference range is
 * drawn as a translucent green band so the eye picks up "in/out of range"
 * at a glance. Critical thresholds are red dotted horizontal rules.
 *
 * SVG only — no Recharts dependency for the trend so the page stays
 * lightweight when many analytes are stacked.
 */
export function LabTrendChart({
  analyteDisplay,
  points,
  referenceLow,
  referenceHigh,
  criticalLow,
  criticalHigh,
  className,
}: Props) {
  const layout = useMemo(() => {
    const width = 640
    const height = 160
    const padding = { top: 12, right: 16, bottom: 28, left: 44 }
    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom
    if (points.length === 0) {
      return { width, height, padding, innerW, innerH, xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
    }
    const xs = points.map((p) => new Date(p.effectiveDateTime).getTime())
    const ys = points.map((p) => p.value)
    const yMin = Math.min(...ys, referenceLow ?? Infinity, criticalLow ?? Infinity)
    const yMax = Math.max(...ys, referenceHigh ?? -Infinity, criticalHigh ?? -Infinity)
    const yPad = (yMax - yMin) * 0.15 || 1
    return {
      width,
      height,
      padding,
      innerW,
      innerH,
      xMin: Math.min(...xs),
      xMax: Math.max(...xs),
      yMin: yMin - yPad,
      yMax: yMax + yPad,
    }
  }, [points, referenceLow, referenceHigh, criticalLow, criticalHigh])

  if (points.length === 0) {
    return null
  }

  function projectX(ts: number): number {
    if (layout.xMax === layout.xMin) return layout.padding.left + layout.innerW / 2
    return layout.padding.left + ((ts - layout.xMin) / (layout.xMax - layout.xMin)) * layout.innerW
  }
  function projectY(v: number): number {
    return layout.padding.top + (1 - (v - layout.yMin) / (layout.yMax - layout.yMin)) * layout.innerH
  }

  const linePath = points
    .map((p, i) => {
      const x = projectX(new Date(p.effectiveDateTime).getTime())
      const y = projectY(p.value)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const latest = points[points.length - 1]!
  const unit = latest.unit
  const refBandTop = referenceHigh != null ? projectY(referenceHigh) : null
  const refBandBottom = referenceLow != null ? projectY(referenceLow) : null

  return (
    <section className={cn('space-y-1.5', className)}>
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-medium leading-tight">{analyteDisplay}</h4>
        <div className="flex items-baseline gap-2 text-xs">
          <span className="font-semibold tabular-nums">
            <BidiNum>{latest.value}</BidiNum> {unit}
          </span>
          <AbnormalFlag flag={latest.interpretation} compact />
          {referenceLow != null || referenceHigh != null ? (
            <span className="text-muted-foreground">
              ref{' '}
              <BidiNum>
                {referenceLow ?? ''}–{referenceHigh ?? ''}
              </BidiNum>{' '}
              {unit}
            </span>
          ) : null}
        </div>
      </header>
      <svg
        role="img"
        aria-label={`Trend for ${analyteDisplay}`}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="w-full rounded-md border bg-card"
      >
        {refBandTop != null && refBandBottom != null ? (
          <rect
            x={layout.padding.left}
            y={refBandTop}
            width={layout.innerW}
            height={Math.max(0, refBandBottom - refBandTop)}
            fill="currentColor"
            opacity={0.08}
            className="text-emerald-500"
          />
        ) : null}
        {criticalLow != null ? (
          <line
            x1={layout.padding.left}
            x2={layout.padding.left + layout.innerW}
            y1={projectY(criticalLow)}
            y2={projectY(criticalLow)}
            stroke="currentColor"
            strokeDasharray="3 3"
            strokeWidth={1}
            className="text-rose-500"
          />
        ) : null}
        {criticalHigh != null ? (
          <line
            x1={layout.padding.left}
            x2={layout.padding.left + layout.innerW}
            y1={projectY(criticalHigh)}
            y2={projectY(criticalHigh)}
            stroke="currentColor"
            strokeDasharray="3 3"
            strokeWidth={1}
            className="text-rose-500"
          />
        ) : null}
        <line
          x1={layout.padding.left}
          x2={layout.padding.left + layout.innerW}
          y1={layout.height - layout.padding.bottom}
          y2={layout.height - layout.padding.bottom}
          stroke="currentColor"
          opacity={0.4}
        />
        <line
          x1={layout.padding.left}
          x2={layout.padding.left}
          y1={layout.padding.top}
          y2={layout.height - layout.padding.bottom}
          stroke="currentColor"
          opacity={0.4}
        />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-primary" />
        <g>
          {points.map((p, i) => {
            const x = projectX(new Date(p.effectiveDateTime).getTime())
            const y = projectY(p.value)
            const tone =
              p.interpretation === 'Critical' || p.interpretation === 'HH' || p.interpretation === 'LL'
                ? 'text-rose-500'
                : p.interpretation === 'H' || p.interpretation === 'L' || p.interpretation === 'A'
                  ? 'text-amber-500'
                  : 'text-emerald-500'
            return (
              <circle key={`${p.effectiveDateTime}-${i}`} cx={x} cy={y} r={4} fill="white" stroke="currentColor" strokeWidth={2} className={tone}>
                <title>
                  {new Date(p.effectiveDateTime).toLocaleDateString()} → {p.value} {p.unit}
                </title>
              </circle>
            )
          })}
        </g>
        {/* x-axis tick labels — first + last point */}
        <g className="text-[10px] text-muted-foreground">
          <text x={projectX(new Date(points[0]!.effectiveDateTime).getTime())} y={layout.height - 8} textAnchor="start" fill="currentColor">
            {new Date(points[0]!.effectiveDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
          {points.length > 1 ? (
            <text x={projectX(new Date(latest.effectiveDateTime).getTime())} y={layout.height - 8} textAnchor="end" fill="currentColor">
              {new Date(latest.effectiveDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
          ) : null}
          <text x={layout.padding.left - 6} y={projectY(layout.yMax)} textAnchor="end" fill="currentColor">
            {layout.yMax.toFixed(1)}
          </text>
          <text x={layout.padding.left - 6} y={projectY(layout.yMin)} textAnchor="end" fill="currentColor">
            {layout.yMin.toFixed(1)}
          </text>
        </g>
      </svg>
    </section>
  )
}
