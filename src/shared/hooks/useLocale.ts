import { useTranslation } from 'react-i18next'
import {
  DEFAULT_LOCALE,
  RTL_LOCALES,
  SUPPORTED_LOCALES,
  type Locale,
} from '@/i18n/namespaces'

export function useLocale() {
  const { i18n } = useTranslation()
  const current = (
    (SUPPORTED_LOCALES as readonly string[]).includes(i18n.language)
      ? (i18n.language as Locale)
      : DEFAULT_LOCALE
  )

  return {
    locale: current,
    isRtl: RTL_LOCALES.includes(current),
    locales: SUPPORTED_LOCALES,
    setLocale: (locale: Locale) => i18n.changeLanguage(locale),
  }
}
