import { renderHook, waitFor } from '@testing-library/react'
import type { Journal, JournalEntryInput, JournalWithEntries } from '../types/journal'
import {
  deleteEntryRow,
  deleteJournalRow,
  insertEntryPhotoRows,
  insertEntryRow,
  insertEntryRows,
  insertJournalRow,
  removeEntryPhotos,
  updateEntryRow,
  updateJournalRow,
} from '../lib/journalsApi'
import {
  makeJournal,
  makeJournalEntry,
  makeJournalEntryPhoto,
  makeJournalEntryWithPlace,
  makeJournalWithEntries,
  makePlace,
  makeTripPlaceWithPlace,
  makeTripWithPlaces,
} from '../test/fixtures'
import { createTestQueryWrapper } from '../test/utils'
import {
  journalsKeys,
  useAddEntry,
  useCreateJournal,
  useCreateJournalFromTrip,
  useDeleteEntry,
  useDeleteJournal,
  useUpdateEntry,
  useUpdateJournal,
} from './useJournals'

vi.mock('../lib/journalsApi', () => ({
  fetchJournalsForUser: vi.fn(),
  fetchJournalWithEntries: vi.fn(),
  insertJournalRow: vi.fn(),
  updateJournalRow: vi.fn(),
  deleteJournalRow: vi.fn(),
  insertEntryRow: vi.fn(),
  insertEntryRows: vi.fn(),
  updateEntryRow: vi.fn(),
  deleteEntryRow: vi.fn(),
  insertEntryPhotoRows: vi.fn(),
  removeEntryPhotos: vi.fn(),
}))

vi.mock('./useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}))

const entryInput: JournalEntryInput = {
  entry_date: '2025-06-01',
  title: 'Day 1',
  body: 'Arrived',
  place_id: null,
  place_photo_ids: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCreateJournal', () => {
  it('prepends the new journal to the cached list', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()
    queryClient.setQueryData(journalsKeys.list('test-user-id'), [makeJournal({ id: 'journal-1' })])
    vi.mocked(insertJournalRow).mockResolvedValue(makeJournal({ id: 'journal-2' }))

    const { result } = renderHook(() => useCreateJournal(), { wrapper })
    result.current.mutate({ title: 'New', description: null, trip_id: null })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const list = queryClient.getQueryData<Journal[]>(journalsKeys.list('test-user-id'))
    expect(list?.map((j) => j.id)).toEqual(['journal-2', 'journal-1'])
  })
})

describe('useUpdateJournal', () => {
  it('replaces the journal in the list and patches the detail cache', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()
    queryClient.setQueryData(journalsKeys.list('test-user-id'), [
      makeJournal({ id: 'journal-1', title: 'Old title' }),
    ])
    queryClient.setQueryData(
      journalsKeys.detail('journal-1'),
      makeJournalWithEntries({
        id: 'journal-1',
        title: 'Old title',
        journal_entries: [makeJournalEntryWithPlace({ id: 'entry-1' })],
      }),
    )
    vi.mocked(updateJournalRow).mockResolvedValue(
      makeJournal({ id: 'journal-1', title: 'New title' }),
    )

    const { result } = renderHook(() => useUpdateJournal(), { wrapper })
    result.current.mutate({
      id: 'journal-1',
      data: { title: 'New title', description: null, trip_id: null },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const list = queryClient.getQueryData<Journal[]>(journalsKeys.list('test-user-id'))
    expect(list?.[0].title).toBe('New title')

    const detail = queryClient.getQueryData<JournalWithEntries>(journalsKeys.detail('journal-1'))
    expect(detail?.title).toBe('New title')
    expect(detail?.journal_entries).toHaveLength(1)
  })
})

describe('useDeleteJournal', () => {
  it('removes the journal from the list and drops its detail query', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()
    queryClient.setQueryData(journalsKeys.list('test-user-id'), [
      makeJournal({ id: 'journal-1' }),
      makeJournal({ id: 'journal-2' }),
    ])
    queryClient.setQueryData(journalsKeys.detail('journal-1'), makeJournalWithEntries())
    vi.mocked(deleteJournalRow).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteJournal(), { wrapper })
    result.current.mutate('journal-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const list = queryClient.getQueryData<Journal[]>(journalsKeys.list('test-user-id'))
    expect(list?.map((j) => j.id)).toEqual(['journal-2'])
    expect(queryClient.getQueryData(journalsKeys.detail('journal-1'))).toBeUndefined()
  })
})

describe('useAddEntry', () => {
  it('uses position 0 when no detail cache exists and uploads photos', async () => {
    const { wrapper } = createTestQueryWrapper()
    vi.mocked(insertEntryRow).mockResolvedValue(makeJournalEntry())
    vi.mocked(insertEntryPhotoRows).mockResolvedValue([])

    const { result } = renderHook(() => useAddEntry(), { wrapper })
    result.current.mutate({ journalId: 'journal-1', data: entryInput, photos: [] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertEntryRow).toHaveBeenCalledWith('journal-1', 0, entryInput)
    expect(insertEntryPhotoRows).toHaveBeenCalledWith('test-user-id', 'entry-1', [], 0)
  })

  it('uses position 0 when the cached journal has no entries', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()
    queryClient.setQueryData(
      journalsKeys.detail('journal-1'),
      makeJournalWithEntries({ journal_entries: [] }),
    )
    vi.mocked(insertEntryRow).mockResolvedValue(makeJournalEntry())
    vi.mocked(insertEntryPhotoRows).mockResolvedValue([])

    const { result } = renderHook(() => useAddEntry(), { wrapper })
    result.current.mutate({ journalId: 'journal-1', data: entryInput, photos: [] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertEntryRow).toHaveBeenCalledWith('journal-1', 0, entryInput)
  })

  it('uses max(position) + 1 when the cached journal has entries', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()
    queryClient.setQueryData(
      journalsKeys.detail('journal-1'),
      makeJournalWithEntries({
        journal_entries: [
          makeJournalEntryWithPlace({ id: 'a', position: 0 }),
          makeJournalEntryWithPlace({ id: 'b', position: 5 }),
          makeJournalEntryWithPlace({ id: 'c', position: 2 }),
        ],
      }),
    )
    vi.mocked(insertEntryRow).mockResolvedValue(makeJournalEntry({ position: 6 }))
    vi.mocked(insertEntryPhotoRows).mockResolvedValue([])

    const { result } = renderHook(() => useAddEntry(), { wrapper })
    result.current.mutate({ journalId: 'journal-1', data: entryInput, photos: [] })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertEntryRow).toHaveBeenCalledWith('journal-1', 6, entryInput)
  })
})

