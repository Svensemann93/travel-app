import { countryName } from './countryNames'
import { visitOf } from './placeVisits'
import type { CategoryId } from './categories'
import type { Place } from '../types/place'

export const PLACE_SORTS = ['visited', 'name', 'rating', 'category', 'country'] as const

export type PlaceSort = (typeof PLACE_SORTS)[number]

export type CategoryLabel = (id: CategoryId) => string

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function searchPlaces(places: Place[], query: string): Place[] {
  const needle = fold(query.trim())
  if (!needle) return places
  return places.filter((place) => fold(place.name).includes(needle))
}

function visitedAt(place: Place): string {
  const visit = visitOf(place)
  return visit?.visited_on ?? visit?.created_at ?? place.created_at ?? ''
}

export function sortPlaces(
  places: Place[],
  sort: PlaceSort,
  lang: string,
  categoryLabel: CategoryLabel,
): Place[] {
  const byName = (a: Place, b: Place) => a.name.localeCompare(b.name, lang)
  const country = (place: Place) =>
    place.country_code ? countryName(place.country_code, lang) : ''
  const sorted = [...places]

  if (sort === 'name') {
    sorted.sort(byName)
  } else if (sort === 'rating') {
    sorted.sort((a, b) => (visitOf(b)?.rating ?? -1) - (visitOf(a)?.rating ?? -1) || byName(a, b))
  } else if (sort === 'category') {
    sorted.sort(
      (a, b) =>
        categoryLabel(a.category).localeCompare(categoryLabel(b.category), lang) || byName(a, b),
    )
  } else if (sort === 'country') {
    sorted.sort((a, b) => {
      const left = country(a)
      const right = country(b)
      if (!left !== !right) return left ? -1 : 1
      return left.localeCompare(right, lang) || byName(a, b)
    })
  } else {
    sorted.sort((a, b) => visitedAt(b).localeCompare(visitedAt(a)) || byName(a, b))
  }

  return sorted
}
