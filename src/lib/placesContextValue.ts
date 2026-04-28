import { createContext } from 'react'
import type { Place } from '../types/place'

export type PlacesContextType = {
  places: Place[]
  isLoading: boolean
  errorMessage: string | null
  reload: () => Promise<void>
}

export const PlacesContext = createContext<PlacesContextType | undefined>(undefined)