describe('useUpdateEntry', () => {
  it('updates the entry row with id and data', async () => {
    const { wrapper } = createTestQueryWrapper()
    vi.mocked(updateEntryRow).mockResolvedValue(makeJournalEntry())
    vi.mocked(removeEntryPhotos).mockResolvedValue(undefined)
    vi.mocked(insertEntryPhotoRows).mockResolvedValue([])

    const { result } = renderHook(() => useUpdateEntry(), { wrapper })
    result.current.mutate({
      entryId: 'entry-1',
      journalId: 'journal-1',
      data: entryInput,
      photos: [],
      photosToDelete: [],
      photoStartPosition: 0,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(updateEntryRow).toHaveBeenCalledWith('entry-1', entryInput)
  })

  it('removes flagged photos and uploads new ones', async () => {
    const { wrapper } = createTestQueryWrapper()
    vi.mocked(updateEntryRow).mockResolvedValue(makeJournalEntry())
    vi.mocked(removeEntryPhotos).mockResolvedValue(undefined)
    vi.mocked(insertEntryPhotoRows).mockResolvedValue([])

    const toDelete = [makeJournalEntryPhoto({ id: 'p1' })]
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })

    const { result } = renderHook(() => useUpdateEntry(), { wrapper })
    result.current.mutate({
      entryId: 'entry-1',
      journalId: 'journal-1',
      data: entryInput,
      photos: [file],
      photosToDelete: toDelete,
      photoStartPosition: 1,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(removeEntryPhotos).toHaveBeenCalledWith(toDelete)
    expect(insertEntryPhotoRows).toHaveBeenCalledWith('test-user-id', 'entry-1', [file], 1)
  })
})

describe('useDeleteEntry', () => {
  it('calls deleteEntryRow with the entry id', async () => {
    const { wrapper } = createTestQueryWrapper()
    vi.mocked(deleteEntryRow).mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteEntry(), { wrapper })
    result.current.mutate({ entryId: 'entry-1', journalId: 'journal-1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(deleteEntryRow).toHaveBeenCalledWith('entry-1')
  })
})

describe('useCreateJournalFromTrip', () => {
  const trip = makeTripWithPlaces({
    id: 'trip-1',
    name: 'Trip X',
    trip_places: [
      makeTripPlaceWithPlace({
        place_id: 'a',
        position: 0,
        planned_date: '2025-06-01',
        notes: 'Note A',
        place: makePlace({ id: 'a', name: 'Place A' }),
      }),
      makeTripPlaceWithPlace({
        place_id: 'b',
        position: 1,
        planned_date: null,
        notes: null,
        place: makePlace({ id: 'b', name: 'Place B' }),
      }),
    ],
  })

  it('creates a journal with trip_id and maps trip places to ordered entries', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()
    queryClient.setQueryData(journalsKeys.list('test-user-id'), [makeJournal({ id: 'journal-0' })])
    vi.mocked(insertJournalRow).mockResolvedValue(
      makeJournal({ id: 'journal-1', trip_id: 'trip-1' }),
    )
    vi.mocked(insertEntryRows).mockResolvedValue(undefined)

    const { result } = renderHook(() => useCreateJournalFromTrip(), { wrapper })
    result.current.mutate({ trip, title: 'My Journal', description: 'My desc' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertJournalRow).toHaveBeenCalledWith('test-user-id', {
      title: 'My Journal',
      description: 'My desc',
      trip_id: 'trip-1',
    })
    expect(insertEntryRows).toHaveBeenCalledWith('journal-1', [
      {
        position: 0,
        data: {
          entry_date: '2025-06-01',
          title: 'Place A',
          body: 'Note A',
          place_id: 'a',
          place_photo_ids: null,
        },
      },
      {
        position: 1,
        data: {
          entry_date: null,
          title: 'Place B',
          body: null,
          place_id: 'b',
          place_photo_ids: null,
        },
      },
    ])

    const list = queryClient.getQueryData<Journal[]>(journalsKeys.list('test-user-id'))
    expect(list?.map((j) => j.id)).toEqual(['journal-1', 'journal-0'])
  })

  it('rolls back the created journal when entry insert fails', async () => {
    const { wrapper } = createTestQueryWrapper()
    vi.mocked(insertJournalRow).mockResolvedValue(makeJournal({ id: 'journal-1' }))
    vi.mocked(insertEntryRows).mockRejectedValue(new Error('insert failed'))
    vi.mocked(deleteJournalRow).mockResolvedValue(undefined)

    const { result } = renderHook(() => useCreateJournalFromTrip(), { wrapper })
    result.current.mutate({ trip, title: 'My Journal', description: null })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(deleteJournalRow).toHaveBeenCalledWith('journal-1')
  })
})
