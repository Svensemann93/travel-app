import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  deleteEntryRow,
  deleteJournalRow,
  fetchJournalWithEntries,
  fetchJournalsForUser,
  insertEntryPhotoRows,
  insertEntryRow,
  insertEntryRows,
  insertJournalRow,
  removeEntryPhotos,
  updateEntryRow,
  updateJournalRow,
} from '../lib/journalsApi'
import type {
  Journal,
  JournalEntryInput,
  JournalEntryPhoto,
  JournalInput,
  JournalWithEntries,
} from '../types/journal'
import type { TripWithPlaces } from '../types/trip'

export const journalsKeys = {
  all: ['journals'] as const,
  lists: () => [...journalsKeys.all, 'list'] as const,
  list: (userId: string) => [...journalsKeys.lists(), userId] as const,
  details: () => [...journalsKeys.all, 'detail'] as const,
  detail: (journalId: string) => [...journalsKeys.details(), journalId] as const,
}

export function useJournals() {
  const { user } = useAuth()
  const userId = user?.id
  return useQuery({
    queryKey: journalsKeys.list(userId ?? ''),
    queryFn: ({ signal }) => fetchJournalsForUser(signal),
    enabled: !!userId,
  })
}

export function useJournalWithEntries(journalId: string | null) {
  const { user } = useAuth()
  return useQuery({
    queryKey: journalsKeys.detail(journalId ?? ''),
    queryFn: ({ signal }) => fetchJournalWithEntries(journalId!, signal),
    enabled: !!user?.id && !!journalId,
  })
}

export function useCreateJournal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id
  return useMutation({
    mutationFn: (data: JournalInput): Promise<Journal> => {
      if (!userId) throw new Error('Not authenticated')
      return insertJournalRow(userId, data)
    },
    onSuccess: (newJournal) => {
      if (!userId) return
      queryClient.setQueryData<Journal[]>(journalsKeys.list(userId), (old = []) => [
        newJournal,
        ...old,
      ])
    },
    onError: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: journalsKeys.lists() })
    },
  })
}

export function useUpdateJournal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: JournalInput }): Promise<Journal> => {
      if (!userId) throw new Error('Not authenticated')
      return updateJournalRow(id, data)
    },
    onSuccess: (updated) => {
      if (!userId) return
      queryClient.setQueryData<Journal[]>(journalsKeys.list(userId), (old = []) =>
        old.map((j) => (j.id === updated.id ? updated : j)),
      )
      queryClient.setQueryData<JournalWithEntries | null>(journalsKeys.detail(updated.id), (old) =>
        old ? { ...old, ...updated } : old,
      )
    },
    onError: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: journalsKeys.lists() })
    },
  })
}

export function useDeleteJournal() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id
  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      if (!userId) throw new Error('Not authenticated')
      await deleteJournalRow(id)
      return id
    },
    onSuccess: (deletedId) => {
      if (!userId) return
      queryClient.setQueryData<Journal[]>(journalsKeys.list(userId), (old = []) =>
        old.filter((j) => j.id !== deletedId),
      )
      queryClient.removeQueries({ queryKey: journalsKeys.detail(deletedId) })
    },
    onError: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: journalsKeys.all })
    },
  })
}

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
      queryClient.invalidateQueries({ queryKey: journalsKeys.detail(journalId) }),
    onError: (_e, { journalId }) =>
      queryClient.invalidateQueries({ queryKey: journalsKeys.detail(journalId) }),
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
      queryClient.invalidateQueries({ queryKey: journalsKeys.detail(journalId) }),
    onError: (_e, { journalId }) =>
      queryClient.invalidateQueries({ queryKey: journalsKeys.detail(journalId) }),
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; journalId: string }) => deleteEntryRow(entryId),
    onSuccess: (_e, { journalId }) =>
      queryClient.invalidateQueries({ queryKey: journalsKeys.detail(journalId) }),
    onError: (_e, { journalId }) =>
      queryClient.invalidateQueries({ queryKey: journalsKeys.detail(journalId) }),
  })
}

export function useCreateJournalFromTrip() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id
  return useMutation({
    mutationFn: async ({
      trip,
      title,
      description,
    }: {
      trip: TripWithPlaces
      title: string
      description: string | null
    }): Promise<Journal> => {
      if (!userId) throw new Error('Not authenticated')
      const journal = await insertJournalRow(userId, { title, description, trip_id: trip.id })
      try {
        const entries = trip.trip_places.map((tp) => ({
          position: tp.position,
          data: {
            entry_date: tp.planned_date,
            title: tp.place.name,
            body: tp.notes,
            place_id: tp.place_id,
            place_photo_ids: null,
          },
        }))
        await insertEntryRows(journal.id, entries)
      } catch (err) {
        await deleteJournalRow(journal.id)
        throw err
      }
      return journal
    },
    onSuccess: (journal) => {
      if (!userId) return
      queryClient.setQueryData<Journal[]>(journalsKeys.list(userId), (old = []) => [
        journal,
        ...old,
      ])
    },
    onError: () => {
      if (userId) queryClient.invalidateQueries({ queryKey: journalsKeys.lists() })
    },
  })
}
