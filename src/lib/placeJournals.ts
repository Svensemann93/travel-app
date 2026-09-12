export type PlaceJournalRow = {
  place_id: string | null
  journal_id: string
  journal_title: string
}

export type JournalLink = {
  id: string
  title: string
}

export function journalsByPlace(rows: PlaceJournalRow[]): Record<string, JournalLink[]> {
  const result: Record<string, JournalLink[]> = {}

  for (const row of rows) {
    if (!row.place_id) continue
    const existing = result[row.place_id] ?? []
    if (existing.some((journal) => journal.id === row.journal_id)) continue
    existing.push({ id: row.journal_id, title: row.journal_title })
    result[row.place_id] = existing
  }

  return result
}
