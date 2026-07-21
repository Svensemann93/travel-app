import { useTranslation } from 'react-i18next'
import { useFormatDate } from '../hooks/useFormatDate'
import { useTripForecast } from '../hooks/useTripForecast'
import { weatherKind } from '../lib/weather'
import WeatherBadge from './WeatherBadge'
import WeatherIcon from './WeatherIcon'
import type { TripWithPlaces } from '../types/trip'

type Props = {
  trip: TripWithPlaces
}

function firstStopCoords(trip: TripWithPlaces): { latitude: number; longitude: number } | null {
  const ordered = [...trip.trip_places].sort((a, b) => a.position - b.position)
  const head = ordered[0]
  if (!head) return null
  return { latitude: head.place.latitude, longitude: head.place.longitude }
}

function TripForecast({ trip }: Props) {
  const { t } = useTranslation('trips')
  const { formatWeekday } = useFormatDate()
  const coords = firstStopCoords(trip)
  const { plan, data, isLoading, isError } = useTripForecast(coords, trip.start_date, trip.end_date)

  if (!coords || plan.kind === 'none') return null

  if (plan.kind === 'current') {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
        <span className="text-sm font-medium text-slate-500">{t('weather.now')}</span>
        <WeatherBadge coords={coords} />
      </div>
    )
  }

  if (isError) return null
  if (isLoading || !data) {
    return (
      <div className="mb-6 rounded-lg bg-white p-4 text-sm text-slate-400 shadow-sm">
        {t('weather.loading')}
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-500">{t('weather.forecast')}</h3>
      <div className="flex gap-2 overflow-x-auto sm:gap-3">
        {data.map((day) => (
          <div
            key={day.date}
            className="flex min-w-[60px] flex-1 flex-col items-center gap-1 rounded-lg bg-slate-50 px-2 py-2"
          >
            <span className="text-xs font-medium text-slate-500">{formatWeekday(day.date)}</span>
            <WeatherIcon kind={weatherKind(day.weatherCode)} className="h-8 w-8" />
            <span className="text-sm font-semibold text-slate-800">{day.tempMax}°</span>
            <span className="text-xs text-slate-400">{day.tempMin}°</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TripForecast
