import { useQuery } from '@tanstack/react-query'
import { fetchCurrentWeather } from '../lib/weather'

type Coords = { latitude: number; longitude: number } | null

export function useCurrentWeather(coords: Coords) {
  return useQuery({
    queryKey: ['weather', coords?.latitude, coords?.longitude],
    queryFn: ({ signal }) => fetchCurrentWeather(coords!.latitude, coords!.longitude, signal),
    enabled: coords != null,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  })
}
