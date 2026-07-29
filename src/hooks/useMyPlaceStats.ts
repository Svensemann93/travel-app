import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchMyPlaceStats, type MyPlaceStats } from '../lib/placesApi'

export function useMyPlaceStats(): Map<string, MyPlaceStats> {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: ['my-place-stats'],
    queryFn: ({ signal }) => fetchMyPlaceStats(signal),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  return useMemo(() => new Map((data ?? []).map((s) => [s.place_id, s])), [data])
}
