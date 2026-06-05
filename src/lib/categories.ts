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
  label: string
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'restaurant', label: 'Restaurant', color: '#ef4444' },
  { id: 'cafe', label: 'Café', color: '#d97706' },
  { id: 'bar', label: 'Bar & Ausgehen', color: '#9333ea' },
  { id: 'sight', label: 'Sehenswürdigkeit', color: '#2563eb' },
  { id: 'nature', label: 'Natur & Aussicht', color: '#16a34a' },
  { id: 'lodging', label: 'Unterkunft', color: '#0d9488' },
  { id: 'activity', label: 'Aktivität', color: '#0891b2' },
  { id: 'hiking', label: 'Wandern', color: '#92400e' },
  { id: 'other', label: 'Sonstiges', color: '#6b7280' },
]

export const DEFAULT_CATEGORY: CategoryId = 'other'

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>
