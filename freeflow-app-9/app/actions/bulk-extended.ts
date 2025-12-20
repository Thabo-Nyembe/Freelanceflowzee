'use server'

/**
 * Extended Bulk Server Actions - Covers all Bulk operation tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBulkOperation(operationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bulk_operations').select('*').eq('id', operationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBulkOperation(opData: { operation_type: string; entity_type: string; entity_ids: string[]; action: string; action_data?: Record<string, any>; user_id: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bulk_operations').insert({ ...opData, status: 'pending', total_count: opData.entity_ids.length, success_count: 0, failure_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBulkOperationStatus(operationId: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled') {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'processing') updates.started_at = new Date().toISOString(); if (status === 'completed' || status === 'failed') updates.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('bulk_operations').update(updates).eq('id', operationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBulkOperationProgress(operationId: string, successCount: number, failureCount: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bulk_operations').update({ success_count: successCount, failure_count: failureCount, updated_at: new Date().toISOString() }).eq('id', operationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBulkOperation(operationId: string) {
  try { const supabase = await createClient(); await supabase.from('bulk_operation_logs').delete().eq('operation_id', operationId); const { error } = await supabase.from('bulk_operations').delete().eq('id', operationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBulkOperations(options?: { operationType?: string; entityType?: string; status?: string; userId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('bulk_operations').select('*'); if (options?.operationType) query = query.eq('operation_type', options.operationType); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.status) query = query.eq('status', options.status); if (options?.userId) query = query.eq('user_id', options.userId); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logBulkOperationItem(operationId: string, entityId: string, success: boolean, result?: any, errorMessage?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bulk_operation_logs').insert({ operation_id: operationId, entity_id: entityId, success, result, error_message: errorMessage, processed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBulkOperationLogs(operationId: string, successOnly?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('bulk_operation_logs').select('*').eq('operation_id', operationId); if (successOnly !== undefined) query = query.eq('success', successOnly); const { data, error } = await query.order('processed_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bulkUpdate(entityType: string, entityIds: string[], updates: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from(entityType).update({ ...updates, updated_at: new Date().toISOString() }).in('id', entityIds).select(); if (error) throw error; return { success: true, data: data || [], count: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], count: 0 } }
}

export async function bulkDelete(entityType: string, entityIds: string[]) {
  try { const supabase = await createClient(); const { error, count } = await supabase.from(entityType).delete().in('id', entityIds); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}
