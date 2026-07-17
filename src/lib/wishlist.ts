import { countryName } from './countryNames'
import type { CategoryId } from './categories'
import type { PublicPlace } from '../types/place'

export const WISHLIST_SORTS = ['added', 'name', 'rating', 'category'] as const

export type WishlistSort = (typeof WISHLIST_SORTS)[number]

export type CategoryLabel = (id: CategoryId) => string

export type WishlistGroup = {
  code: string | null
  name: string
  places: PublicPlace[]
}

export function sortWishlist(
  places: PublicPlace[],
  sort: WishlistSort,
  lang: string,
  categoryLabel: CategoryLabel,
): PublicPlace[] {
  const byName = (a: PublicPlace, b: PublicPlace) => a.name.localeCompare(b.name, lang)
  const sorted = [...places]

  if (sort === 'name') {
    sorted.sort(byName)
  } else if (sort === 'rating') {
    sorted.sort((a, b) => (b.avg_rating ?? -1) - (a.avg_rating ?? -1) || byName(a, b))
  } else if (sort === 'category') {
    sorted.sort(
      (a, b) =>
        categoryLabel(a.category).localeCompare(categoryLabel(b.category), lang) || byName(a, b),
    )
  } else {
    sorted.sort((a, b) => (b.wished_on ?? '').localeCompare(a.wished_on ?? '') || byName(a, b))
  }

  return sorted
}

export function groupWishlistByCountry(places: PublicPlace[], lang: string): WishlistGroup[] {
  const buckets = new Map<string, PublicPlace[]>()
  for (const place of places) {
    const key = place.country_code ?? ''
    const bucket = buckets.get(key)
    if (bucket) bucket.push(place)
    else buckets.set(key, [place])
  }

  const groups: WishlistGroup[] = []
  for (const [key, bucket] of buckets) {
    groups.push({ code: key || null, name: key ? countryName(key, lang) : '', places: bucket })
  }

  groups.sort((a, b) => {
    if (a.code === null) return 1
    if (b.code === null) return -1
    return a.name.localeCompare(b.name, lang)
  })

  return groups
}
