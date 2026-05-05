/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { PlacesContext } from './placesContextValue'
import { AuthContext } from './authContextValue'
import type { Place } from '../types/place'

export function PlacesProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext)
  const userId = auth?.user?.id ?? null

  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchPlaces = useCallback(
    async (signal?: AbortSignal) => {
      if (!userId) {
        setPlaces([])
        return
      }

      const query = supabase
        .from('places')
        .select('*, photos:place_photos(*)')
        .order('created_at', { ascending: false })

      if (signal) {
        query.abortSignal(signal)
      }

      const { data, error } = await query

      if (signal?.aborted) return

      if (error) {
        setErrorMessage(error.message)
        setPlaces([])
      } else {
        setErrorMessage(null)
        setPlaces(data ?? [])
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
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    })

    return () => {
      controller.abort()
    }
  }, [userId, fetchPlaces])

  const value = useMemo(
    () => ({ places, isLoading, errorMessage, reload }),
    [places, isLoading, errorMessage, reload],
  )

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>
}
