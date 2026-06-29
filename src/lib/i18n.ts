import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import deCommon from '../locales/de/common.json'
import deTrips from '../locales/de/trips.json'
import enCommon from '../locales/en/common.json'
import enTrips from '../locales/en/trips.json'

export const defaultNS = 'common'

export const resources = {
  de: { common: deCommon, trips: deTrips },
  en: { common: enCommon, trips: enTrips },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    supportedLngs: ['de', 'en'],
    defaultNS,
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'lang',
    },
    interpolation: { escapeValue: false },
  })

export default i18n
