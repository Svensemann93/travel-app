import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchMyTripPlaces } from '../lib/tripsApi'

export function useMyTripPlaces() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['trip-places', 'mine', user?.id ?? ''],
    queryFn: ({ signal }) => fetchMyTripPlaces(signal),
    enabled: !!user,
  })
}
