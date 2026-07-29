import { useCallback, useState } from 'react'
import { useUpdatePlaceLocation } from './usePlaces'
import type { Place } from '../types/place'

type PendingPosition = { lat: number; lng: number }

export function useReposition() {
  const updateLocation = useUpdatePlaceLocation()
  const [place, setPlace] = useState<Place | null>(null)
  const [pendingPosition, setPendingPosition] = useState<PendingPosition | null>(null)

  function start(target: Place) {
    setPlace(target)
    setPendingPosition(null)
  }

  const dragMove = useCallback((latitude: number, longitude: number) => {
    setPendingPosition({ lat: latitude, lng: longitude })
  }, [])

  function cancel() {
    setPlace(null)
    setPendingPosition(null)
  }

  function confirm() {
    if (!place || !pendingPosition) return
    updateLocation.mutate(
      { id: place.id, latitude: pendingPosition.lat, longitude: pendingPosition.lng },
      {
        onSuccess: () => {
          setPlace(null)
          setPendingPosition(null)
        },
        onError: (err) => console.error('Reposition error:', err),
      },
    )
  }

  return {
    place,
    pendingPosition,
    isSaving: updateLocation.isPending,
    start,
    dragMove,
    cancel,
    confirm,
  }
}
