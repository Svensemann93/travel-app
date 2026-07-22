import { useTranslation } from 'react-i18next'
import { useFormatDate } from '../hooks/useFormatDate'
import { weatherKind } from '../lib/weather'
import type { DailyForecast } from '../lib/weather'
import WeatherIcon from './WeatherIcon'

function ForecastDay({ day }: { day: DailyForecast }) {
  const { t } = useTranslation('trips')
  const { formatWeekday } = useFormatDate()

  return (
    <div className="flex w-[76px] flex-shrink-0 flex-col items-center gap-1 rounded-xl bg-slate-50 px-2 py-3">
      <span className="text-xs font-medium text-slate-500">{formatWeekday(day.date)}</span>
      <WeatherIcon kind={weatherKind(day.weatherCode)} className="h-8 w-8" />
      <span className="text-sm font-semibold text-slate-800">{day.tempMax}°</span>
      <span className="text-xs text-slate-400">{day.tempMin}°</span>
      {day.precipitationProbability != null && (
        <span
          className="flex items-center gap-0.5 text-xs text-sky-600"
          title={t('weather.precipitation')}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z" />
          </svg>
          {t('weather.precipitationValue', { value: day.precipitationProbability })}
        </span>
      )}
      <span className="text-xs text-slate-400" title={t('weather.wind')}>
        {t('weather.windValue', { value: Math.round(day.windMax) })}
      </span>
    </div>
  )
}

export default ForecastDay
