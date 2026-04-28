import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Place } from '../types/place'

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadPlaces = useCallback(async () => {
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
    loadPlaces().finally(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [loadPlaces])
  return { places, isLoading, errorMessage, reload: loadPlaces }
}
