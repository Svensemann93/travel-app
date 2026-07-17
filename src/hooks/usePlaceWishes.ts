import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { addPlaceWish, removePlaceWish } from '../lib/placesApi'

export function useAddPlaceWish() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (placeId: string) => {
      if (!user) throw new Error('Not authenticated')
      return addPlaceWish(user.id, placeId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-places'] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-places'] })
    },
  })
}
