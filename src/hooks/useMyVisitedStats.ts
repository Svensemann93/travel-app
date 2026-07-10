import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchMyVisitedStats } from '../lib/placesApi'

export function useMyVisitedStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['my-visited-stats'],
    queryFn: ({ signal }) => fetchMyVisitedStats(signal),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}
