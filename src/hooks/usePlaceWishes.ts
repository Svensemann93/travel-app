import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { addPlaceWish, removePlaceWish } from '../lib/placesApi'
import { patchPublicPlace } from '../lib/publicPlacesCache'

export function useAddPlaceWish() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (placeId: string) => {
      if (!user) throw new Error('Not authenticated')
      return addPlaceWish(user.id, placeId)
    },
    onSuccess: (_data, placeId) => {
      patchPublicPlace(queryClient, placeId, {
        wished_by_me: true,
        wished_on: new Date().toISOString(),
      })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

export function useRemovePlaceWish() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (placeId: string) => {
      if (!user) throw new Error('Not authenticated')
      return removePlaceWish(user.id, placeId)
    },
    onSuccess: (_data, placeId) => {
      patchPublicPlace(queryClient, placeId, { wished_by_me: false, wished_on: null })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}
