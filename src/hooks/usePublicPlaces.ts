import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchPublicPlaces } from '../lib/placesApi'
import type { PublicBounds } from '../lib/placesApi'

const round = (n: number) => Math.round(n * 100) / 100

export function usePublicPlaces(enabled: boolean, bounds?: PublicBounds) {
  const { user } = useAuth()

  const queryKey = bounds
    ? [
        'public-places',
        round(bounds.minLat),
        round(bounds.maxLat),
        round(bounds.minLng),
        round(bounds.maxLng),
      ]
    : ['public-places', 'all']

  return useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchPublicPlaces(bounds, signal),
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}
