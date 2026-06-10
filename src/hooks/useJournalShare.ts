import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createJournalShare, deleteJournalShare, fetchJournalShare } from '../lib/journalShareApi'
import type { JournalShare } from '../types/journal'

export const shareKeys = {
  all: ['journal-share'] as const,
  detail: (journalId: string) => [...shareKeys.all, journalId] as const,
}

export function useJournalShare(journalId: string) {
  return useQuery({
    queryKey: shareKeys.detail(journalId),
    queryFn: ({ signal }) => fetchJournalShare(journalId, signal),
    enabled: !!journalId,
  })
}

export function useCreateJournalShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (journalId: string): Promise<JournalShare> => createJournalShare(journalId),
    onSuccess: (share) => queryClient.setQueryData(shareKeys.detail(share.journal_id), share),
  })
}

export function useDeleteJournalShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (journalId: string): Promise<string> => {
      await deleteJournalShare(journalId)
      return journalId
    },
    onSuccess: (journalId) => queryClient.setQueryData(shareKeys.detail(journalId), null),
  })
}
