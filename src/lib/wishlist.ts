import type { CategoryId } from './categories'
import type { PublicPlace } from '../types/place'

export const WISHLIST_SORTS = ['added', 'name', 'rating', 'category'] as const

export type WishlistSort = (typeof WISHLIST_SORTS)[number]

export type CategoryLabel = (id: CategoryId) => string

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
