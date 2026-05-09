import { renderHook, waitFor } from '@testing-library/react'
import type { TripWithPlaces } from '../types/trip'
import {
  fetchTripWithPlaces,
  insertTripPlaceRow,
  updateTripPlacePositions,
  updateTripPlaceRow,
} from '../lib/tripsApi'
import { makeTripPlace, makeTripPlaceWithPlace, makeTripWithPlaces } from '../test/fixtures'
import { createTestQueryWrapper } from '../test/utils'
import { tripsKeys, useAddPlaceToTrip, useReorderTripPlaces, useUpdateTripPlace } from './useTrips'

vi.mock('../lib/tripsApi', () => ({
  fetchTripsForUser: vi.fn(),
  fetchTripWithPlaces: vi.fn(),
  insertTripRow: vi.fn(),
  updateTripRow: vi.fn(),
  deleteTripRow: vi.fn(),
  insertTripPlaceRow: vi.fn(),
  deleteTripPlaceRow: vi.fn(),
  updateTripPlacePositions: vi.fn(),
  updateTripPlaceRow: vi.fn(),
}))

vi.mock('./useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useReorderTripPlaces', () => {
  it('reorders trip_places in the cache when mutate is called', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    queryClient.setQueryData(
      tripsKeys.detail('trip-1'),
      makeTripWithPlaces({
        trip_places: [
          makeTripPlaceWithPlace({ place_id: 'a', position: 0 }),
          makeTripPlaceWithPlace({ place_id: 'b', position: 1 }),
          makeTripPlaceWithPlace({ place_id: 'c', position: 2 }),
        ],
      }),
    )

    vi.mocked(updateTripPlacePositions).mockResolvedValue(undefined)

    const { result } = renderHook(() => useReorderTripPlaces(), { wrapper })
    result.current.mutate({
      tripId: 'trip-1',
      orderedPlaceIds: ['c', 'a', 'b'],
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<TripWithPlaces>(tripsKeys.detail('trip-1'))
      expect(cached?.trip_places.map((tp) => tp.place_id)).toEqual(['c', 'a', 'b'])
    })
  })

  it('resets positions to sequential indices regardless of original values', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    queryClient.setQueryData(
      tripsKeys.detail('trip-1'),
      makeTripWithPlaces({
        trip_places: [
          makeTripPlaceWithPlace({ place_id: 'a', position: 5 }),
          makeTripPlaceWithPlace({ place_id: 'b', position: 12 }),
          makeTripPlaceWithPlace({ place_id: 'c', position: 99 }),
        ],
      }),
    )

    vi.mocked(updateTripPlacePositions).mockResolvedValue(undefined)

    const { result } = renderHook(() => useReorderTripPlaces(), { wrapper })
    result.current.mutate({
      tripId: 'trip-1',
      orderedPlaceIds: ['c', 'a', 'b'],
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<TripWithPlaces>(tripsKeys.detail('trip-1'))
      expect(cached?.trip_places.map((tp) => tp.position)).toEqual([0, 1, 2])
    })
  })

  it('rolls back to the previous cache state when the API call fails', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    const initial = makeTripWithPlaces({
      trip_places: [
        makeTripPlaceWithPlace({ place_id: 'a', position: 0 }),
        makeTripPlaceWithPlace({ place_id: 'b', position: 1 }),
      ],
    })
    queryClient.setQueryData(tripsKeys.detail('trip-1'), initial)

    vi.mocked(updateTripPlacePositions).mockRejectedValue(new Error('API down'))

    const { result } = renderHook(() => useReorderTripPlaces(), { wrapper })
    result.current.mutate({
      tripId: 'trip-1',
      orderedPlaceIds: ['b', 'a'],
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<TripWithPlaces>(tripsKeys.detail('trip-1'))
    expect(cached?.trip_places.map((tp) => tp.place_id)).toEqual(['a', 'b'])
    expect(cached?.trip_places.map((tp) => tp.position)).toEqual([0, 1])
  })

  it('filters out place_ids that are not present in the cached trip', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    queryClient.setQueryData(
      tripsKeys.detail('trip-1'),
      makeTripWithPlaces({
        trip_places: [
          makeTripPlaceWithPlace({ place_id: 'a', position: 0 }),
          makeTripPlaceWithPlace({ place_id: 'b', position: 1 }),
        ],
      }),
    )

    vi.mocked(updateTripPlacePositions).mockResolvedValue(undefined)

    const { result } = renderHook(() => useReorderTripPlaces(), { wrapper })
    result.current.mutate({
      tripId: 'trip-1',
      orderedPlaceIds: ['b', 'unknown-place', 'a'],
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<TripWithPlaces>(tripsKeys.detail('trip-1'))
      expect(cached?.trip_places.map((tp) => tp.place_id)).toEqual(['b', 'a'])
    })
  })
})

