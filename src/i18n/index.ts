import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import {
  DEFAULT_LOCALE,
  NAMESPACES,
  RTL_LOCALES,
  SUPPORTED_LOCALES,
  type Locale,
} from './namespaces'

import enCommon from './resources/en/common.json'
import enAuth from './resources/en/auth.json'
import enCrm from './resources/en/crm.json'
import enScheduling from './resources/en/scheduling.json'
import enBilling from './resources/en/billing.json'
import enHrm from './resources/en/hrm.json'
import enDocuments from './resources/en/documents.json'
import enCommunication from './resources/en/communication.json'
import enReports from './resources/en/reports.json'
import enSettings from './resources/en/settings.json'
import enAudit from './resources/en/audit.json'
import enNotifications from './resources/en/notifications.json'
import enSupport from './resources/en/support.json'
import enAutomation from './resources/en/automation.json'
import enDental from './resources/en/dental.json'
import enSchool from './resources/en/school.json'
import enMedical from './resources/en/medical.json'
import enErrors from './resources/en/errors.json'
import enValidation from './resources/en/validation.json'

import arCommon from './resources/ar/common.json'
import urCommon from './resources/ur/common.json'
import esCommon from './resources/es/common.json'
import hiCommon from './resources/hi/common.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    crm: enCrm,
    scheduling: enScheduling,
    billing: enBilling,
    hrm: enHrm,
    documents: enDocuments,
    communication: enCommunication,
    reports: enReports,
    settings: enSettings,
    audit: enAudit,
    notifications: enNotifications,
    support: enSupport,
    automation: enAutomation,
    dental: enDental,
    school: enSchool,
    medical: enMedical,
    errors: enErrors,
    validation: enValidation,
  },
  ar: { common: arCommon },
  ur: { common: urCommon },
  es: { common: esCommon },
  hi: { common: hiCommon },
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    ns: [...NAMESPACES],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'bos.locale',
      caches: ['localStorage'],
    },
    returnNull: false,
  })

/** Apply `dir="rtl"` and `lang` on <html> for the active locale. */
export function applyDocumentLocale(locale: Locale) {
  const root = document.documentElement
  root.lang = locale
  root.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'
}

i18n.on('languageChanged', (lng) => {
  if ((SUPPORTED_LOCALES as readonly string[]).includes(lng)) {
    applyDocumentLocale(lng as Locale)
  }
})

if ((SUPPORTED_LOCALES as readonly string[]).includes(i18n.language)) {
  applyDocumentLocale(i18n.language as Locale)
} else {
  applyDocumentLocale(DEFAULT_LOCALE)
}

export default i18n
