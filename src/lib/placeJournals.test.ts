import { describe, expect, it } from 'vitest'
import { journalsByPlace, type PlaceJournalRow } from './placeJournals'

function row(place_id: string | null, journal_id: string, journal_title = 'Trip'): PlaceJournalRow {
  return { place_id, journal_id, journal_title }
}

describe('journalsByPlace', () => {
  it('groups journals by place', () => {
    const result = journalsByPlace([row('p1', 'j1'), row('p2', 'j2')])
    expect(result.p1.map((j) => j.id)).toEqual(['j1'])
    expect(result.p2.map((j) => j.id)).toEqual(['j2'])
  })

  it('lists a journal once even with several entries for the same place', () => {
    const result = journalsByPlace([row('p1', 'j1'), row('p1', 'j1')])
    expect(result.p1).toHaveLength(1)
  })

  it('keeps several distinct journals for one place', () => {
    const result = journalsByPlace([row('p1', 'j1'), row('p1', 'j2')])
    expect(result.p1.map((j) => j.id)).toEqual(['j1', 'j2'])
  })

  it('ignores entries without a place', () => {
    expect(journalsByPlace([row(null, 'j1')])).toEqual({})
  })
})
