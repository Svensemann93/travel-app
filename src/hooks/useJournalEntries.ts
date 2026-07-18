import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { journalsKeys } from './journalsKeys'
import {
  deleteEntryRow,
  insertEntryPhotoRows,
  insertEntryRow,
  removeEntryPhotos,
  updateEntryRow,
} from '../lib/journalsApi'
import type { JournalEntryInput, JournalEntryPhoto, JournalWithEntries } from '../types/journal'

export function useAddEntry() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id
  return useMutation({
    mutationFn: async ({
      journalId,
      data,
      photos,
    }: {
      journalId: string
      data: JournalEntryInput
      photos: File[]
    }) => {
      if (!userId) throw new Error('Not authenticated')
      const cached = queryClient.getQueryData<JournalWithEntries | null>(
        journalsKeys.detail(journalId),
      )
      const position =
        cached && cached.journal_entries.length > 0
          ? Math.max(...cached.journal_entries.map((e) => e.position)) + 1
          : 0
      const entry = await insertEntryRow(journalId, position, data)
      await insertEntryPhotoRows(userId, entry.id, photos, 0)
      return entry
    },
    onSuccess: (_e, { journalId }) =>
      queryClient.invalidateQueries({
        queryKey: journalsKeys.detail(journalId),
      }),
    onError: (_e, { journalId }) =>
      queryClient.invalidateQueries({
        queryKey: journalsKeys.detail(journalId),
      }),
  })
}

export function useUpdateEntry() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id
  return useMutation({
    mutationFn: async ({
      entryId,
      data,
      photos,
      photosToDelete,
      photoStartPosition,
    }: {
      entryId: string
      journalId: string
      data: JournalEntryInput
      photos: File[]
      photosToDelete: JournalEntryPhoto[]
      photoStartPosition: number
    }) => {
      if (!userId) throw new Error('Not authenticated')
      await updateEntryRow(entryId, data)
      await removeEntryPhotos(photosToDelete)
      await insertEntryPhotoRows(userId, entryId, photos, photoStartPosition)
    },
    onSuccess: (_e, { journalId }) =>
      queryClient.invalidateQueries({
        queryKey: journalsKeys.detail(journalId),
      }),
    onError: (_e, { journalId }) =>
      queryClient.invalidateQueries({
        queryKey: journalsKeys.detail(journalId),
      }),
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; journalId: string }) => deleteEntryRow(entryId),
    onSuccess: (_e, { journalId }) =>
      queryClient.invalidateQueries({
        queryKey: journalsKeys.detail(journalId),
      }),
    onError: (_e, { journalId }) =>
      queryClient.invalidateQueries({
        queryKey: journalsKeys.detail(journalId),
      }),
  })
}
