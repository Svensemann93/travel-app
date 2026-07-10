import type { Place } from '../types/place'
import type { CategoryId } from './categories'
import { CATEGORIES } from './categories'
import { COUNTRY_CONTINENT } from './continents'

export type TravelStats = {
  placeCount: number
  photoCount: number
  publicPlaceCount: number
  tripCount: number
  journalCount: number
  categoryCounts: Record<CategoryId, number>
  categoriesCovered: number
  countryCount: number
  continentCount: number
}

export function computeTravelStats(
  places: Place[],
  tripCount: number,
  journalCount: number,
): TravelStats {
  const categoryCounts: Record<CategoryId, number> = {} as Record<CategoryId, number>
  for (const category of CATEGORIES) {
    categoryCounts[category.id] = 0
  }

  let photoCount = 0
  let publicPlaceCount = 0
  const countries = new Set<string>()
  const continents = new Set<string>()

  for (const place of places) {
    categoryCounts[place.category] = (categoryCounts[place.category] ?? 0) + 1
    photoCount += place.photos.length
    if (place.is_public) publicPlaceCount += 1
    if (place.country_code) {
      countries.add(place.country_code)
      const continent = COUNTRY_CONTINENT[place.country_code]
      if (continent) continents.add(continent)
    }
  }

  const categoriesCovered = CATEGORIES.filter((c) => categoryCounts[c.id] > 0).length

  return {
    placeCount: places.length,
    photoCount,
    publicPlaceCount,
    tripCount,
    journalCount,
    categoryCounts,
    categoriesCovered,
    countryCount: countries.size,
    continentCount: continents.size,
  }
}

export function computeGeoReach(codes: (string | null | undefined)[]): {
  countryCount: number
  continentCount: number
} {
  const countries = new Set<string>()
  const continents = new Set<string>()
  for (const code of codes) {
    if (!code) continue
    countries.add(code)
    const continent = COUNTRY_CONTINENT[code]
    if (continent) continents.add(continent)
  }
  return { countryCount: countries.size, continentCount: continents.size }
}
