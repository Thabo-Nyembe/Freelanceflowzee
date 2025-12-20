'use server'

/**
 * Extended Action Server Actions - Covers all Action-related tables
 * Tables: action_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getActionHistory(actionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('action_history').select('*').eq('id', actionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createActionHistory(actionData: { user_id: string; action_type: string; entity_type: string; entity_id: string; description?: string; old_value?: Record<string, any>; new_value?: Record<string, any>; metadata?: Record<string, any>; ip_address?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('action_history').insert({ ...actionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActionHistoryByUser(userId: string, options?: { actionType?: string; entityType?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('action_history').select('*', { count: 'exact' }).eq('user_id', userId); if (options?.actionType) query = query.eq('action_type', options.actionType); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.startDate) query = query.gte('created_at', options.startDate); if (options?.endDate) query = query.lte('created_at', options.endDate); const { data, count, error } = await query.order('created_at', { ascending: false }).range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1); if (error) throw error; return { success: true, data: data || [], total: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], total: 0 } }
}

export async function getActionHistoryByEntity(entityType: string, entityId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('action_history').select('*, users(id, name, email)').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecentActions(options?: { limit?: number; actionTypes?: string[] }) {
  try { const supabase = await createClient(); let query = supabase.from('action_history').select('*, users(id, name, email)'); if (options?.actionTypes?.length) query = query.in('action_type', options.actionTypes); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function searchActionHistory(searchTerm: string, options?: { userId?: string; entityType?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('action_history').select('*, users(id, name)').ilike('description', `%${searchTerm}%`); if (options?.userId) query = query.eq('user_id', options.userId); if (options?.entityType) query = query.eq('entity_type', options.entityType); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActionStats(userId?: string, options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('action_history').select('action_type, entity_type'); if (userId) query = query.eq('user_id', userId); if (options?.startDate) query = query.gte('created_at', options.startDate); if (options?.endDate) query = query.lte('created_at', options.endDate); const { data } = await query; const stats = { total: data?.length || 0, byActionType: {} as Record<string, number>, byEntityType: {} as Record<string, number> }; data?.forEach(a => { stats.byActionType[a.action_type] = (stats.byActionType[a.action_type] || 0) + 1; stats.byEntityType[a.entity_type] = (stats.byEntityType[a.entity_type] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function undoAction(actionId: string) {
  try { const supabase = await createClient(); const { data: action } = await supabase.from('action_history').select('*').eq('id', actionId).single(); if (!action) return { success: false, error: 'Action not found' }; if (!action.old_value) return { success: false, error: 'Cannot undo - no previous value stored' }; const { error } = await supabase.from(action.entity_type).update(action.old_value).eq('id', action.entity_id); if (error) throw error; await supabase.from('action_history').insert({ user_id: action.user_id, action_type: 'undo', entity_type: action.entity_type, entity_id: action.entity_id, description: `Undo: ${action.description}`, old_value: action.new_value, new_value: action.old_value, metadata: { original_action_id: actionId }, created_at: new Date().toISOString() }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupOldActionHistory(daysToKeep?: number) {
  try { const supabase = await createClient(); const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate() - (daysToKeep || 90)); const { error } = await supabase.from('action_history').delete().lt('created_at', cutoffDate.toISOString()); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
