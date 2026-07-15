import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { deletePlaceVisit, upsertPlaceVisit } from '../lib/placesApi'

export function useSetPlaceVisit() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({
      placeId,
      rating,
      priceLevel,
      visitedOn,
    }: {
      placeId: string
      rating: number | null
      priceLevel: number | null
      visitedOn: string | null
    }) => {
      if (!user) throw new Error('Not authenticated')
      return upsertPlaceVisit(user.id, placeId, rating, priceLevel, visitedOn)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-places'] })
      queryClient.invalidateQueries({ queryKey: ['my-visited-stats'] })
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
      queryClient.invalidateQueries({ queryKey: ['my-visited-stats'] })
    },
  })
}
