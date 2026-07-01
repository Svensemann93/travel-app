export type CategoryId =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'sight'
  | 'nature'
  | 'lodging'
  | 'activity'
  | 'hiking'
  | 'other'

export type Category = {
  id: CategoryId
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'restaurant', color: '#ef4444' },
  { id: 'cafe', color: '#d97706' },
  { id: 'bar', color: '#9333ea' },
  { id: 'sight', color: '#2563eb' },
  { id: 'nature', color: '#16a34a' },
  { id: 'lodging', color: '#0d9488' },
  { id: 'activity', color: '#0891b2' },
  { id: 'hiking', color: '#92400e' },
  { id: 'other', color: '#6b7280' },
]

export const DEFAULT_CATEGORY: CategoryId = 'other'

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>
