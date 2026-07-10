import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchPublicPlaces } from '../lib/placesApi'
import { normalizeBounds } from '../lib/publicBounds'
import type { PublicBounds } from '../lib/publicBounds'

export function usePublicPlaces(enabled: boolean, bounds?: PublicBounds) {
  const { user } = useAuth()
  const normalized = bounds ? normalizeBounds(bounds) : undefined

  return useQuery({
    queryKey: ['public-places', normalized ?? 'all'],
    queryFn: ({ signal }) => fetchPublicPlaces(normalized, signal),
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}
