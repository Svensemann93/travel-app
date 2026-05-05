import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  deletePlaceRow,
  fetchPlacesForUser,
  insertPhotoRows,
  insertPlaceRow,
  removePhotoStorageOnly,
  removePhotos,
  updatePlaceRow,
} from '../lib/placesApi'
import type { Place, PlaceCreateInput, PlaceUpdateInput } from '../types/place'

export const placesKeys = {
  all: ['places'] as const,
  list: (userId: string) => [...placesKeys.all, 'list', userId] as const,
}

export function usePlaces() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: placesKeys.list(userId ?? ''),
    queryFn: ({ signal }) => fetchPlacesForUser(signal),
    enabled: !!userId,
  })
}

export function useCreatePlace() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async ({
      data,
      photos,
    }: {
      data: PlaceCreateInput
      photos: File[]
    }): Promise<Place> => {
      if (!userId) throw new Error('Not authenticated')
      const row = await insertPlaceRow(userId, data)
      const photoRows = await insertPhotoRows(userId, row.id, photos, 0)
      return { ...row, photos: photoRows }
    },
    onSuccess: (newPlace) => {
      if (!userId) return
      queryClient.setQueryData<Place[]>(placesKeys.list(userId), (old = []) => [newPlace, ...old])
    },
    onError: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: placesKeys.list(userId) })
      }
    },
  })
}

export function useUpdatePlace() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async ({
      id,
      data,
      photosToAdd,
      photoIdsToDelete,
    }: {
      id: string
      data: PlaceUpdateInput
      photosToAdd: File[]
      photoIdsToDelete: string[]
    }): Promise<Place> => {
      if (!userId) throw new Error('Not authenticated')

      const existing = queryClient
        .getQueryData<Place[]>(placesKeys.list(userId))
        ?.find((p) => p.id === id)
      if (!existing) throw new Error('Place not found')

      const row = await updatePlaceRow(id, data)

      let remainingPhotos = existing.photos
      if (photoIdsToDelete.length > 0) {
        const toDelete = existing.photos.filter((p) => photoIdsToDelete.includes(p.id))
        await removePhotos(toDelete)
        remainingPhotos = existing.photos.filter((p) => !photoIdsToDelete.includes(p.id))
      }

      const addedPhotos = await insertPhotoRows(userId, id, photosToAdd, remainingPhotos.length)

      return {
        ...row,
        photos: [...remainingPhotos, ...addedPhotos],
      }
    },
    onSuccess: (updatedPlace) => {
      if (!userId) return
      queryClient.setQueryData<Place[]>(placesKeys.list(userId), (old = []) =>
        old.map((p) => (p.id === updatedPlace.id ? updatedPlace : p)),
      )
    },
    onError: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: placesKeys.list(userId) })
      }
    },
  })
}

export function useDeletePlace() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      if (!userId) throw new Error('Not authenticated')

      const place = queryClient
        .getQueryData<Place[]>(placesKeys.list(userId))
        ?.find((p) => p.id === id)
      if (!place) throw new Error('Place not found')

      await removePhotoStorageOnly(place.photos)
      await deletePlaceRow(id)
      return id
    },
    onSuccess: (deletedId) => {
      if (!userId) return
      queryClient.setQueryData<Place[]>(placesKeys.list(userId), (old = []) =>
        old.filter((p) => p.id !== deletedId),
      )
    },
    onError: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: placesKeys.list(userId) })
      }
    },
  })
}
