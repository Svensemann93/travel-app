import { supabase } from './supabase'
import { uploadPhoto, deletePhotos as deletePhotoFiles } from './photoStorage'
import type {
  Journal,
  JournalEntryInput,
  JournalEntryPhoto,
  JournalEntryRow,
  JournalInput,
  JournalWithEntries,
} from '../types/journal'

function collectStoragePaths(photos: JournalEntryPhoto[]): string[] {
  return photos.flatMap((p) => (p.thumb_url ? [p.url, p.thumb_url] : [p.url]))
}

export async function fetchJournalsForUser(signal?: AbortSignal): Promise<Journal[]> {
  let query = supabase.from('journals').select('*').order('created_at', { ascending: false })
  if (signal) query = query.abortSignal(signal)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchJournalWithEntries(
  journalId: string,
  signal?: AbortSignal,
): Promise<JournalWithEntries | null> {
  let query = supabase
    .from('journals')
    .select(
      '*, journal_entries(*, photos:journal_entry_photos(*), place:places(*, photos:place_photos(*)))',
    )
    .eq('id', journalId)
    .order('position', { referencedTable: 'journal_entries', ascending: true })
  if (signal) query = query.abortSignal(signal)
  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function insertJournalRow(userId: string, data: JournalInput): Promise<Journal> {
  const { data: row, error } = await supabase
    .from('journals')
    .insert({ ...data, user_id: userId })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function updateJournalRow(id: string, data: JournalInput): Promise<Journal> {
  const { data: row, error } = await supabase
    .from('journals')
    .update(data)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function deleteJournalRow(id: string): Promise<void> {
  const { error } = await supabase.from('journals').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function insertEntryRow(
  journalId: string,
  position: number,
  data: JournalEntryInput,
): Promise<JournalEntryRow> {
  const { data: row, error } = await supabase
    .from('journal_entries')
    .insert({ ...data, journal_id: journalId, position })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function insertEntryRows(
  journalId: string,
  entries: { position: number; data: JournalEntryInput }[],
): Promise<void> {
  if (entries.length === 0) return
  const rows = entries.map(({ position, data }) => ({ ...data, journal_id: journalId, position }))
  const { error } = await supabase.from('journal_entries').insert(rows)
  if (error) throw new Error(error.message)
}

export async function updateEntryRow(
  entryId: string,
  data: JournalEntryInput,
): Promise<JournalEntryRow> {
  const { data: row, error } = await supabase
    .from('journal_entries')
    .update(data)
    .eq('id', entryId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function deleteEntryRow(entryId: string): Promise<void> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', entryId)
  if (error) throw new Error(error.message)
}

export async function insertEntryPhotoRows(
  userId: string,
  entryId: string,
  files: File[],
  startPosition: number,
): Promise<JournalEntryPhoto[]> {
  if (files.length === 0) return []
  return Promise.all(
    files.map(async (file, i) => {
      const { fullPath, thumbPath } = await uploadPhoto(userId, entryId, file)
      const { data, error } = await supabase
        .from('journal_entry_photos')
        .insert({
          entry_id: entryId,
          user_id: userId,
          url: fullPath,
          thumb_url: thumbPath,
          position: startPosition + i,
        })
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      return data
    }),
  )
}

export async function removeEntryPhotos(photos: JournalEntryPhoto[]): Promise<void> {
  if (photos.length === 0) return
  const paths = collectStoragePaths(photos)
  try {
    await deletePhotoFiles(paths)
  } catch (err) {
    console.error('Storage cleanup failed:', err)
  }
  const { error } = await supabase
    .from('journal_entry_photos')
    .delete()
    .in(
      'id',
      photos.map((p) => p.id),
    )
  if (error) throw new Error(error.message)
}
