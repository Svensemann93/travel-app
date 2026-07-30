import { describe, expect, it } from 'vitest'
import { distinctCountryCount } from './profileStats'
import type { Place } from '../types/place'

function place(country_code: string | null): Place {
  return { country_code } as Place
}

describe('distinctCountryCount', () => {
  it('counts unique country codes', () => {
    expect(distinctCountryCount([place('CH'), place('IT'), place('CH')])).toBe(2)
  })

  it('ignores null and empty codes', () => {
    expect(distinctCountryCount([place(null), place(''), place('CH')])).toBe(1)
  })

  it('treats codes case-insensitively', () => {
    expect(distinctCountryCount([place('ch'), place('CH')])).toBe(1)
  })

  it('returns zero for an empty list', () => {
    expect(distinctCountryCount([])).toBe(0)
  })
})
