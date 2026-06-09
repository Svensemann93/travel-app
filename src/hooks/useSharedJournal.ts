import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DEFAULT_CATEGORY } from '../lib/categories'
import type { JournalWithEntries } from '../types/journal'

type SharedPhoto = { id: string; url: string; thumb_url: string | null }

type SharedEntry = {
  id: string
  entry_date: string | null
  title: string | null
  body: string | null
  place: { name: string; latitude: number; longitude: number } | null
  place_photos: SharedPhoto[]
  entry_photos: SharedPhoto[]
}

type SharedJournal = {
  title: string
  description: string | null
  entries: SharedEntry[]
}

function toJournalWithEntries(data: SharedJournal): JournalWithEntries {
  return {
    id: 'shared',
    user_id: '',
    trip_id: null,
    title: data.title,
    description: data.description,
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
            created_at: '',
            photos: e.place_photos.map((p, pi) => ({
              id: p.id,
              place_id: `shared-${e.id}`,
              user_id: '',
              url: p.url,
              thumb_url: p.thumb_url,
              position: pi,
              created_at: '',
            })),
          }
        : null,
    })),
  }
}

export function useSharedJournal(token: string) {
  return useQuery({
    queryKey: ['shared-journal', token],
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<JournalWithEntries | null> => {
      const { data, error } = await supabase.functions.invoke('share-journal', {
        body: { token },
      })
      if (error) throw error
      if (!data?.journal) return null
      return toJournalWithEntries(data.journal as SharedJournal)
    },
  })
}
