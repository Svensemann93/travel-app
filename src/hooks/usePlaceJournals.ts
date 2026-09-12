import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchPlaceJournals } from '../lib/journalsApi'

export function usePlaceJournals() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['place-journals', user?.id ?? ''],
    queryFn: ({ signal }) => fetchPlaceJournals(signal),
    enabled: !!user,
  })
}
