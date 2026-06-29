import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import deCommon from '../locales/de/common.json'
import deTrips from '../locales/de/trips.json'
import dePlaces from '../locales/de/places.json'
import deJournals from '../locales/de/journals.json'
import deEntries from '../locales/de/entries.json'
import enCommon from '../locales/en/common.json'
import enTrips from '../locales/en/trips.json'
import enPlaces from '../locales/en/places.json'
import enJournals from '../locales/en/journals.json'
import enEntries from '../locales/en/entries.json'

export const defaultNS = 'common'

export const resources = {
  de: {
    common: deCommon,
    trips: deTrips,
    places: dePlaces,
    journals: deJournals,
    entries: deEntries,
  },
  en: {
    common: enCommon,
    trips: enTrips,
    places: enPlaces,
    journals: enJournals,
    entries: enEntries,
  },
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
