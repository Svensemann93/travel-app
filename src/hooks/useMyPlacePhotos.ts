import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  fetchMyPlacePhotos,
  insertPhotoRows,
  removePhotos,
  updatePhotoVisibility,
} from '../lib/placesApi'
import type { NewPhoto, PlacePhoto } from '../types/place'

export function useMyPlacePhotos(placeId: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['my-place-photos', placeId ?? '', user?.id ?? ''],
    queryFn: ({ signal }) => fetchMyPlacePhotos(placeId!, signal),
    enabled: !!user && !!placeId,
    staleTime: 60 * 1000,
  })
}

type SaveInput = {
  placeId: string
  added: NewPhoto[]
  removed: PlacePhoto[]
  visibility: Record<string, boolean>
  startPosition: number
}

export function useSaveMyPlacePhotos() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ placeId, added, removed, visibility, startPosition }: SaveInput) => {
      if (!user) throw new Error('Not authenticated')
      if (removed.length > 0) await removePhotos(removed)
      if (Object.keys(visibility).length > 0) await updatePhotoVisibility(visibility)
      if (added.length > 0) await insertPhotoRows(user.id, placeId, added, startPosition)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-place-photos', variables.placeId] })
      queryClient.invalidateQueries({ queryKey: ['public-places'] })
    },
  })
}
