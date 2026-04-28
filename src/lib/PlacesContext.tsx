import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { PlacesContext } from './placesContextValue'
import type { Place } from '../types/place'

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMessage(error.message)
      setPlaces([])
    } else {
      setErrorMessage(null)
      setPlaces(data ?? [])
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload().finally(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [reload])

  return (
    <PlacesContext.Provider value={{ places, isLoading, errorMessage, reload }}>
      {children}
    </PlacesContext.Provider>
  )
}
