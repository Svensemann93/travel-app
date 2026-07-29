import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { deletePlaceVisit, upsertPlaceVisit } from '../lib/placesApi'
import { patchPublicPlace } from '../lib/publicPlacesCache'

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
    onSuccess: (_data, { placeId, rating, priceLevel, visitedOn }) => {
      patchPublicPlace(queryClient, placeId, {
        visited_by_me: true,
        my_rating: rating,
        my_price: priceLevel,
        my_visited_on: visitedOn,
      })
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
    onSuccess: (_data, placeId) => {
      patchPublicPlace(queryClient, placeId, {
        visited_by_me: false,
        my_rating: null,
        my_price: null,
        my_visited_on: null,
      })
      queryClient.invalidateQueries({ queryKey: ['my-visited-stats'] })
    },
  })
}
