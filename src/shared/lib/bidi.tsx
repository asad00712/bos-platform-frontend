import type { ReactNode } from 'react'

/**
 * Bidi-isolated numeric span. Use for any number, dose string, BP value
 * (e.g. `120/80`), reference range (`70–99`), or code (`A09.1`) that must
 * not visually flip when rendered inside RTL paragraphs.
 *
 * Wraps content in `<bdi dir="ltr">` so the bidirectional algorithm treats
 * the value as an isolated LTR run regardless of the surrounding paragraph
 * direction.
 */
export function BidiNum({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <bdi dir="ltr" className={className}>
      {children}
    </bdi>
  )
}

/**
 * Coding-system code wrapper (ICD-10, SNOMED, LOINC, RxNorm, CPT). Same
 * isolation guarantees as BidiNum but with a `font-mono` default to match
 * code conventions across the app.
 */
export function BidiCode({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <bdi dir="ltr" className={`font-mono ${className ?? ''}`.trim()}>
      {children}
    </bdi>
  )
}

/**
 * Reference range `low–high` rendered isolated. Accepts already-formatted
 * strings or numbers. Use for lab ranges, BP norms, growth percentiles.
 */
export function BidiRange({
  low,
  high,
  separator = '–',
  unit,
}: {
  low: number | string
  high: number | string
  separator?: string
  unit?: string
}) {
  return (
    <bdi dir="ltr">
      {low}
      {separator}
      {high}
      {unit ? ` ${unit}` : ''}
    </bdi>
  )
}

/**
 * Convert Western digits to Eastern Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩).
 * USE ONLY in patient-facing portal prose, never in clinical fields
 * (dosing, vitals, labs, dates). Gated by `tenant.clinicalLocale.digits`.
 */
const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
export function toEasternDigits(input: string | number): string {
  const s = String(input)
  return s.replace(/\d/g, (d) => EASTERN_DIGITS[Number(d)] ?? d)
}
