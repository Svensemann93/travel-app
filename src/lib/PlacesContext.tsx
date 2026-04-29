/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
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

  const reload = useCallback(async () => {
    if (!userId) {
      setPlaces([])
      return
    }

    const { data, error } = await supabase
      .from('places')
      .select('*, photos:place_photos(*)')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMessage(error.message)
      setPlaces([])
    } else {
      setErrorMessage(null)
      setPlaces(data ?? [])
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setPlaces([])
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    reload().finally(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [userId, reload])

  return (
    <PlacesContext.Provider value={{ places, isLoading, errorMessage, reload }}>
      {children}
    </PlacesContext.Provider>
  )
}
