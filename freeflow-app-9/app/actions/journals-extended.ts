'use server'

/**
 * Extended Journals Server Actions
 * Tables: journals, journal_entries, journal_prompts, journal_moods, journal_tags, journal_templates
 */

import { createClient } from '@/lib/supabase/server'

export async function getJournal(journalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('journals').select('*, journal_entries(*)').eq('id', journalId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createJournal(journalData: { user_id: string; title: string; description?: string; type?: string; is_private?: boolean; cover_color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('journals').insert({ ...journalData, entry_count: 0, is_private: journalData.is_private ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateJournal(journalId: string, updates: Partial<{ title: string; description: string; is_private: boolean; cover_color: string; is_archived: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('journals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', journalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteJournal(journalId: string) {
  try { const supabase = await createClient(); await supabase.from('journal_entries').delete().eq('journal_id', journalId); const { error } = await supabase.from('journals').delete().eq('id', journalId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getJournals(userId: string, options?: { type?: string; is_archived?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('journals').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.is_archived !== undefined) query = query.eq('is_archived', options.is_archived); const { data, error } = await query.order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createJournalEntry(entryData: { journal_id: string; user_id: string; title?: string; content: string; mood_id?: string; prompt_id?: string; is_favorite?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('journal_entries').insert({ ...entryData, word_count: entryData.content.split(/\s+/).length, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: journal } = await supabase.from('journals').select('entry_count').eq('id', entryData.journal_id).single(); await supabase.from('journals').update({ entry_count: (journal?.entry_count || 0) + 1, updated_at: new Date().toISOString() }).eq('id', entryData.journal_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateJournalEntry(entryId: string, updates: Partial<{ title: string; content: string; mood_id: string; is_favorite: boolean }>) {
  try { const supabase = await createClient(); const updateData: any = { ...updates, updated_at: new Date().toISOString() }; if (updates.content) updateData.word_count = updates.content.split(/\s+/).length; const { data, error } = await supabase.from('journal_entries').update(updateData).eq('id', entryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteJournalEntry(entryId: string, journalId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('journal_entries').delete().eq('id', entryId); if (error) throw error; const { data: journal } = await supabase.from('journals').select('entry_count').eq('id', journalId).single(); await supabase.from('journals').update({ entry_count: Math.max(0, (journal?.entry_count || 1) - 1) }).eq('id', journalId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getJournalEntries(journalId: string, options?: { from_date?: string; to_date?: string; mood_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('journal_entries').select('*, journal_moods(*), journal_tags(*)').eq('journal_id', journalId); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); if (options?.mood_id) query = query.eq('mood_id', options.mood_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getJournalMoods() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('journal_moods').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getJournalPrompts(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('journal_prompts').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRandomPrompt(category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('journal_prompts').select('*').eq('is_active', true); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; if (!data?.length) return { success: true, data: null }; const randomIndex = Math.floor(Math.random() * data.length); return { success: true, data: data[randomIndex] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addEntryTag(entryId: string, tagName: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('journal_tags').insert({ entry_id: entryId, tag: tagName, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchEntries(userId: string, query: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('journal_entries').select('*, journals(*)').eq('user_id', userId).or(`title.ilike.%${query}%,content.ilike.%${query}%`).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFavoriteEntries(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('journal_entries').select('*, journals(*)').eq('user_id', userId).eq('is_favorite', true).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
