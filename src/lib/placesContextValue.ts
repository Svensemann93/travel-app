import { createContext } from 'react'
import type { Place } from '../types/place'

export type PlaceUpdateInput = {
  name: string
  description: string | null
  rating: number | null
  price_level: number | null
  website_url: string | null
}

export type PlaceCreateInput = PlaceUpdateInput & {
  latitude: number
  longitude: number
}

export type PlacesContextType = {
  places: Place[]
  isLoading: boolean
  errorMessage: string | null
  reload: () => Promise<void>
  createPlace: (data: PlaceCreateInput, photos: File[]) => Promise<Place>
  updatePlace: (
    id: string,
    data: PlaceUpdateInput,
    photosToAdd: File[],
    photoIdsToDelete: string[],
  ) => Promise<Place>
  deletePlace: (id: string) => Promise<void>
}

export const PlacesContext = createContext<PlacesContextType | undefined>(undefined)
