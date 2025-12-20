'use server'

/**
 * Extended Queue Server Actions - Covers all Queue-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getQueueItems(queueName: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('queue_items').select('*').eq('queue_name', queueName).order('priority', { ascending: false }).order('created_at', { ascending: true }).limit(limit); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function enqueue(queueName: string, payload: any, priority = 0, delayUntil?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_items').insert({ queue_name: queueName, payload, priority, status: 'pending', delay_until: delayUntil }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dequeue(queueName: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('queue_items').select('*').eq('queue_name', queueName).eq('status', 'pending').or(`delay_until.is.null,delay_until.lte.${now}`).order('priority', { ascending: false }).order('created_at', { ascending: true }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: true, data: null }; await supabase.from('queue_items').update({ status: 'processing', started_at: now }).eq('id', data.id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeQueueItem(itemId: string, result?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_items').update({ status: 'completed', result, completed_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failQueueItem(itemId: string, errorMessage: string, retry = true) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('queue_items').select('retry_count, max_retries').eq('id', itemId).single(); const retryCount = (item?.retry_count || 0) + 1; const maxRetries = item?.max_retries || 3; const status = retry && retryCount < maxRetries ? 'pending' : 'failed'; const { data, error } = await supabase.from('queue_items').update({ status, error: errorMessage, retry_count: retryCount, failed_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQueueStats(queueName: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_items').select('status').eq('queue_name', queueName); if (error) throw error; const stats: Record<string, number> = { pending: 0, processing: 0, completed: 0, failed: 0 }; data?.forEach(item => { stats[item.status] = (stats[item.status] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function clearCompletedItems(queueName: string, olderThan?: string) {
  try { const supabase = await createClient(); let query = supabase.from('queue_items').delete().eq('queue_name', queueName).eq('status', 'completed'); if (olderThan) query = query.lt('completed_at', olderThan); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function retryFailedItems(queueName: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('queue_items').update({ status: 'pending', error: null, retry_count: 0 }).eq('queue_name', queueName).eq('status', 'failed'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQueueNames() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_items').select('queue_name'); if (error) throw error; const unique = [...new Set(data?.map(q => q.queue_name) || [])]; return { success: true, data: unique } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
