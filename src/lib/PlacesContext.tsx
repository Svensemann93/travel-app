/* eslint-disable react-hooks/set-state-in-effect */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { PlacesContext } from './placesContextValue'
import type { PlaceCreateInput, PlaceUpdateInput } from './placesContextValue'
import { AuthContext } from './authContextValue'
import {
  fetchPlacesForUser,
  insertPlaceRow,
  updatePlaceRow,
  deletePlaceRow,
  insertPhotoRows,
  removePhotos,
  removePhotoStorageOnly,
} from './placesApi'
import type { Place, PlacePhoto } from '../types/place'

export function PlacesProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext)
  const userId = auth?.user?.id ?? null

  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const placesRef = useRef<Place[]>([])
  useEffect(() => {
    placesRef.current = places
  }, [places])

  const fetchPlaces = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setPlaces([])
        return
      }
      try {
        const rows = await fetchPlacesForUser(signal)
        if (signal?.aborted) return
        setErrorMessage(null)
        setPlaces(rows)
      } catch (err) {
        if (signal?.aborted) return
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
        setPlaces([])
      }
    },
    [userId],
  )

  const reload = useCallback(() => fetchPlaces(), [fetchPlaces])

  useEffect(() => {
    if (!userId) {
      setPlaces([])
      setErrorMessage(null)
      setIsLoading(false)
      return
    }
    const controller = new AbortController()
    setIsLoading(true)
    fetchPlaces(controller.signal).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false)
    })
    return () => controller.abort()
  }, [userId, fetchPlaces])

  const createPlace = useCallback(
    async (data: PlaceCreateInput, photos: File[]): Promise<Place> => {
      if (!userId) throw new Error('Not authenticated')
      const row = await insertPlaceRow(userId, data)
      let photoRows: PlacePhoto[]
      try {
        photoRows = await insertPhotoRows(userId, row.id, photos, 0)
      } catch (err) {
        await fetchPlaces()
        throw err
      }
      const newPlace: Place = { ...row, photos: photoRows }
      setPlaces((prev) => [newPlace, ...prev])
      return newPlace
    },
    [userId, fetchPlaces],
  )

  const updatePlace = useCallback(
    async (
      id: string,
      data: PlaceUpdateInput,
      photosToAdd: File[],
      photoIdsToDelete: string[],
    ): Promise<Place> => {
      if (!userId) throw new Error('Not authenticated')
      const existing = placesRef.current.find((p) => p.id === id)
      if (!existing) throw new Error('Place not found')

      const row = await updatePlaceRow(id, data)

      let remainingPhotos = existing.photos
      if (photoIdsToDelete.length > 0) {
        const toDelete = existing.photos.filter((p) => photoIdsToDelete.includes(p.id))
        await removePhotos(toDelete)
        remainingPhotos = existing.photos.filter((p) => !photoIdsToDelete.includes(p.id))
      }

      let addedPhotos: PlacePhoto[]
      try {
        addedPhotos = await insertPhotoRows(userId, id, photosToAdd, remainingPhotos.length)
      } catch (err) {
        await fetchPlaces()
        throw err
      }

      const updatedPlace: Place = {
        ...row,
        photos: [...remainingPhotos, ...addedPhotos],
      }
      setPlaces((prev) => prev.map((p) => (p.id === id ? updatedPlace : p)))
      return updatedPlace
    },
    [userId, fetchPlaces],
  )

  const deletePlace = useCallback(async (id: string): Promise<void> => {
    const place = placesRef.current.find((p) => p.id === id)
    if (!place) throw new Error('Place not found')
    await removePhotoStorageOnly(place.photos)
    await deletePlaceRow(id)
    setPlaces((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      places,
      isLoading,
      errorMessage,
      reload,
      createPlace,
      updatePlace,
      deletePlace,
    }),
    [places, isLoading, errorMessage, reload, createPlace, updatePlace, deletePlace],
  )

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>
}
