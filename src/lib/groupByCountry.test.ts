import { describe, expect, it } from 'vitest'
import { groupByCountry } from './groupByCountry'

const zermatt = { id: 'a', country_code: 'CH' }
const kyoto = { id: 'b', country_code: 'JP' }
const bern = { id: 'c', country_code: 'CH' }
const nowhere = { id: 'd', country_code: null }

describe('groupByCountry', () => {
  it('groups by country and names the group in the current language', () => {
    const groups = groupByCountry([zermatt, kyoto, bern], 'de')
    expect(groups.map((g) => g.code)).toEqual(['JP', 'CH'])
    expect(groups[0].name).toBe('Japan')
    expect(groups[1].name).toBe('Schweiz')
  })

  it('names the group in English too', () => {
    expect(groupByCountry([zermatt], 'en')[0].name).toBe('Switzerland')
  })

  it('keeps the incoming order inside a group', () => {
    const groups = groupByCountry([bern, kyoto, zermatt], 'de')
    const swiss = groups.find((g) => g.code === 'CH')
    expect(swiss?.items.map((i) => i.id)).toEqual(['c', 'a'])
  })

  it('puts items without a country last, with an empty name', () => {
    const groups = groupByCountry([nowhere, kyoto], 'de')
    expect(groups.map((g) => g.code)).toEqual(['JP', null])
    expect(groups[1].name).toBe('')
  })

  it('returns nothing for an empty list', () => {
    expect(groupByCountry([], 'de')).toEqual([])
  })
})
