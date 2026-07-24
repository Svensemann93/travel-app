import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentWeather } from '../hooks/useCurrentWeather'
import { useTripForecast } from '../hooks/useTripForecast'
import { weatherKind } from '../lib/weather'
import type { DailyForecast } from '../lib/weather'
import { tripStatus } from '../lib/tripStatus'
import WeatherIcon from './WeatherIcon'
import ForecastDay from './ForecastDay'
import StatTile from './StatTile'
import type { TripWithPlaces } from '../types/trip'
import { todayIso } from '../lib/localDate'

type Props = {
  trip: TripWithPlaces
}

type Tile = { icon: ReactNode; label: string; value: string }

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-5 w-5',
  'aria-hidden': true,
} as const

const durationIcon = (
  <svg {...ICON_PROPS}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const placesIcon = (
  <svg {...ICON_PROPS}>
    <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)
const clockIcon = (
  <svg {...ICON_PROPS}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
const checkIcon = (
  <svg {...ICON_PROPS}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

function firstStopCoords(trip: TripWithPlaces): { latitude: number; longitude: number } | null {
  const ordered = [...trip.trip_places].sort((a, b) => a.position - b.position)
  const head = ordered[0]
  if (!head) return null
  return { latitude: head.place.latitude, longitude: head.place.longitude }
}

function daysInclusive(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1
}

function TripSummary({ trip }: Props) {
  const { t } = useTranslation('trips')
  const coords = firstStopCoords(trip)
  const { plan, data } = useTripForecast(coords, trip.start_date, trip.end_date)
  const current = useCurrentWeather(coords)
  const [showForecast, setShowForecast] = useState(false)

  const forecast: DailyForecast[] = data ?? []
  const today = forecast[0] ?? null
  const rest = forecast.slice(1)
  const hasWeather = plan.kind !== 'none'

  const headTemp = current.data?.temperature ?? today?.tempMax ?? null
  const headCode = current.data?.weatherCode ?? today?.weatherCode ?? null

  const status = tripStatus(trip.start_date, trip.end_date)
  const now = todayIso()
  const tiles: Tile[] = []
  if (trip.start_date && trip.end_date) {
    tiles.push({
      icon: durationIcon,
      label: t('summary.durationLabel'),
      value: t('summary.days', { count: daysInclusive(trip.start_date, trip.end_date) }),
    })
  }
  tiles.push({
    icon: placesIcon,
    label: t('placesHeading'),
    value: String(trip.trip_places.length),
  })
  if (status === 'upcoming' && trip.start_date) {
    const days = Math.round((Date.parse(trip.start_date) - Date.parse(now)) / 86_400_000)
    tiles.push({
      icon: clockIcon,
      label: t('summary.untilStart'),
      value: t('summary.days', { count: days }),
    })
  } else if (status === 'ongoing' && trip.start_date && trip.end_date) {
    const total = daysInclusive(trip.start_date, trip.end_date)
    const currentDay = Math.min(
      total,
      Math.round((Date.parse(now) - Date.parse(trip.start_date)) / 86_400_000) + 1,
    )
    tiles.push({
      icon: clockIcon,
      label: t('summary.travelDay'),
      value: `${currentDay} / ${total}`,
    })
  } else if (status === 'completed') {
    tiles.push({ icon: checkIcon, label: t('status.completed'), value: '✓' })
  }

  const showWeather = hasWeather && headCode != null
  const kind = headCode != null ? weatherKind(headCode) : 'clear'

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {showWeather && (
        <div className="flex min-w-[200px] flex-1 flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
            <WeatherIcon kind={kind} className="h-11 w-11 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-slate-800">{headTemp}°</span>
                {today && (
                  <span className="text-sm text-slate-400">
                    {today.tempMin}° / {today.tempMax}°
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500">{t(`weather.kind.${kind}`)}</span>
            </div>
          </div>
          {rest.length > 0 && (
            <button
              type="button"
              onClick={() => setShowForecast((value) => !value)}
              aria-expanded={showForecast}
              className="mt-2 flex items-center gap-1 self-start text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
            >
              {showForecast ? t('weather.hideForecast') : t('weather.showForecast')}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-transform ${showForecast ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
        </div>
      )}

      {showWeather && showForecast && rest.length > 0 && (
        <div className="basis-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:order-last">
          <div className="flex gap-2 overflow-x-auto sm:gap-3">
            {rest.map((day) => (
              <ForecastDay key={day.date} day={day} />
            ))}
          </div>
        </div>
      )}

      {tiles.map((tile) => (
        <StatTile key={tile.label} icon={tile.icon} label={tile.label} value={tile.value} />
      ))}
    </div>
  )
}

export default TripSummary
