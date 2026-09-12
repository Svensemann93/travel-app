import { describe, expect, it } from 'vitest'
import { buildTripRoutes, type TripRouteRow } from './tripRoutes'

function row(trip_id: string, position: number, latitude: number): TripRouteRow {
  return { trip_id, position, latitude, longitude: 0 }
}

describe('buildTripRoutes', () => {
  it('groups stops by trip and orders them by position', () => {
    const routes = buildTripRoutes([row('a', 2, 20), row('a', 1, 10), row('a', 3, 30)])
    expect(routes).toHaveLength(1)
    expect(routes[0].points.map((p) => p[0])).toEqual([10, 20, 30])
  })

  it('keeps trips apart', () => {
    const routes = buildTripRoutes([row('a', 1, 1), row('b', 1, 2), row('a', 2, 3), row('b', 2, 4)])
    expect(routes.map((route) => route.tripId).sort()).toEqual(['a', 'b'])
  })

  it('skips trips with a single stop', () => {
    expect(buildTripRoutes([row('a', 1, 1)])).toEqual([])
  })

  it('returns nothing for no rows', () => {
    expect(buildTripRoutes([])).toEqual([])
  })
})
