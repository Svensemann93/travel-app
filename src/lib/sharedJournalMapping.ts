import { DEFAULT_CATEGORY } from './categories'
import type { JournalWithEntries } from '../types/journal'

export type SharedPhoto = { id: string; url: string; thumb_url: string | null }

export type SharedEntry = {
  id: string
  entry_date: string | null
  title: string | null
  body: string | null
  place: { name: string; latitude: number; longitude: number } | null
  place_photos: SharedPhoto[]
  entry_photos: SharedPhoto[]
}

export type SharedJournal = {
  title: string
  description: string | null
  cover_photo_path: string | null
  cover_focus_x: number | null
  cover_focus_y: number | null
  entries: SharedEntry[]
}

export function toJournalWithEntries(data: SharedJournal): JournalWithEntries {
  return {
    id: 'shared',
    user_id: '',
    trip_id: null,
    title: data.title,
    description: data.description,
    cover_photo_path: data.cover_photo_path,
    cover_focus_x: data.cover_focus_x,
    cover_focus_y: data.cover_focus_y,
    created_at: '',
    updated_at: '',
    journal_entries: data.entries.map((e, i) => ({
      id: e.id,
      journal_id: 'shared',
      place_id: e.place ? `shared-${e.id}` : null,
      entry_date: e.entry_date,
      title: e.title,
      body: e.body,
      position: i,
      place_photo_ids: null,
      created_at: '',
      photos: e.entry_photos.map((p, pi) => ({
        id: p.id,
        entry_id: e.id,
        user_id: '',
        url: p.url,
        thumb_url: p.thumb_url,
        position: pi,
        created_at: '',
      })),
      place: e.place
        ? {
            id: `shared-${e.id}`,
            user_id: '',
            name: e.place.name,
            description: null,
            latitude: e.place.latitude,
            longitude: e.place.longitude,
            category: DEFAULT_CATEGORY,
            rating: null,
            price_level: null,
            website_url: null,
            is_public: false,
            country_code: null,
            visited_on: null,
            adopted: false,
            created_at: '',
            photos: e.place_photos.map((p, pi) => ({
              id: p.id,
              place_id: `shared-${e.id}`,
              user_id: '',
              url: p.url,
              thumb_url: p.thumb_url,
              position: pi,
              is_public: false,
              created_at: '',
            })),
          }
        : null,
    })),
  }
}
