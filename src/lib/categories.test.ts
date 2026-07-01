import { CATEGORIES, CATEGORY_MAP, DEFAULT_CATEGORY } from './categories'

describe('CATEGORIES', () => {
  it('has unique category ids', () => {
    const ids = CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every category a valid hex color', () => {
    for (const category of CATEGORIES) {
      expect(category.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('CATEGORY_MAP', () => {
  it('contains exactly one entry per category', () => {
    expect(Object.keys(CATEGORY_MAP)).toHaveLength(CATEGORIES.length)
  })

  it('resolves each category by its id', () => {
    for (const category of CATEGORIES) {
      expect(CATEGORY_MAP[category.id]).toBe(category)
    }
  })
})

describe('DEFAULT_CATEGORY', () => {
  it('resolves to an existing category in the map', () => {
    expect(CATEGORY_MAP[DEFAULT_CATEGORY]).toBeDefined()
    expect(CATEGORY_MAP[DEFAULT_CATEGORY].id).toBe(DEFAULT_CATEGORY)
  })

  it('is part of the CATEGORIES list', () => {
    expect(CATEGORIES.some((c) => c.id === DEFAULT_CATEGORY)).toBe(true)
  })
})
