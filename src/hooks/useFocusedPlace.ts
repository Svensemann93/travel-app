import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Place } from '../types/place'

export function useFocusedPlace(places: Place[]): Place | null {
  const [searchParams, setSearchParams] = useSearchParams()
  const focusId = searchParams.get('focus')
  const focusedPlace = focusId ? (places.find((p) => p.id === focusId) ?? null) : null

  useEffect(() => {
    if (focusId && focusedPlace) {
      const timer = setTimeout(() => {
        setSearchParams({}, { replace: true })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [focusId, focusedPlace, setSearchParams])

  return focusedPlace
}
