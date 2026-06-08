import { createContext, useContext } from 'react'
import type { CategoryId } from '../lib/categories'

export type CategoryFilterValue = {
  selected: Set<CategoryId>
  isSelected: (id: CategoryId) => boolean
  toggle: (id: CategoryId) => void
  selectAll: () => void
  clear: () => void
  allSelected: boolean
}

export const CategoryFilterContext = createContext<CategoryFilterValue | null>(null)

export function useCategoryFilter(): CategoryFilterValue {
  const ctx = useContext(CategoryFilterContext)
  if (!ctx) {
    throw new Error('useCategoryFilter must be used within a CategoryFilterProvider')
  }
  return ctx
}
