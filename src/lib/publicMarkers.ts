import type { PublicPlace } from '../types/place'

export type PublicMarkerVariant = 'visited' | 'wished' | 'plain'

export function publicMarkerVariant(place: PublicPlace): PublicMarkerVariant {
  if (place.visited_by_me) return 'visited'
  if (place.wished_by_me) return 'wished'
  return 'plain'
}
