import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  deleteTripPlaceRow,
  deleteTripRow,
  fetchTripsForUser,
  fetchTripWithPlaces,
  insertTripPlaceRow,
  insertTripRow,
  updateTripCover,
  updateTripPlacePositions,
  updateTripPlaceRow,
  updateTripRow,
} from '../lib/tripsApi'
import type {
  Trip,
  TripInput,
  TripListItem,
  TripPlaceUpdateInput,
  TripWithPlaces,
} from '../types/trip'

export const tripsKeys = {
  all: ['trips'] as const,
  lists: () => [...tripsKeys.all, 'list'] as const,
  list: (userId: string) => [...tripsKeys.lists(), userId] as const,
  details: () => [...tripsKeys.all, 'detail'] as const,
  detail: (tripId: string) => [...tripsKeys.details(), tripId] as const,
}

export function useTrips() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: tripsKeys.list(userId ?? ''),
    queryFn: ({ signal }) => fetchTripsForUser(signal),
    enabled: !!userId,
  })
}

export function useTripWithPlaces(tripId: string | null) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: tripsKeys.detail(tripId ?? ''),
    queryFn: ({ signal }) => fetchTripWithPlaces(tripId!, signal),
    enabled: !!userId && !!tripId,
  })
}

export function useCreateTrip() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async (data: TripInput): Promise<Trip> => {
      if (!userId) throw new Error('Not authenticated')
      return insertTripRow(userId, data)
    },
    onSuccess: (newTrip) => {
      if (!userId) return
      queryClient.setQueryData<TripListItem[]>(tripsKeys.list(userId), (old = []) => [
        { ...newTrip, place_count: 0 },
        ...old,
      ])
    },
    onError: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: tripsKeys.list(userId) })
      }
    },
  })
}

export function useUpdateTrip() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TripInput }): Promise<Trip> => {
      if (!userId) throw new Error('Not authenticated')
      return updateTripRow(id, data)
    },
    onSuccess: (updatedTrip) => {
      if (!userId) return
      queryClient.setQueryData<Trip[]>(tripsKeys.list(userId), (old = []) =>
        old.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)),
      )
      queryClient.setQueryData<TripListItem[]>(tripsKeys.list(userId), (old = []) =>
        old.map((t) => (t.id === updatedTrip.id ? { ...t, ...updatedTrip } : t)),
      )
    },
    onError: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: tripsKeys.lists() })
      }
    },
  })
}

export function useSetTripCover() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: ({
      id,
      coverPhotoPath,
      focusX,
      focusY,
    }: {
      id: string
      coverPhotoPath: string | null
      focusX: number
      focusY: number
    }): Promise<Trip> => {
      if (!userId) throw new Error('Not authenticated')
      return updateTripCover(id, coverPhotoPath, focusX, focusY)
    },
    onSuccess: (updatedTrip) => {
      if (!userId) return
      queryClient.setQueryData<TripListItem[]>(tripsKeys.list(userId), (old = []) =>
        old.map((t) => (t.id === updatedTrip.id ? { ...t, ...updatedTrip } : t)),
      )
      queryClient.setQueryData<TripWithPlaces | null>(tripsKeys.detail(updatedTrip.id), (old) =>
        old ? { ...old, ...updatedTrip } : old,
      )
    },
    onError: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: tripsKeys.lists() })
      }
    },
  })
}

export function useDeleteTrip() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      if (!userId) throw new Error('Not authenticated')
      await deleteTripRow(id)
      return id
    },
    onSuccess: (deletedId) => {
      if (!userId) return
      queryClient.setQueryData<TripListItem[]>(tripsKeys.list(userId), (old = []) =>
        old.filter((t) => t.id !== deletedId),
      )
      queryClient.removeQueries({ queryKey: tripsKeys.detail(deletedId) })
    },
    onError: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: tripsKeys.all })
      }
    },
  })
}

export function useAddPlaceToTrip() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async ({ tripId, placeId }: { tripId: string; placeId: string }) => {
      if (!userId) throw new Error('Not authenticated')

      const cached = queryClient.getQueryData<TripWithPlaces | null>(tripsKeys.detail(tripId))
      let position = 0
      if (cached && cached.trip_places.length > 0) {
        position = Math.max(...cached.trip_places.map((tp) => tp.position)) + 1
      } else {
        const fresh = await fetchTripWithPlaces(tripId)
        if (fresh && fresh.trip_places.length > 0) {
          position = Math.max(...fresh.trip_places.map((tp) => tp.position)) + 1
        }
      }

      return insertTripPlaceRow(tripId, placeId, position)
    },
    onSuccess: (_newTripPlace, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) })
    },
    onError: (_err, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) })
    },
  })
}

export function useRemovePlaceFromTrip() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async ({ tripId, placeId }: { tripId: string; placeId: string }) => {
      if (!userId) throw new Error('Not authenticated')
      await deleteTripPlaceRow(tripId, placeId)
      return { tripId, placeId }
    },
    onSuccess: ({ tripId, placeId }) => {
      queryClient.setQueryData<TripWithPlaces | null>(tripsKeys.detail(tripId), (old) => {
        if (!old) return old
        return {
          ...old,
          trip_places: old.trip_places.filter((tp) => tp.place_id !== placeId),
        }
      })
    },
    onError: (_err, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) })
    },
  })
}

export function useReorderTripPlaces() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tripId,
      orderedPlaceIds,
    }: {
      tripId: string
      orderedPlaceIds: string[]
    }) => {
      await updateTripPlacePositions(tripId, orderedPlaceIds)
      return { tripId, orderedPlaceIds }
    },
    onMutate: async ({ tripId, orderedPlaceIds }) => {
      await queryClient.cancelQueries({ queryKey: tripsKeys.detail(tripId) })
      const previous = queryClient.getQueryData<TripWithPlaces | null>(tripsKeys.detail(tripId))
      if (previous) {
        const reordered = orderedPlaceIds
          .map((placeId, index) => {
            const tp = previous.trip_places.find((p) => p.place_id === placeId)
            return tp ? { ...tp, position: index } : null
          })
          .filter((tp): tp is NonNullable<typeof tp> => tp !== null)
        queryClient.setQueryData<TripWithPlaces>(tripsKeys.detail(tripId), {
          ...previous,
          trip_places: reordered,
        })
      }
      return { previous }
    },
    onError: (_err, { tripId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tripsKeys.detail(tripId), context.previous)
      }
    },
  })
}
export function useUpdateTripPlace() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: async ({
      tripId,
      placeId,
      data,
    }: {
      tripId: string
      placeId: string
      data: TripPlaceUpdateInput
    }) => {
      if (!userId) throw new Error('Not authenticated')
      await updateTripPlaceRow(tripId, placeId, data)
      return { tripId, placeId, data }
    },
    onSuccess: ({ tripId, placeId, data }) => {
      queryClient.setQueryData<TripWithPlaces | null>(tripsKeys.detail(tripId), (old) => {
        if (!old) return old
        return {
          ...old,
          trip_places: old.trip_places.map((tp) =>
            tp.place_id === placeId ? { ...tp, ...data } : tp,
          ),
        }
      })
    },
    onError: (_err, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) })
    },
  })
}
