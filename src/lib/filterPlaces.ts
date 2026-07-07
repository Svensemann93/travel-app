import type { CategoryId } from './categories'

export function filterPlacesByCategory<T extends { category: CategoryId }>(
  places: T[],
  selected: Set<CategoryId>,
): T[] {
  return places.filter((place) => selected.has(place.category))
}
