import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { addPlaceWish, removePlaceWish } from '../lib/placesApi'
import type { PublicPlace } from '../types/place'

function patchWish(queryClient: QueryClient, placeId: string, wished: boolean) {
  queryClient.setQueriesData<PublicPlace[]>({ queryKey: ['public-places'] }, (current) =>
    current
      ? current.map((place) =>
          place.id === placeId
            ? {
                ...place,
                wished_by_me: wished,
                wished_on: wished ? new Date().toISOString() : null,
              }
            : place,
        )
      : current,
  )
}

export function useAddPlaceWish() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (placeId: string) => {
      if (!user) throw new Error('Not authenticated')
      return addPlaceWish(user.id, placeId)
    },
    onSuccess: (_data, placeId) => {
      patchWish(queryClient, placeId, true)
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
      patchWish(queryClient, placeId, false)
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}
