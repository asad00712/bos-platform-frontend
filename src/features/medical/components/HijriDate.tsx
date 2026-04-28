import { formatDate } from '@/shared/lib/format'
import { formatHijri } from '@/shared/lib/hijri'
import { useClinicalLocale } from '@/shared/hooks/useClinicalLocale'
import { BidiNum } from '@/shared/lib/bidi'

type Props = {
  date: string | Date
  /** Date format passed to `formatDate` for the Gregorian primary. */
  options?: Intl.DateTimeFormatOptions
  /** Force secondary even when the tenant hasn't enabled it. Useful in
   *  printable Rx pads / consent forms where dual-calendar is mandated. */
  forceSecondary?: boolean
  /** Render as a stacked block (default) vs inline. */
  inline?: boolean
  className?: string
}

/**
 * Gregorian primary, optional Hijri secondary. Both wrapped in `<bdi>`
 * so digits do not flip in RTL paragraphs.
 *
 * The clinical-locale hook decides whether the Hijri secondary appears;
 * we never store Hijri, only render it.
 */
export function HijriDate({
  date,
  options = { dateStyle: 'medium' },
  forceSecondary,
  inline,
  className,
}: Props) {
  const { dateSecondary } = useClinicalLocale()
  const showHijri = forceSecondary || dateSecondary === 'hijri'
  const primary = formatDate(date, options)
  const secondary = showHijri ? formatHijri(date) : ''

  if (!secondary) return <BidiNum className={className}>{primary}</BidiNum>
  if (inline) {
    return (
      <span className={className}>
        <BidiNum>{primary}</BidiNum>
        <span className="text-muted-foreground"> · </span>
        <BidiNum>{secondary}</BidiNum>
      </span>
    )
  }
  return (
    <span className={`flex flex-col leading-tight ${className ?? ''}`.trim()}>
      <BidiNum className="text-sm">{primary}</BidiNum>
      <BidiNum className="text-xs text-muted-foreground">{secondary}</BidiNum>
    </span>
  )
}
