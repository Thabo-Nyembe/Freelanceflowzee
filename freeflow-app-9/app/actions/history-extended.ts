'use server'

/**
 * Extended History Server Actions - Covers all History-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getHistory(entityId: string, entityType: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('history').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addHistoryEntry(entityId: string, entityType: string, action: string, changes: Record<string, any>, userId?: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('history').insert({ entity_id: entityId, entity_type: entityType, action, changes, user_id: userId, metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHistoryByUser(userId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHistoryByAction(entityType: string, action: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('history').select('*').eq('entity_type', entityType).eq('action', action).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHistoryBetween(entityId: string, entityType: string, since: string, until: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('history').select('*').eq('entity_id', entityId).eq('entity_type', entityType).gte('created_at', since).lte('created_at', until).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function revertToHistoryEntry(historyId: string) {
  try { const supabase = await createClient(); const { data: historyEntry, error: fetchError } = await supabase.from('history').select('*').eq('id', historyId).single(); if (fetchError) throw fetchError; if (!historyEntry.changes?.before) return { success: false, error: 'No previous state to revert to' }; const { data, error } = await supabase.from(historyEntry.entity_type).update(historyEntry.changes.before).eq('id', historyEntry.entity_id).select().single(); if (error) throw error; await addHistoryEntry(historyEntry.entity_id, historyEntry.entity_type, 'revert', { from: historyEntry.changes.after, to: historyEntry.changes.before, revertedFromHistoryId: historyId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function clearHistory(entityId: string, entityType: string, olderThan?: string) {
  try { const supabase = await createClient(); let query = supabase.from('history').delete().eq('entity_id', entityId).eq('entity_type', entityType); if (olderThan) query = query.lt('created_at', olderThan); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHistoryCount(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('history').select('*', { count: 'exact', head: true }).eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}
