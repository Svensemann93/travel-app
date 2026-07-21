import { describe, expect, it } from 'vitest'
import { completedLast, hideCompletedTrips, searchTrips, sortTripsByStatus } from './tripsList'
import { makeTrip } from '../test/fixtures'
import type { TripListItem } from '../types/trip'

const today = new Date('2026-07-20T12:00:00.000Z')

function trip(overrides: Partial<TripListItem>): TripListItem {
  return { ...makeTrip(), place_count: 0, first_stop: null, ...overrides }
}

const completed = trip({
  id: 'c',
  name: 'Alpen',
  start_date: '2026-06-01',
  end_date: '2026-06-10',
})
const planning = trip({
  id: 'p',
  name: 'Ägäis',
  start_date: null,
  end_date: null,
})
const upcoming = trip({
  id: 'u',
  name: 'Umbrien',
  start_date: '2026-08-01',
  end_date: '2026-08-10',
})
const ongoing = trip({
  id: 'o',
  name: 'Oslo',
  start_date: '2026-07-15',
  end_date: '2026-07-25',
})
const all = [completed, planning, upcoming, ongoing]

describe('searchTrips', () => {
  it('matches part of a name, case-insensitive', () => {
    expect(searchTrips(all, 'osl').map((t) => t.id)).toEqual(['o'])
  })

  it('ignores accents so a plain keyboard finds Ägäis', () => {
    expect(searchTrips(all, 'agais').map((t) => t.id)).toEqual(['p'])
  })

  it('returns everything for a blank query', () => {
    expect(searchTrips(all, '   ')).toHaveLength(4)
  })

  it('returns nothing when nothing matches', () => {
    expect(searchTrips(all, 'zzz')).toEqual([])
  })
})

describe('hideCompletedTrips', () => {
  it('drops completed trips when hiding', () => {
    expect(
      hideCompletedTrips(all, true, today)
        .map((t) => t.id)
        .sort(),
    ).toEqual(['o', 'p', 'u'])
  })

  it('keeps everything when not hiding', () => {
    expect(hideCompletedTrips(all, false, today)).toHaveLength(4)
  })
})

describe('sortTripsByStatus', () => {
  it('ascending goes completed, planning, upcoming, ongoing', () => {
    expect(sortTripsByStatus(all, 'asc', today).map((t) => t.id)).toEqual(['c', 'p', 'u', 'o'])
  })

  it('descending is the strict reverse', () => {
    expect(sortTripsByStatus(all, 'desc', today).map((t) => t.id)).toEqual(['o', 'u', 'p', 'c'])
  })

  it('does not mutate the input', () => {
    const input = [...all]
    sortTripsByStatus(input, 'asc', today)
    expect(input.map((t) => t.id)).toEqual(['c', 'p', 'u', 'o'])
  })
})

describe('completedLast', () => {
  it('moves completed trips to the end, keeping incoming order otherwise', () => {
    expect(completedLast([completed, planning, ongoing], today).map((t) => t.id)).toEqual([
      'p',
      'o',
      'c',
    ])
  })

  it('preserves order among the completed ones too', () => {
    const c2 = trip({
      id: 'c2',
      name: 'Berge',
      start_date: '2025-01-01',
      end_date: '2025-01-05',
    })
    expect(completedLast([completed, c2, ongoing], today).map((t) => t.id)).toEqual([
      'o',
      'c',
      'c2',
    ])
  })

  it('does not mutate the input', () => {
    const input = [completed, ongoing]
    completedLast(input, today)
    expect(input.map((t) => t.id)).toEqual(['c', 'o'])
  })
})
