import { useTranslation } from 'react-i18next'
import { useCurrentWeather } from '../hooks/useCurrentWeather'
import { weatherKind } from '../lib/weather'
import WeatherIcon from './WeatherIcon'

type Props = {
  coords: { latitude: number; longitude: number } | null
}

function WeatherBadge({ coords }: Props) {
  const { t } = useTranslation('trips')
  const { data, isLoading, isError } = useCurrentWeather(coords)

  if (!coords || isError) return null
  if (isLoading || !data) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-black/25 px-3 py-1.5 text-sm text-white/70 backdrop-blur">
        <span className="h-4 w-4 animate-pulse rounded-full bg-white/40" />
        {t('weather.loading')}
      </div>
    )
  }

  const kind = weatherKind(data.weatherCode)

  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-black/25 px-3 py-1.5 text-white backdrop-blur">
      <WeatherIcon kind={kind} className="h-7 w-7" />
      <span className="text-sm font-semibold">
        {t('weather.degrees', { value: data.temperature })}
      </span>
    </div>
  )
}

export default WeatherBadge
