/**
 * Locale-aware formatting helpers. Always go through these — never call
 * `Intl.*` directly in components, and never hand-roll a date string.
 */

import i18n from '@/i18n'

export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(i18n.language, options).format(value)
}

export function formatCurrency(
  value: number,
  currency: string,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
    ...options,
  }).format(value)
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(i18n.language, options).format(date)
}

export function formatTime(value: Date | string | number): string {
  return formatDate(value, { timeStyle: 'short' })
}

export function formatDateTime(value: Date | string | number): string {
  return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' })
}

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
]

export function formatRelative(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value)
  const diffMs = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat(i18n.language, {
    numeric: 'auto',
  })

  for (const { unit, ms } of RELATIVE_UNITS) {
    if (Math.abs(diffMs) >= ms || unit === 'second') {
      return formatter.format(Math.round(diffMs / ms), unit)
    }
  }

  return formatter.format(0, 'second')
}

/** Compact number (e.g. 1.2K, 3.4M). Locale-aware. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat(i18n.language, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
