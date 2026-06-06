import type { Place } from '../types/place'
import type { CategoryId } from './categories'

export function filterPlacesByCategory(places: Place[], selected: Set<CategoryId>): Place[] {
  return places.filter((place) => selected.has(place.category))
}
