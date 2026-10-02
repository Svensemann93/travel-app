import type { Place } from '../types/place'
import type { Journal } from '../types/journal'

export type ActivityKind = 'place' | 'public_place' | 'journal' | 'photos'

export type ActivityItem = {
  id: string
  kind: ActivityKind
  title: string
  at: string
  to: string
  photoPath: string | null
  extraPhotos: number
}

function photoEventsOf(place: Place): ActivityItem[] {
  const byDay = new Map<string, typeof place.photos>()

  for (const photo of place.photos) {
    if (!photo.created_at) continue
    const day = photo.created_at.slice(0, 10)
    const bucket = byDay.get(day)
    if (bucket) bucket.push(photo)
    else byDay.set(day, [photo])
  }

  return [...byDay.entries()].map(([day, photos]) => {
    const sorted = photos
      .slice()
      .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
    return {
      id: `photos-${place.id}-${day}`,
      kind: 'photos' as const,
      title: place.name,
      at: sorted[sorted.length - 1].created_at as string,
      to: `/?focus=${place.id}`,
      photoPath: sorted[0].thumb_url ?? sorted[0].url,
      extraPhotos: sorted.length - 1,
    }
  })
}

export function buildActivity(places: Place[], journals: Journal[], limit = 6): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const place of places) {
    if (place.created_at) {
      const cover = place.photos[0]
      items.push({
        id: `place-${place.id}`,
        kind: place.is_public ? 'public_place' : 'place',
        title: place.name,
        at: place.created_at,
        to: `/?focus=${place.id}`,
        photoPath: cover ? (cover.thumb_url ?? cover.url) : null,
        extraPhotos: 0,
      })
    }
    items.push(...photoEventsOf(place))
  }

  for (const journal of journals) {
    items.push({
      id: `journal-${journal.id}`,
      kind: 'journal',
      title: journal.title,
      at: journal.created_at,
      to: `/journal/${journal.id}`,
      photoPath: journal.cover_photo_path,
      extraPhotos: 0,
    })
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit)
}
