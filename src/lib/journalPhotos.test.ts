import { makeJournalEntryWithPlace, makePlace, makePlacePhoto } from '../test/fixtures'
import { visiblePlacePhotos } from './journalPhotos'

describe('visiblePlacePhotos', () => {
  const photoA = makePlacePhoto({ id: 'a' })
  const photoB = makePlacePhoto({ id: 'b' })
  const photoC = makePlacePhoto({ id: 'c' })
  const place = makePlace({ photos: [photoA, photoB, photoC] })

  it('returns all place photos when place_photo_ids is null', () => {
    const entry = makeJournalEntryWithPlace({ place, place_photo_ids: null })
    expect(visiblePlacePhotos(entry)).toEqual([photoA, photoB, photoC])
  })

  it('returns no photos when place_photo_ids is an empty array', () => {
    const entry = makeJournalEntryWithPlace({ place, place_photo_ids: [] })
    expect(visiblePlacePhotos(entry)).toEqual([])
  })

  it('returns only the curated subset when place_photo_ids lists ids', () => {
    const entry = makeJournalEntryWithPlace({ place, place_photo_ids: ['a', 'c'] })
    expect(visiblePlacePhotos(entry)).toEqual([photoA, photoC])
  })

  it('preserves the place photo order, not the id order', () => {
    const entry = makeJournalEntryWithPlace({ place, place_photo_ids: ['c', 'a'] })
    expect(visiblePlacePhotos(entry)).toEqual([photoA, photoC])
  })

  it('ignores ids that match no place photo', () => {
    const entry = makeJournalEntryWithPlace({ place, place_photo_ids: ['a', 'missing'] })
    expect(visiblePlacePhotos(entry)).toEqual([photoA])
  })

  it('returns an empty array when the entry has no place', () => {
    const entry = makeJournalEntryWithPlace({ place: null, place_photo_ids: null })
    expect(visiblePlacePhotos(entry)).toEqual([])
  })
})
