/**
 * Hijri date conversion.
 *
 * Pinned strategy: use the JS engine's `Intl.DateTimeFormat` with the
 * `islamic-umalqura` calendar — that's the Umm al-Qura algorithm used by
 * Saudi Arabia and the most common civil-Hijri reference. We never write
 * Hijri to storage; storage stays Gregorian ISO-8601 UTC, and Hijri is a
 * render-time projection.
 *
 * Surfaces using this:
 *   - Patient DOB display when `tenant.clinicalLocale.dateSecondary === 'hijri'`
 *   - Encounter timestamps on chart banner
 *   - Rx authoredOn on the printable Rx pad
 *
 * NEVER use for:
 *   - Storage keys
 *   - Timezone math
 *   - Pediatric age calculation (always Gregorian source)
 */

const HIJRI_MONTHS_AR: Record<number, string> = {
  1: 'محرم',
  2: 'صفر',
  3: 'ربيع الأول',
  4: 'ربيع الآخر',
  5: 'جمادى الأولى',
  6: 'جمادى الآخرة',
  7: 'رجب',
  8: 'شعبان',
  9: 'رمضان',
  10: 'شوال',
  11: 'ذو القعدة',
  12: 'ذو الحجة',
}

const HIJRI_MONTHS_EN: Record<number, string> = {
  1: 'Muharram',
  2: 'Safar',
  3: "Rabi' I",
  4: "Rabi' II",
  5: 'Jumada I',
  6: 'Jumada II',
  7: 'Rajab',
  8: "Sha'ban",
  9: 'Ramadan',
  10: 'Shawwal',
  11: "Dhu al-Qi'dah",
  12: 'Dhu al-Hijjah',
}

export type HijriParts = {
  day: number
  month: number
  year: number
}

/**
 * Convert a Gregorian date to Umm al-Qura Hijri parts. Returns null if the
 * platform Intl runtime does not support `islamic-umalqura` (very old
 * environments — modern Node + every shipping browser do).
 */
export function toHijriParts(date: Date | string | number): HijriParts | null {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return null
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    })
    const parts = fmt.formatToParts(d)
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value
    const year = Number(get('year')?.replace(/[^\d]/g, ''))
    const month = Number(get('month'))
    const day = Number(get('day'))
    if (!year || !month || !day) return null
    return { year, month, day }
  } catch {
    return null
  }
}

export type HijriFormatOptions = {
  /** 'ar' renders Arabic month names, 'en' transliterated Latin month names. */
  language?: 'ar' | 'en'
  /** Append the AH era suffix. Default true. */
  includeEra?: boolean
}

/**
 * Format a Gregorian date as a single Hijri string. Returns empty string
 * when conversion isn't available so callers can short-circuit cleanly.
 */
export function formatHijri(
  date: Date | string | number,
  options: HijriFormatOptions = {},
): string {
  const parts = toHijriParts(date)
  if (!parts) return ''
  const { language = 'en', includeEra = true } = options
  const months = language === 'ar' ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN
  const monthName = months[parts.month] ?? String(parts.month)
  const era = includeEra ? ' AH' : ''
  return `${parts.day} ${monthName} ${parts.year}${era}`
}
