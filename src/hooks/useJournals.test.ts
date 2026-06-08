import { renderHook, waitFor } from '@testing-library/react'
import type { Journal, JournalEntryInput, JournalWithEntries } from '../types/journal'
import {
  deleteEntryRow,
  deleteJournalRow,
  insertEntryRow,
  insertJournalRow,
  updateEntryRow,
  updateJournalRow,
} from '../lib/journalsApi'
import {
  makeJournal,
  makeJournalEntry,
  makeJournalEntryWithPlace,
  makeJournalWithEntries,
} from '../test/fixtures'
import { createTestQueryWrapper } from '../test/utils'
import {
  journalsKeys,
  useAddEntry,
  useCreateJournal,
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
  updateEntryRow: vi.fn(),
  deleteEntryRow: vi.fn(),
}))

vi.mock('./useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}))

const entryInput: JournalEntryInput = {
  entry_date: '2025-06-01',
  title: 'Day 1',
  body: 'Arrived',
  place_id: null,
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
  it('uses position 0 when no detail cache exists', async () => {
    const { wrapper } = createTestQueryWrapper()
    vi.mocked(insertEntryRow).mockResolvedValue(makeJournalEntry())

    const { result } = renderHook(() => useAddEntry(), { wrapper })
    result.current.mutate({ journalId: 'journal-1', data: entryInput })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertEntryRow).toHaveBeenCalledWith('journal-1', 0, entryInput)
  })

  it('uses position 0 when the cached journal has no entries', async () => {
    const { wrapper, queryClient } = createTestQueryWrapper()
    queryClient.setQueryData(
      journalsKeys.detail('journal-1'),
      makeJournalWithEntries({ journal_entries: [] }),
    )
    vi.mocked(insertEntryRow).mockResolvedValue(makeJournalEntry())

    const { result } = renderHook(() => useAddEntry(), { wrapper })
    result.current.mutate({ journalId: 'journal-1', data: entryInput })

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

    const { result } = renderHook(() => useAddEntry(), { wrapper })
    result.current.mutate({ journalId: 'journal-1', data: entryInput })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(insertEntryRow).toHaveBeenCalledWith('journal-1', 6, entryInput)
  })
})

describe('useUpdateEntry', () => {
  it('calls updateEntryRow with the entry id and data', async () => {
    const { wrapper } = createTestQueryWrapper()
    vi.mocked(updateEntryRow).mockResolvedValue(makeJournalEntry())

    const { result } = renderHook(() => useUpdateEntry(), { wrapper })
    result.current.mutate({ entryId: 'entry-1', journalId: 'journal-1', data: entryInput })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(updateEntryRow).toHaveBeenCalledWith('entry-1', entryInput)
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
