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
