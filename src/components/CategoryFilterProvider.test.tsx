import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CATEGORIES } from '../lib/categories'
import { useCategoryFilter } from '../contexts/categoryFilter'
import CategoryFilterProvider from './CategoryFilterProvider'

function wrapper({ children }: { children: ReactNode }) {
  return <CategoryFilterProvider>{children}</CategoryFilterProvider>
}

describe('CategoryFilterProvider / useCategoryFilter', () => {
  it('selects all categories by default', () => {
    const { result } = renderHook(() => useCategoryFilter(), { wrapper })
    expect(result.current.allSelected).toBe(true)
    expect(result.current.selected.size).toBe(CATEGORIES.length)
  })

  it('toggles a category off and back on', () => {
    const { result } = renderHook(() => useCategoryFilter(), { wrapper })

    act(() => {
      result.current.toggle('restaurant')
    })
    expect(result.current.isSelected('restaurant')).toBe(false)
    expect(result.current.allSelected).toBe(false)

    act(() => {
      result.current.toggle('restaurant')
    })
    expect(result.current.isSelected('restaurant')).toBe(true)
    expect(result.current.allSelected).toBe(true)
  })

  it('clears all categories', () => {
    const { result } = renderHook(() => useCategoryFilter(), { wrapper })

    act(() => {
      result.current.clear()
    })
    expect(result.current.selected.size).toBe(0)
    expect(result.current.allSelected).toBe(false)
    expect(result.current.isSelected('cafe')).toBe(false)
  })

  it('re-selects all categories with selectAll', () => {
    const { result } = renderHook(() => useCategoryFilter(), { wrapper })

    act(() => {
      result.current.clear()
    })
    act(() => {
      result.current.selectAll()
    })
    expect(result.current.allSelected).toBe(true)
    expect(result.current.selected.size).toBe(CATEGORIES.length)
  })

  it('throws when used outside of a provider', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useCategoryFilter())).toThrow(
      /must be used within a CategoryFilterProvider/,
    )
    errorSpy.mockRestore()
  })
})
