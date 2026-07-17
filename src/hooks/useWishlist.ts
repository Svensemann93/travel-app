import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { fetchWishlist } from '../lib/placesApi'

export function useWishlist() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['wishlist', user?.id ?? ''],
    queryFn: ({ signal }) => fetchWishlist(signal),
    enabled: !!user,
  })
}
