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

describe('completedLast', () => {
  const soon = trip({ id: 'u3', name: 'Wien', start_date: '2026-07-25', end_date: '2026-07-27' })
  const later = trip({
    id: 'u2',
    name: 'Lofoten',
    start_date: '2026-09-01',
    end_date: '2026-09-10',
  })
  const older = trip({ id: 'c2', name: 'Rügen', start_date: '2026-01-05', end_date: '2026-01-12' })

  it('puts the next upcoming trip first', () => {
    expect(completedLast([later, upcoming, soon], today).map((t) => t.id)).toEqual([
      'u3',
      'u',
      'u2',
    ])
  })

  it('puts an ongoing trip before a later upcoming one', () => {
    expect(completedLast([upcoming, ongoing], today).map((t) => t.id)).toEqual(['o', 'u'])
  })

  it('orders completed trips by most recently ended', () => {
    expect(completedLast([older, completed], today).map((t) => t.id)).toEqual(['c', 'c2'])
  })

  it('sorts undated trips to the end of the active group by name', () => {
    const other = trip({ id: 'p2', name: 'Bali', start_date: null, end_date: null })
    expect(completedLast([other, planning, soon], today).map((t) => t.id)).toEqual([
      'u3',
      'p',
      'p2',
    ])
  })

  it('moves completed trips to the end and dated trips ahead of undated ones', () => {
    expect(completedLast([completed, planning, ongoing], today).map((t) => t.id)).toEqual([
      'o',
      'p',
      'c',
    ])
  })

  it('does not mutate the input', () => {
    const input = [later, soon]
    completedLast(input, today)
    expect(input.map((t) => t.id)).toEqual(['u2', 'u3'])
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
