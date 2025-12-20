'use server'

/**
 * Extended Index Server Actions - Covers all Index-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getIndexes(indexType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('indexes').select('*').order('created_at', { ascending: false }); if (indexType) query = query.eq('index_type', indexType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createIndex(name: string, indexType: string, config: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('indexes').insert({ name, index_type: indexType, config, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateIndexStatus(indexId: string, status: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('indexes').update({ status, metadata, updated_at: new Date().toISOString() }).eq('id', indexId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteIndex(indexId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('indexes').delete().eq('id', indexId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rebuildIndex(indexId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('indexes').update({ status: 'rebuilding', last_rebuild_at: new Date().toISOString() }).eq('id', indexId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addIndexEntry(indexId: string, itemId: string, itemType: string, content: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('index_entries').insert({ index_id: indexId, item_id: itemId, item_type: itemType, content, metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeIndexEntry(indexId: string, itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('index_entries').delete().eq('index_id', indexId).eq('item_id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIndexStats(indexId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('index_entries').select('*', { count: 'exact', head: true }).eq('index_id', indexId); if (error) throw error; return { success: true, entryCount: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', entryCount: 0 } }
}
