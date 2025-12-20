'use server'

/**
 * Extended Status Server Actions - Covers all Status-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getStatus(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statuses').select('*').eq('entity_id', entityId).eq('entity_type', entityType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setStatus(entityId: string, entityType: string, status: string, metadata?: Record<string, any>, changedBy?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('statuses').select('id, status').eq('entity_id', entityId).eq('entity_type', entityType).single(); const previousStatus = existing?.status; const { data, error } = await supabase.from('statuses').upsert({ entity_id: entityId, entity_type: entityType, status, previous_status: previousStatus, metadata, changed_by: changedBy, changed_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type' }).select().single(); if (error) throw error; return { success: true, data, previousStatus } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStatusHistory(entityId: string, entityType: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('status_history').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('changed_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getByStatus(entityType: string, status: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statuses').select('entity_id').eq('entity_type', entityType).eq('status', status).limit(limit); if (error) throw error; return { success: true, data: data?.map(s => s.entity_id) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStatusCounts(entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statuses').select('status').eq('entity_type', entityType); if (error) throw error; const counts: Record<string, number> = {}; data?.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; }); return { success: true, data: counts } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function bulkUpdateStatus(entityIds: string[], entityType: string, status: string, changedBy?: string) {
  try { const supabase = await createClient(); const updates = entityIds.map(entityId => ({ entity_id: entityId, entity_type: entityType, status, changed_by: changedBy, changed_at: new Date().toISOString() })); const { data, error } = await supabase.from('statuses').upsert(updates, { onConflict: 'entity_id,entity_type' }).select(); if (error) throw error; return { success: true, updated: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', updated: 0 } }
}

export async function deleteStatus(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('statuses').delete().eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
