import type { Place } from './place'

export type Journal = {
  id: string
  user_id: string
  trip_id: string | null
  title: string
  description: string | null
  cover_photo_path?: string | null
  cover_focus_x?: number | null
  cover_focus_y?: number | null
  created_at: string
  updated_at: string
}

export type JournalEntryRow = {
  id: string
  journal_id: string
  place_id: string | null
  entry_date: string | null
  title: string | null
  body: string | null
  position: number
  place_photo_ids: string[] | null
  created_at: string
}

export type JournalEntryPhoto = {
  id: string
  entry_id: string
  user_id: string
  url: string
  thumb_url: string | null
  position: number
  created_at: string
}

export type JournalEntry = JournalEntryRow & {
  photos: JournalEntryPhoto[]
}

export type JournalEntryWithPlace = JournalEntry & {
  place: Place | null
}

export type JournalWithEntries = Journal & {
  journal_entries: JournalEntryWithPlace[]
}

export type JournalInput = {
  title: string
  description: string | null
  trip_id: string | null
}

export type JournalEntryInput = {
  entry_date: string | null
  title: string | null
  body: string | null
  place_id: string | null
  place_photo_ids: string[] | null
}

export type JournalShare = {
  id: string
  journal_id: string
  token: string
  created_at: string
  expires_at: string
  last_accessed_at: string | null
}
