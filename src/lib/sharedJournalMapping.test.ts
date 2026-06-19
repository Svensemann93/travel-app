import { DEFAULT_CATEGORY } from './categories'
import { toJournalWithEntries, type SharedEntry, type SharedJournal } from './sharedJournalMapping'

function makeSharedEntry(overrides: Partial<SharedEntry> = {}): SharedEntry {
  return {
    id: 'entry-1',
    entry_date: null,
    title: null,
    body: null,
    place: null,
    place_photos: [],
    entry_photos: [],
    ...overrides,
  }
}

function makeSharedJournal(overrides: Partial<SharedJournal> = {}): SharedJournal {
  return {
    title: 'Trip',
    description: null,
    cover_photo_path: null,
    cover_focus_x: null,
    cover_focus_y: null,
    entries: [],
    ...overrides,
  }
}

describe('toJournalWithEntries', () => {
  it('passes cover fields through unchanged', () => {
    const result = toJournalWithEntries(
      makeSharedJournal({
        cover_photo_path: 'cover/path.jpg',
        cover_focus_x: 0.25,
        cover_focus_y: 0.75,
      }),
    )
    expect(result.cover_photo_path).toBe('cover/path.jpg')
    expect(result.cover_focus_x).toBe(0.25)
    expect(result.cover_focus_y).toBe(0.75)
  })

  it('assigns sequential positions to entries by array order', () => {
    const result = toJournalWithEntries(
      makeSharedJournal({
        entries: [makeSharedEntry({ id: 'x' }), makeSharedEntry({ id: 'y' })],
      }),
    )
    expect(result.journal_entries.map((e) => e.position)).toEqual([0, 1])
  })

  it('maps entry photos with sequential positions', () => {
    const result = toJournalWithEntries(
      makeSharedJournal({
        entries: [
          makeSharedEntry({
            id: 'e',
            entry_photos: [
              { id: 'p1', url: 'u1', thumb_url: null },
              { id: 'p2', url: 'u2', thumb_url: 't2' },
            ],
          }),
        ],
      }),
    )
    const photos = result.journal_entries[0].photos
    expect(photos.map((p) => p.id)).toEqual(['p1', 'p2'])
    expect(photos.map((p) => p.position)).toEqual([0, 1])
  })

  it('builds a synthetic place with a stable shared id and default category', () => {
    const result = toJournalWithEntries(
      makeSharedJournal({
        entries: [
          makeSharedEntry({
            id: 'e',
            place: { name: 'Eiffel Tower', latitude: 48.85, longitude: 2.29 },
            place_photos: [{ id: 'pp1', url: 'u', thumb_url: null }],
          }),
        ],
      }),
    )
    const entry = result.journal_entries[0]
    expect(entry.place_id).toBe('shared-e')
    expect(entry.place?.id).toBe('shared-e')
    expect(entry.place?.category).toBe(DEFAULT_CATEGORY)
    expect(entry.place?.photos[0].place_id).toBe('shared-e')
  })

  it('sets place and place_id to null when the entry has no place', () => {
    const result = toJournalWithEntries(
      makeSharedJournal({ entries: [makeSharedEntry({ id: 'e', place: null })] }),
    )
    expect(result.journal_entries[0].place).toBeNull()
    expect(result.journal_entries[0].place_id).toBeNull()
  })

  it('leaves place_photo_ids null so all place photos stay visible', () => {
    const result = toJournalWithEntries(
      makeSharedJournal({ entries: [makeSharedEntry({ id: 'e' })] }),
    )
    expect(result.journal_entries[0].place_photo_ids).toBeNull()
  })
})
