import { useContext } from 'react'
import { PlacesContext } from '../lib/placesContextValue'

export function usePlaces() {
  const context = useContext(PlacesContext)
  if (context === undefined) {
    throw new Error('usePlaces must be used within PlacesProvider')
  }
  return context
}
