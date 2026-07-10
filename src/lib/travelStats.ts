import type { Place } from '../types/place'
import type { CategoryId } from './categories'
import { CATEGORIES } from './categories'
import { COUNTRY_CONTINENT } from './continents'

export type CountedPlace = {
  category: CategoryId
  country_code: string | null
}

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
  countryCodes: string[]
}

export function computeTravelStats(
  ownPlaces: Place[],
  visitedPlaces: CountedPlace[],
  tripCount: number,
  journalCount: number,
): TravelStats {
  const categoryCounts: Record<CategoryId, number> = {} as Record<CategoryId, number>
  for (const category of CATEGORIES) {
    categoryCounts[category.id] = 0
  }

  const countries = new Set<string>()
  const continents = new Set<string>()

  const count = (category: CategoryId, code: string | null) => {
    categoryCounts[category] = (categoryCounts[category] ?? 0) + 1
    if (code) {
      countries.add(code)
      const continent = COUNTRY_CONTINENT[code]
      if (continent) continents.add(continent)
    }
  }

  let photoCount = 0
  let publicPlaceCount = 0
  for (const place of ownPlaces) {
    count(place.category, place.country_code)
    photoCount += place.photos.length
    if (place.is_public) publicPlaceCount += 1
  }
  for (const place of visitedPlaces) {
    count(place.category, place.country_code)
  }

  const categoriesCovered = CATEGORIES.filter((c) => categoryCounts[c.id] > 0).length

  return {
    placeCount: ownPlaces.length + visitedPlaces.length,
    photoCount,
    publicPlaceCount,
    tripCount,
    journalCount,
    categoryCounts,
    categoriesCovered,
    countryCount: countries.size,
    continentCount: continents.size,
    countryCodes: [...countries],
  }
}
