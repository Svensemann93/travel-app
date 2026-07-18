import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { journalsKeys } from './journalsKeys'
import {
  deleteJournalRow,
  fetchJournalsForUser,
  fetchJournalWithEntries,
  insertEntryRows,
  insertJournalRow,
  updateJournalCover,
  updateJournalRow,
} from '../lib/journalsApi'
import type { Journal, JournalInput, JournalWithEntries } from '../types/journal'
import type { TripWithPlaces } from '../types/trip'

export { journalsKeys } from './journalsKeys'

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
      if (userId) {
        queryClient.invalidateQueries({ queryKey: journalsKeys.lists() })
      }
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
      if (userId) {
        queryClient.invalidateQueries({ queryKey: journalsKeys.lists() })
      }
    },
  })
}

export function useSetJournalCover() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id
  return useMutation({
    mutationFn: ({
      id,
      coverPhotoPath,
      focusX,
      focusY,
    }: {
      id: string
      coverPhotoPath: string | null
      focusX: number
      focusY: number
    }): Promise<Journal> => {
      if (!userId) throw new Error('Not authenticated')
      return updateJournalCover(id, coverPhotoPath, focusX, focusY)
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
      if (userId) {
        queryClient.invalidateQueries({ queryKey: journalsKeys.lists() })
      }
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
      const journal = await insertJournalRow(userId, {
        title,
        description,
        trip_id: trip.id,
      })
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
      if (userId) {
        queryClient.invalidateQueries({ queryKey: journalsKeys.lists() })
      }
    },
  })
}
