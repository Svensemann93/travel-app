export type TripRouteRow = {
  trip_id: string
  position: number
  latitude: number
  longitude: number
}

export type TripRoute = {
  tripId: string
  points: [number, number][]
}

export function buildTripRoutes(rows: TripRouteRow[]): TripRoute[] {
  const byTrip = new Map<string, TripRouteRow[]>()

  for (const row of rows) {
    const existing = byTrip.get(row.trip_id)
    if (existing) existing.push(row)
    else byTrip.set(row.trip_id, [row])
  }

  const routes: TripRoute[] = []

  for (const [tripId, tripRows] of byTrip) {
    const points = tripRows
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((row) => [row.latitude, row.longitude] as [number, number])

    if (points.length > 1) routes.push({ tripId, points })
  }

  return routes
}
