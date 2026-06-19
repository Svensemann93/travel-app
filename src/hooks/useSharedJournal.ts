import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toJournalWithEntries, type SharedJournal } from '../lib/sharedJournalMapping'
import type { JournalWithEntries } from '../types/journal'

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
