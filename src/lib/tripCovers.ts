import type { TripWithPlaces } from '../types/trip'

export type CoverCandidate = { id: string; path: string; thumbPath: string }

export const STANDARD_COVERS: CoverCandidate[] = [
  'cover-farm',
  'cover-beach',
  'cover-mountains',
  'cover-city',
  'cover-castle',
].map((name) => ({
  id: `standard:${name}`,
  path: `/trip-covers/${name}.png`,
  thumbPath: `/trip-covers/${name}.png`,
}))

export function collectTripPhotoCandidates(trip: TripWithPlaces): CoverCandidate[] {
  const out: CoverCandidate[] = []
  const seen = new Set<string>()
  for (const tripPlace of trip.trip_places) {
    for (const photo of tripPlace.place.photos ?? []) {
      if (photo.url && !seen.has(photo.url)) {
        seen.add(photo.url)
        out.push({ id: photo.id, path: photo.url, thumbPath: photo.thumb_url ?? photo.url })
      }
    }
  }
  return out
}
