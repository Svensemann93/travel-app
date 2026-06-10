import { supabase } from './supabase'
import type { JournalShare } from '../types/journal'

export async function fetchJournalShare(
  journalId: string,
  signal?: AbortSignal,
): Promise<JournalShare | null> {
  let query = supabase.from('journal_shares').select('*').eq('journal_id', journalId)
  if (signal) query = query.abortSignal(signal)
  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function createJournalShare(journalId: string): Promise<JournalShare> {
  const { data, error } = await supabase.rpc('create_journal_share', { p_journal_id: journalId })
  if (error) throw new Error(error.message)
  return data as JournalShare
}

export async function deleteJournalShare(journalId: string): Promise<void> {
  const { error } = await supabase.from('journal_shares').delete().eq('journal_id', journalId)
  if (error) throw new Error(error.message)
}
