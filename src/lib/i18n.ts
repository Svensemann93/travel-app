import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import deCommon from '../locales/de/common.json'
import deTrips from '../locales/de/trips.json'
import dePlaces from '../locales/de/places.json'
import deJournals from '../locales/de/journals.json'
import deEntries from '../locales/de/entries.json'
import deRead from '../locales/de/read.json'
import deMap from '../locales/de/map.json'
import deAuth from '../locales/de/auth.json'
import enCommon from '../locales/en/common.json'
import enTrips from '../locales/en/trips.json'
import enPlaces from '../locales/en/places.json'
import enJournals from '../locales/en/journals.json'
import enEntries from '../locales/en/entries.json'
import enRead from '../locales/en/read.json'
import enMap from '../locales/en/map.json'
import enAuth from '../locales/en/auth.json'

export const defaultNS = 'common'

export const resources = {
  de: {
    common: deCommon,
    trips: deTrips,
    places: dePlaces,
    journals: deJournals,
    entries: deEntries,
    read: deRead,
    map: deMap,
    auth: deAuth,
  },
  en: {
    common: enCommon,
    trips: enTrips,
    places: enPlaces,
    journals: enJournals,
    entries: enEntries,
    read: enRead,
    map: enMap,
    auth: enAuth,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
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
