import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchPublicPlaces } from '../lib/placesApi'

export function usePublicPlaces(enabled: boolean) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['public-places'],
    queryFn: ({ signal }) => fetchPublicPlaces(signal),
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000,
  })
}
