import type { JournalEntryWithPlace } from '../types/journal'

export function visiblePlacePhotos(entry: JournalEntryWithPlace) {
  const all = entry.place?.photos ?? []
  if (entry.place_photo_ids === null) return all
  const ids = new Set(entry.place_photo_ids)
  return all.filter((p) => ids.has(p.id))
}
