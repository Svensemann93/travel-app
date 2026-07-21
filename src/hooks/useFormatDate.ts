import { useTranslation } from 'react-i18next'
import {
  formatDate as rawFormatDate,
  formatDateLong as rawFormatDateLong,
  formatDateRange as rawFormatDateRange,
  formatWeekday as rawFormatWeekday,
} from '../lib/dateFormat'
import { resolveLocale } from '../lib/i18nLocale'

export function useFormatDate() {
  const { t, i18n } = useTranslation()
  const locale = resolveLocale(i18n.language)
  const prefixes = { from: t('date.from'), until: t('date.until') }

  return {
    formatDate: (dateString: string) => rawFormatDate(dateString, locale),
    formatDateLong: (dateString: string) => rawFormatDateLong(dateString, locale),
    formatDateRange: (start: string | null, end: string | null) =>
      rawFormatDateRange(start, end, locale, prefixes),
    formatWeekday: (dateString: string) => rawFormatWeekday(dateString, locale),
  }
}
