import { describe, expect, it } from 'vitest'
import { UNPLANNED, applyMove, flattenIds, groupByDay, signature, tripDays } from './tripDays'
import type { TripPlaceWithPlace } from '../types/trip'

function tripPlace(placeId: string, plannedDate: string | null): TripPlaceWithPlace {
  return {
    trip_id: 't',
    place_id: placeId,
    position: 0,
    planned_date: plannedDate,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    place_name: null,
    place_latitude: null,
    place_longitude: null,
    place_category: null,
    place_country_code: null,
    is_foreign: false,
    place: {
      id: placeId,
      user_id: 'u',
      name: placeId,
      description: null,
      latitude: 47,
      longitude: 8,
      category: 'other',
      website_url: null,
      is_public: false,
      country_code: null,
      adopted: false,
      created_at: '2026-01-01T00:00:00Z',
      photos: [],
      visits: [],
    },
  }
}

describe('tripDays', () => {
  it('lists every day from start to end inclusive', () => {
    expect(tripDays('2026-07-24', '2026-07-27')).toEqual([
      '2026-07-24',
      '2026-07-25',
      '2026-07-26',
      '2026-07-27',
    ])
  })

  it('returns a single day when start and end match', () => {
    expect(tripDays('2026-07-24', '2026-07-24')).toEqual(['2026-07-24'])
  })

  it('returns nothing when a date is missing or the range is inverted', () => {
    expect(tripDays(null, '2026-07-27')).toEqual([])
    expect(tripDays('2026-07-24', null)).toEqual([])
    expect(tripDays('2026-07-27', '2026-07-24')).toEqual([])
  })
})

describe('groupByDay', () => {
  const days = tripDays('2026-07-24', '2026-07-26')

  it('puts each place under its planned day and keeps empty days', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-25'), tripPlace('b', '2026-07-25')], days)
    expect(groups.map((group) => group.id)).toEqual([
      '2026-07-24',
      '2026-07-25',
      '2026-07-26',
      UNPLANNED,
    ])
    expect(groups[1].places.map((tp) => tp.place_id)).toEqual(['a', 'b'])
    expect(groups[0].places).toEqual([])
  })

  it('treats places without a date as unplanned', () => {
    const groups = groupByDay([tripPlace('a', null)], days)
    expect(groups[3].places.map((tp) => tp.place_id)).toEqual(['a'])
  })

  it('treats a date outside the trip range as unplanned', () => {
    const groups = groupByDay([tripPlace('a', '2026-09-01')], days)
    expect(groups[3].places.map((tp) => tp.place_id)).toEqual(['a'])
  })
})

describe('applyMove', () => {
  const days = tripDays('2026-07-24', '2026-07-26')

  it('moves a place into the day it was dropped on and stamps the date', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-24'), tripPlace('b', null)], days)
    const next = applyMove(groups, 'b', '2026-07-26', null)
    expect(next && flattenIds(next)).toEqual(['a', 'b'])
    expect(next?.[2].places[0].planned_date).toBe('2026-07-26')
  })

  it('inserts before the place it was dropped on', () => {
    const groups = groupByDay(
      [tripPlace('a', '2026-07-24'), tripPlace('b', '2026-07-24'), tripPlace('c', null)],
      days,
    )
    const next = applyMove(groups, 'c', '2026-07-24', 'a')
    expect(next && flattenIds(next)).toEqual(['c', 'a', 'b'])
  })

  it('clears the date when moved back to the unplanned group', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-24')], days)
    const next = applyMove(groups, 'a', UNPLANNED, null)
    expect(next?.[3].places[0].planned_date).toBeNull()
  })

  it('moves a place down within the same day', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-25'), tripPlace('b', '2026-07-25')], days)
    const next = applyMove(groups, 'a', '2026-07-25', 'b')
    expect(next && flattenIds(next)).toEqual(['b', 'a'])
  })

  it('moves a place down across several positions', () => {
    const groups = groupByDay(
      [tripPlace('a', '2026-07-25'), tripPlace('b', '2026-07-25'), tripPlace('c', '2026-07-25')],
      days,
    )
    const next = applyMove(groups, 'a', '2026-07-25', 'c')
    expect(next && flattenIds(next)).toEqual(['b', 'c', 'a'])
  })

  it('reorders within the same day', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-25'), tripPlace('b', '2026-07-25')], days)
    const next = applyMove(groups, 'b', '2026-07-25', 'a')
    expect(next && flattenIds(next)).toEqual(['b', 'a'])
  })

  it('does not mutate the groups it was given', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-24')], days)
    applyMove(groups, 'a', UNPLANNED, null)
    expect(flattenIds(groups)).toEqual(['a'])
    expect(groups[1].places).toEqual([])
  })

  it('returns null for an unknown place or target', () => {
    const groups = groupByDay([tripPlace('a', null)], days)
    expect(applyMove(groups, 'zzz', UNPLANNED, null)).toBeNull()
    expect(applyMove(groups, 'a', 'nope', null)).toBeNull()
  })
})

describe('flattenIds', () => {
  it('reads the groups in order, days first and unplanned last', () => {
    const days = tripDays('2026-07-24', '2026-07-25')
    const groups = groupByDay(
      [
        tripPlace('late', null),
        tripPlace('second', '2026-07-25'),
        tripPlace('first', '2026-07-24'),
      ],
      days,
    )
    expect(flattenIds(groups)).toEqual(['first', 'second', 'late'])
  })
})

describe('signature', () => {
  const days = tripDays('2026-07-24', '2026-07-25')

  it('is unchanged when a move puts the place back where it already was', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-24'), tripPlace('b', '2026-07-25')], days)
    const next = applyMove(groups, 'a', '2026-07-24', null)
    expect(next && signature(next)).toBe(signature(groups))
  })

  it('changes when the place lands in another day', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-24')], days)
    const next = applyMove(groups, 'a', '2026-07-25', null)
    expect(next && signature(next)).not.toBe(signature(groups))
  })

  it('distinguishes groups even when the flat order is identical', () => {
    const groups = groupByDay([tripPlace('a', '2026-07-24')], days)
    const next = applyMove(groups, 'a', '2026-07-25', null)
    expect(next && flattenIds(next)).toEqual(flattenIds(groups))
    expect(next && signature(next)).not.toBe(signature(groups))
  })
})
