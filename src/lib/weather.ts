export type CurrentWeather = {
  temperature: number
  weatherCode: number
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', latitude.toString())
  url.searchParams.set('longitude', longitude.toString())
  url.searchParams.set('current', 'temperature_2m,weather_code')

  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`)

  const data = (await response.json()) as {
    current?: { temperature_2m?: number; weather_code?: number }
  }
  const current = data.current
  if (!current || current.temperature_2m == null || current.weather_code == null) {
    throw new Error('Weather response missing current data')
  }
  return { temperature: Math.round(current.temperature_2m), weatherCode: current.weather_code }
}

export type WeatherKind = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

export function weatherKind(code: number): WeatherKind {
  if (code === 0) return 'clear'
  if (code <= 3) return 'cloudy'
  if (code <= 48) return 'fog'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'rain'
  if (code <= 86) return 'snow'
  return 'storm'
}

export type DailyForecast = {
  date: string
  tempMax: number
  tempMin: number
  weatherCode: number
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<DailyForecast[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', latitude.toString())
  url.searchParams.set('longitude', longitude.toString())
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code')
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', endDate)
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Forecast request failed: ${response.status}`)

  const data = (await response.json()) as {
    daily?: {
      time?: string[]
      temperature_2m_max?: number[]
      temperature_2m_min?: number[]
      weather_code?: number[]
    }
  }
  const daily = data.daily
  if (
    !daily?.time ||
    !daily.temperature_2m_max ||
    !daily.temperature_2m_min ||
    !daily.weather_code
  ) {
    throw new Error('Forecast response missing daily data')
  }

  return daily.time.map((date, i) => ({
    date,
    tempMax: Math.round(daily.temperature_2m_max![i]),
    tempMin: Math.round(daily.temperature_2m_min![i]),
    weatherCode: daily.weather_code![i],
  }))
}