describe('useAddPlaceToTrip', () => {
  it('inserts at position 0 when the cached trip has no places', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    queryClient.setQueryData(tripsKeys.detail('trip-1'), makeTripWithPlaces({ trip_places: [] }))

    vi.mocked(insertTripPlaceRow).mockResolvedValue(makeTripPlace())

    const { result } = renderHook(() => useAddPlaceToTrip(), { wrapper })
    result.current.mutate({ tripId: 'trip-1', placeId: 'place-1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertTripPlaceRow).toHaveBeenCalledWith('trip-1', 'place-1', 0)
  })

  it('inserts at max(position) + 1 when the cached trip has existing places', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    queryClient.setQueryData(
      tripsKeys.detail('trip-1'),
      makeTripWithPlaces({
        trip_places: [
          makeTripPlaceWithPlace({ place_id: 'a', position: 0 }),
          makeTripPlaceWithPlace({ place_id: 'b', position: 5 }),
          makeTripPlaceWithPlace({ place_id: 'c', position: 2 }),
        ],
      }),
    )

    vi.mocked(insertTripPlaceRow).mockResolvedValue(
      makeTripPlace({ place_id: 'new-place', position: 6 }),
    )

    const { result } = renderHook(() => useAddPlaceToTrip(), { wrapper })
    result.current.mutate({ tripId: 'trip-1', placeId: 'new-place' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertTripPlaceRow).toHaveBeenCalledWith('trip-1', 'new-place', 6)
  })

  it('falls back to fetchTripWithPlaces when no cache entry exists', async () => {
    const { wrapper } = createTestQueryWrapper()

    vi.mocked(fetchTripWithPlaces).mockResolvedValue(
      makeTripWithPlaces({
        trip_places: [makeTripPlaceWithPlace({ place_id: 'a', position: 3 })],
      }),
    )
    vi.mocked(insertTripPlaceRow).mockResolvedValue(
      makeTripPlace({ place_id: 'new-place', position: 4 }),
    )

    const { result } = renderHook(() => useAddPlaceToTrip(), { wrapper })
    result.current.mutate({ tripId: 'trip-1', placeId: 'new-place' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetchTripWithPlaces).toHaveBeenCalledWith('trip-1')
    expect(insertTripPlaceRow).toHaveBeenCalledWith('trip-1', 'new-place', 4)
  })

  it('uses position 0 when neither cache nor fetch returns places', async () => {
    const { wrapper } = createTestQueryWrapper()

    vi.mocked(fetchTripWithPlaces).mockResolvedValue(null)
    vi.mocked(insertTripPlaceRow).mockResolvedValue(makeTripPlace())

    const { result } = renderHook(() => useAddPlaceToTrip(), { wrapper })
    result.current.mutate({ tripId: 'trip-1', placeId: 'new-place' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertTripPlaceRow).toHaveBeenCalledWith('trip-1', 'new-place', 0)
  })
})

describe('useUpdateTripPlace', () => {
  it('patches the target trip_place with new data in the cache', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    queryClient.setQueryData(
      tripsKeys.detail('trip-1'),
      makeTripWithPlaces({
        trip_places: [
          makeTripPlaceWithPlace({
            place_id: 'a',
            planned_date: null,
            notes: null,
          }),
        ],
      }),
    )

    vi.mocked(updateTripPlaceRow).mockResolvedValue(makeTripPlace())

    const { result } = renderHook(() => useUpdateTripPlace(), { wrapper })
    result.current.mutate({
      tripId: 'trip-1',
      placeId: 'a',
      data: { planned_date: '2025-06-01', notes: 'New note' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData<TripWithPlaces>(tripsKeys.detail('trip-1'))
    expect(cached?.trip_places[0].planned_date).toBe('2025-06-01')
    expect(cached?.trip_places[0].notes).toBe('New note')
  })

  it('leaves other trip_places unchanged when patching one', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    queryClient.setQueryData(
      tripsKeys.detail('trip-1'),
      makeTripWithPlaces({
        trip_places: [
          makeTripPlaceWithPlace({
            place_id: 'a',
            planned_date: '2025-05-01',
            notes: 'A note',
          }),
          makeTripPlaceWithPlace({
            place_id: 'b',
            planned_date: '2025-05-02',
            notes: 'B note',
          }),
        ],
      }),
    )

    vi.mocked(updateTripPlaceRow).mockResolvedValue(makeTripPlace())

    const { result } = renderHook(() => useUpdateTripPlace(), { wrapper })
    result.current.mutate({
      tripId: 'trip-1',
      placeId: 'a',
      data: { planned_date: '2025-06-01', notes: 'Updated' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueryData<TripWithPlaces>(tripsKeys.detail('trip-1'))
    const placeB = cached?.trip_places.find((tp) => tp.place_id === 'b')
    expect(placeB?.planned_date).toBe('2025-05-02')
    expect(placeB?.notes).toBe('B note')
  })

  it('does not create a cache entry when none exists', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()

    vi.mocked(updateTripPlaceRow).mockResolvedValue(makeTripPlace())

    const { result } = renderHook(() => useUpdateTripPlace(), { wrapper })
    result.current.mutate({
      tripId: 'trip-1',
      placeId: 'a',
      data: { planned_date: '2025-06-01', notes: 'Note' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(tripsKeys.detail('trip-1'))).toBeFalsy()
  })
})
