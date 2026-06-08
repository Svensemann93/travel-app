import { supabase } from './supabase'
import type {
  Journal,
  JournalEntry,
  JournalEntryInput,
  JournalInput,
  JournalWithEntries,
} from '../types/journal'

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
    .select('*, journal_entries(*, place:places(*, photos:place_photos(*)))')
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
): Promise<JournalEntry> {
  const { data: row, error } = await supabase
    .from('journal_entries')
    .insert({ ...data, journal_id: journalId, position })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return row
}

export async function updateEntryRow(
  entryId: string,
  data: JournalEntryInput,
): Promise<JournalEntry> {
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
