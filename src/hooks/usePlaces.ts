import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  deletePlaceRow,
  deletePlaceVisit,
  fetchPlacesForUser,
  insertPhotoRows,
  insertPlaceRow,
  removePhotos,
  removePhotoStorageOnly,
  updatePhotoVisibility,
  updatePlaceLocation,
  updatePlaceRow,
  upsertPlaceVisit,
} from '../lib/placesApi'
import type { NewPhoto, Place, PlaceCreateInput, PlaceUpdateInput } from '../types/place'
import type { PlaceVisit, VisitInput } from '../types/place'
import { reverseGeocodeCountry } from '../lib/reverseGeocode'

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

async function saveVisit(
  userId: string,
  placeId: string,
  visit: VisitInput | null,
): Promise<PlaceVisit[]> {
  if (!visit) {
    await deletePlaceVisit(userId, placeId)
    return []
  }
  const row = await upsertPlaceVisit(
    userId,
    placeId,
    visit.rating,
    visit.price_level,
    visit.visited_on,
  )
  return [row]
}

export function useCreatePlace() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async ({
      data,
      photos,
      visit,
    }: {
      data: PlaceCreateInput
      photos: NewPhoto[]
      visit: VisitInput | null
    }): Promise<Place> => {
      if (!userId) throw new Error('Not authenticated')
      const country_code = await reverseGeocodeCountry(data.latitude, data.longitude)
      const row = await insertPlaceRow(userId, { ...data, country_code })
      const visits = await saveVisit(userId, row.id, visit)
      const photoRows = await insertPhotoRows(userId, row.id, photos, 0)
      return { ...row, photos: photoRows, visits }
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
      visit,
      photosToAdd,
      photoIdsToDelete,
      photoVisibility,
    }: {
      id: string
      data: PlaceUpdateInput
      visit: VisitInput | null
      photosToAdd: NewPhoto[]
      photoIdsToDelete: string[]
      photoVisibility: Record<string, boolean>
    }): Promise<Place> => {
      if (!userId) throw new Error('Not authenticated')

      const existing = queryClient
        .getQueryData<Place[]>(placesKeys.list(userId))
        ?.find((p) => p.id === id)
      if (!existing) throw new Error('Place not found')

      const row = await updatePlaceRow(id, data)
      const visits = await saveVisit(userId, id, visit)

      const visibilityChanges = photoVisibility ?? {}
      if (Object.keys(visibilityChanges).length > 0) {
        await updatePhotoVisibility(visibilityChanges)
      }

      let remainingPhotos = existing.photos.map((p) =>
        visibilityChanges[p.id] !== undefined ? { ...p, is_public: visibilityChanges[p.id] } : p,
      )

      if (photoIdsToDelete.length > 0) {
        const toDelete = remainingPhotos.filter((p) => photoIdsToDelete.includes(p.id))
        await removePhotos(toDelete)
        remainingPhotos = remainingPhotos.filter((p) => !photoIdsToDelete.includes(p.id))
      }

      const addedPhotos = await insertPhotoRows(userId, id, photosToAdd, remainingPhotos.length)

      return {
        ...row,
        photos: [...remainingPhotos, ...addedPhotos],
        visits,
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

export function useUpdatePlaceLocation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async ({
      id,
      latitude,
      longitude,
    }: {
      id: string
      latitude: number
      longitude: number
    }): Promise<Place> => {
      if (!userId) throw new Error('Not authenticated')

      const existing = queryClient
        .getQueryData<Place[]>(placesKeys.list(userId))
        ?.find((p) => p.id === id)
      if (!existing) throw new Error('Place not found')

      const row = await updatePlaceLocation(id, latitude, longitude)
      return { ...row, photos: existing.photos, visits: existing.visits }
    },
    onMutate: async ({ id, latitude, longitude }) => {
      if (!userId) return
      await queryClient.cancelQueries({ queryKey: placesKeys.list(userId) })
      const previous = queryClient.getQueryData<Place[]>(placesKeys.list(userId))
      queryClient.setQueryData<Place[]>(placesKeys.list(userId), (old = []) =>
        old.map((p) => (p.id === id ? { ...p, latitude, longitude } : p)),
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (userId && context?.previous) {
        queryClient.setQueryData(placesKeys.list(userId), context.previous)
      }
    },
    onSuccess: (updatedPlace) => {
      if (!userId) return
      queryClient.setQueryData<Place[]>(placesKeys.list(userId), (old = []) =>
        old.map((p) => (p.id === updatedPlace.id ? updatedPlace : p)),
      )
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
