import { describe, expect, it } from 'vitest'
import { buildActivity } from './profileActivity'
import type { Place } from '../types/place'
import type { Journal } from '../types/journal'

function place(id: string, created_at: string, photos: { at: string }[] = [], isPublic = false) {
  return {
    id,
    name: `Place ${id}`,
    created_at,
    is_public: isPublic,
    photos: photos.map((photo, index) => ({
      id: `${id}-${index}`,
      url: `url-${index}`,
      thumb_url: null,
      created_at: photo.at,
    })),
    visits: [],
  } as unknown as Place
}

function journal(id: string, created_at: string): Journal {
  return { id, title: `Journal ${id}`, created_at, cover_photo_path: null } as unknown as Journal
}

describe('buildActivity', () => {
  it('sorts the newest event first', () => {
    const items = buildActivity(
      [place('a', '2026-01-01T10:00:00Z')],
      [journal('j', '2026-02-01T10:00:00Z')],
    )
    expect(items[0].id).toBe('journal-j')
    expect(items[1].id).toBe('place-a')
  })

  it('marks public places with their own kind', () => {
    const items = buildActivity([place('a', '2026-01-01T10:00:00Z', [], true)], [])
    expect(items[0].kind).toBe('public_place')
  })

  it('groups photos of the same day into one event', () => {
    const items = buildActivity(
      [
        place('a', '2026-01-01T10:00:00Z', [
          { at: '2026-03-02T08:00:00Z' },
          { at: '2026-03-02T09:00:00Z' },
        ]),
      ],
      [],
    )
    const photoEvents = items.filter((item) => item.kind === 'photos')
    expect(photoEvents).toHaveLength(1)
    expect(photoEvents[0].extraPhotos).toBe(1)
  })

  it('keeps photo events of different days apart', () => {
    const items = buildActivity(
      [
        place('a', '2026-01-01T10:00:00Z', [
          { at: '2026-03-02T08:00:00Z' },
          { at: '2026-03-05T09:00:00Z' },
        ]),
      ],
      [],
    )
    expect(items.filter((item) => item.kind === 'photos')).toHaveLength(2)
  })

  it('caps the list at the given limit', () => {
    const places = Array.from({ length: 10 }, (_, i) =>
      place(`p${i}`, `2026-01-0${(i % 9) + 1}T10:00:00Z`),
    )
    expect(buildActivity(places, [], 4)).toHaveLength(4)
  })

  it('ignores places without a creation date', () => {
    const items = buildActivity(
      [place('a', '2026-01-01T10:00:00Z'), { ...place('b', ''), created_at: null } as Place],
      [],
    )
    expect(items.map((item) => item.id)).toEqual(['place-a'])
  })
})
