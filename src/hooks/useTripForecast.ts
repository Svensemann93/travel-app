import { useQuery } from '@tanstack/react-query'
import { fetchForecast } from '../lib/weather'
import { planTripWeather } from '../lib/tripWeather'

type Coords = { latitude: number; longitude: number } | null

export function useTripForecast(coords: Coords, startDate: string | null, endDate: string | null) {
  const plan = planTripWeather(startDate, endDate)
  const forecastRange = plan.kind === 'forecast' ? plan : null
  const enabled = coords != null && forecastRange != null

  const query = useQuery({
    queryKey: [
      'forecast',
      coords?.latitude,
      coords?.longitude,
      forecastRange?.start ?? null,
      forecastRange?.end ?? null,
    ],
    queryFn: ({ signal }) =>
      fetchForecast(
        coords!.latitude,
        coords!.longitude,
        forecastRange!.start,
        forecastRange!.end,
        signal,
      ),
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  })

  return {
    plan,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
