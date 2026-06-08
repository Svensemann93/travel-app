import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CATEGORIES } from '../lib/categories'
import type { CategoryId } from '../lib/categories'
import { CategoryFilterContext } from '../contexts/categoryFilter'
import type { CategoryFilterValue } from '../contexts/categoryFilter'

const ALL_IDS = CATEGORIES.map((c) => c.id)

function CategoryFilterProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Set<CategoryId>>(() => new Set(ALL_IDS))

  const toggle = useCallback((id: CategoryId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => setSelected(new Set(ALL_IDS)), [])
  const clear = useCallback(() => setSelected(new Set()), [])

  const value = useMemo<CategoryFilterValue>(
    () => ({
      selected,
      isSelected: (id) => selected.has(id),
      toggle,
      selectAll,
      clear,
      allSelected: selected.size === ALL_IDS.length,
    }),
    [selected, toggle, selectAll, clear],
  )

  return <CategoryFilterContext.Provider value={value}>{children}</CategoryFilterContext.Provider>
}

export default CategoryFilterProvider
