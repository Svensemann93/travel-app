import type { Place } from './place'

export type Journal = {
  id: string
  user_id: string
  trip_id: string | null
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export type JournalEntry = {
  id: string
  journal_id: string
  place_id: string | null
  entry_date: string | null
  title: string | null
  body: string | null
  position: number
  created_at: string
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
}
