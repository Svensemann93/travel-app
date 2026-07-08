import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { upsertPlaceVisit, deletePlaceVisit } from '../lib/placesApi'

export function useSetPlaceVisit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      placeId,
      rating,
      priceLevel,
    }: {
      placeId: string
      rating: number | null
      priceLevel: number | null
    }) => {
      if (!user) throw new Error('Not authenticated')
      return upsertPlaceVisit(user.id, placeId, rating, priceLevel)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-places'] })
    },
  })
}

export function useRemovePlaceVisit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (placeId: string) => {
      if (!user) throw new Error('Not authenticated')
      return deletePlaceVisit(user.id, placeId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-places'] })
    },
  })
}
