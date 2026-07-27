import type { Place } from './place'
import type { Database } from './database'

type Tables = Database['public']['Tables']

export type Journal = Tables['journals']['Row']

export type JournalEntryRow = Tables['journal_entries']['Row']

export type JournalEntryPhoto = Tables['journal_entry_photos']['Row']

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

export type JournalShare = Tables['journal_shares']['Row']
