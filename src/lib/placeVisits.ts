import type { Place, PlaceVisit } from '../types/place'

export function visitOf(place: Place): PlaceVisit | null {
  return place.visits[0] ?? null
}

export function isVisited(place: Place): boolean {
  return place.visits.length > 0
}
