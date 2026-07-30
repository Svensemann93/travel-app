import { describe, expect, it } from 'vitest'
import { normalizeInterests } from './profileInterests'

describe('normalizeInterests', () => {
  it('trims and drops empty values', () => {
    expect(normalizeInterests(['  Berge ', '', '   '])).toEqual(['Berge'])
  })

  it('removes case-insensitive duplicates, keeping the first', () => {
    expect(normalizeInterests(['Kaffee', 'kaffee', 'KAFFEE'])).toEqual(['Kaffee'])
  })

  it('caps the number of items at ten', () => {
    const many = Array.from({ length: 15 }, (_, i) => `tag${i}`)
    expect(normalizeInterests(many)).toHaveLength(10)
  })

  it('truncates overly long items', () => {
    const long = 'a'.repeat(50)
    expect(normalizeInterests([long])[0]).toHaveLength(30)
  })

  it('returns an empty array for no values', () => {
    expect(normalizeInterests([])).toEqual([])
  })
})
