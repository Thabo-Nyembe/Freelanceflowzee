'use server'

/**
 * Extended Batch Server Actions - Covers all Batch operation tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBatch(batchId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('batches').select('*').eq('id', batchId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBatch(batchData: { name: string; batch_type: string; operation: string; items: any[]; settings?: Record<string, any>; scheduled_at?: string; user_id: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('batches').insert({ ...batchData, status: 'pending', total_items: batchData.items.length, processed_items: 0, failed_items: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBatchStatus(batchId: string, status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled', errorMessage?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'processing') updates.started_at = new Date().toISOString(); if (status === 'completed' || status === 'failed') updates.completed_at = new Date().toISOString(); if (errorMessage) updates.error_message = errorMessage; const { data, error } = await supabase.from('batches').update(updates).eq('id', batchId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBatchProgress(batchId: string, processedItems: number, failedItems: number = 0) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('batches').update({ processed_items: processedItems, failed_items: failedItems, updated_at: new Date().toISOString() }).eq('id', batchId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBatch(batchId: string) {
  try { const supabase = await createClient(); await supabase.from('batch_items').delete().eq('batch_id', batchId); const { error } = await supabase.from('batches').delete().eq('id', batchId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBatches(options?: { batchType?: string; status?: string; userId?: string; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('batches').select('*'); if (options?.batchType) query = query.eq('batch_type', options.batchType); if (options?.status) query = query.eq('status', options.status); if (options?.userId) query = query.eq('user_id', options.userId); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBatchItem(batchId: string, item: { item_data: any; item_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('batch_items').insert({ batch_id: batchId, ...item, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBatchItem(itemId: string, status: 'pending' | 'processing' | 'completed' | 'failed', result?: any, errorMessage?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('batch_items').update({ status, result, error_message: errorMessage, processed_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBatchItems(batchId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('batch_items').select('*').eq('batch_id', batchId); if (status) query = query.eq('status', status); const { data, error } = await query.order('item_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function retryFailedBatchItems(batchId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('batch_items').update({ status: 'pending', error_message: null, processed_at: null }).eq('batch_id', batchId).eq('status', 'failed').select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
