import type { Place } from '../types/place'

export function distinctCountryCount(places: Place[]): number {
  const codes = new Set<string>()
  for (const place of places) {
    if (place.country_code) codes.add(place.country_code.toUpperCase())
  }
  return codes.size
}
