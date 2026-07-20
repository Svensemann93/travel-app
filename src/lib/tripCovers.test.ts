import { describe, expect, it } from 'vitest'
import { STANDARD_COVERS, collectTripPhotoCandidates } from './tripCovers'
import {
  makeTripWithPlaces,
  makeTripPlaceWithPlace,
  makePlace,
  makePlacePhoto,
} from '../test/fixtures'

describe('STANDARD_COVERS', () => {
  it('offers the five bundled illustrations as public asset paths', () => {
    expect(STANDARD_COVERS).toHaveLength(5)
    for (const cover of STANDARD_COVERS) {
      expect(cover.path).toMatch(/^\/trip-covers\/cover-[a-z]+\.png$/)
      expect(cover.path.startsWith('/')).toBe(true)
    }
  })
})

describe('collectTripPhotoCandidates', () => {
  it('gathers photos from every place in the trip', () => {
    const trip = makeTripWithPlaces({
      trip_places: [
        makeTripPlaceWithPlace({
          place: makePlace({ id: 'p1', photos: [makePlacePhoto({ id: 'ph1', url: 'a.jpg' })] }),
        }),
        makeTripPlaceWithPlace({
          place: makePlace({ id: 'p2', photos: [makePlacePhoto({ id: 'ph2', url: 'b.jpg' })] }),
        }),
      ],
    })
    expect(collectTripPhotoCandidates(trip).map((c) => c.path)).toEqual(['a.jpg', 'b.jpg'])
  })

  it('deduplicates a photo shared across places', () => {
    const trip = makeTripWithPlaces({
      trip_places: [
        makeTripPlaceWithPlace({
          place: makePlace({ id: 'p1', photos: [makePlacePhoto({ id: 'ph1', url: 'same.jpg' })] }),
        }),
        makeTripPlaceWithPlace({
          place: makePlace({ id: 'p2', photos: [makePlacePhoto({ id: 'ph2', url: 'same.jpg' })] }),
        }),
      ],
    })
    expect(collectTripPhotoCandidates(trip)).toHaveLength(1)
  })

  it('falls back to the full url when there is no thumbnail', () => {
    const trip = makeTripWithPlaces({
      trip_places: [
        makeTripPlaceWithPlace({
          place: makePlace({
            id: 'p1',
            photos: [makePlacePhoto({ id: 'ph1', url: 'x.jpg', thumb_url: null })],
          }),
        }),
      ],
    })
    expect(collectTripPhotoCandidates(trip)[0].thumbPath).toBe('x.jpg')
  })

  it('returns nothing for a trip whose places have no photos', () => {
    const trip = makeTripWithPlaces({
      trip_places: [makeTripPlaceWithPlace({ place: makePlace({ photos: [] }) })],
    })
    expect(collectTripPhotoCandidates(trip)).toEqual([])
  })
})
