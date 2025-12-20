'use server'

/**
 * Extended Statuses Server Actions
 * Tables: statuses, status_history, status_transitions, status_rules, status_notifications, status_groups
 */

import { createClient } from '@/lib/supabase/server'

export async function getStatus(statusId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statuses').select('*, status_groups(*), status_transitions(*), status_rules(*)').eq('id', statusId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStatus(statusData: { name: string; code: string; description?: string; entity_type: string; group_id?: string; color?: string; icon?: string; order_index?: number; is_default?: boolean; is_final?: boolean; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statuses').insert({ ...statusData, is_active: statusData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStatus(statusId: string, updates: Partial<{ name: string; code: string; description: string; color: string; icon: string; order_index: number; is_default: boolean; is_final: boolean; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statuses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', statusId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStatus(statusId: string) {
  try { const supabase = await createClient(); await supabase.from('status_transitions').delete().or(`from_status_id.eq.${statusId},to_status_id.eq.${statusId}`); await supabase.from('status_rules').delete().eq('status_id', statusId); const { error } = await supabase.from('statuses').delete().eq('id', statusId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStatuses(options?: { entity_type?: string; group_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('statuses').select('*, status_groups(*)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('order_index', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStatusGroup(groupData: { name: string; code: string; description?: string; entity_type: string; color?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('status_groups').insert({ ...groupData, is_active: groupData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStatusGroups(options?: { entity_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('status_groups').select('*, statuses(count)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTransition(transitionData: { from_status_id: string; to_status_id: string; name?: string; conditions?: any; requires_comment?: boolean; requires_approval?: boolean; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('status_transitions').insert({ ...transitionData, is_active: transitionData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function changeStatus(entityType: string, entityId: string, newStatusId: string, changedBy: string, options?: { comment?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: currentHistory } = await supabase.from('status_history').select('status_id').eq('entity_type', entityType).eq('entity_id', entityId).order('changed_at', { ascending: false }).limit(1).single(); const fromStatusId = currentHistory?.status_id; if (fromStatusId) { const { data: transition } = await supabase.from('status_transitions').select('*').eq('from_status_id', fromStatusId).eq('to_status_id', newStatusId).eq('is_active', true).single(); if (!transition) return { success: false, error: 'Transition not allowed' }; if (transition.requires_comment && !options?.comment) return { success: false, error: 'Comment required for this transition' } } const { data, error } = await supabase.from('status_history').insert({ entity_type: entityType, entity_id: entityId, status_id: newStatusId, from_status_id: fromStatusId, changed_by: changedBy, comment: options?.comment, metadata: options?.metadata, changed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select('*, statuses(*)').single(); if (error) throw error; await processStatusNotifications(newStatusId, entityType, entityId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function processStatusNotifications(statusId: string, entityType: string, entityId: string) {
  const supabase = await createClient()
  const { data: notifications } = await supabase.from('status_notifications').select('*').eq('status_id', statusId).eq('is_active', true)
  // Process notifications based on their type
}

export async function getStatusHistory(entityType: string, entityId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('status_history').select('*, statuses(*), from_status:from_status_id(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('changed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCurrentStatus(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('status_history').select('*, statuses(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('changed_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data?.statuses || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDefaultStatus(entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statuses').select('*').eq('entity_type', entityType).eq('is_default', true).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAvailableTransitions(fromStatusId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('status_transitions').select('*, to_status:to_status_id(*)').eq('from_status_id', fromStatusId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

