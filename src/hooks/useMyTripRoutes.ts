import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchMyTripRoutes } from '../lib/tripsApi'

export function useMyTripRoutes() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['trip-routes', 'mine', user?.id ?? ''],
    queryFn: ({ signal }) => fetchMyTripRoutes(signal),
    enabled: !!user,
  })
}
