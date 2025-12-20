'use server'

/**
 * Extended Queues Server Actions
 * Tables: queues, queue_items, queue_workers, queue_jobs, queue_schedules, queue_logs, queue_metrics
 */

import { createClient } from '@/lib/supabase/server'

export async function getQueue(queueId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queues').select('*, queue_items(count), queue_workers(*), queue_schedules(*)').eq('id', queueId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createQueue(queueData: { name: string; type?: string; description?: string; organization_id?: string; max_workers?: number; retry_limit?: number; timeout_seconds?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queues').insert({ ...queueData, status: 'active', processed_count: 0, failed_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateQueue(queueId: string, updates: Partial<{ name: string; description: string; status: string; max_workers: number; retry_limit: number; timeout_seconds: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queues').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', queueId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteQueue(queueId: string) {
  try { const supabase = await createClient(); await supabase.from('queue_items').delete().eq('queue_id', queueId); await supabase.from('queue_workers').delete().eq('queue_id', queueId); await supabase.from('queue_jobs').delete().eq('queue_id', queueId); await supabase.from('queue_schedules').delete().eq('queue_id', queueId); await supabase.from('queue_logs').delete().eq('queue_id', queueId); const { error } = await supabase.from('queues').delete().eq('id', queueId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQueues(options?: { organization_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('queues').select('*, queue_items(count), queue_workers(count)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(queueId: string, itemData: { payload: any; priority?: number; delay_until?: string; max_attempts?: number; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_items').insert({ queue_id: queueId, ...itemData, status: 'pending', attempts: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addBulkItems(queueId: string, items: { payload: any; priority?: number; metadata?: any }[]) {
  try { const supabase = await createClient(); const itemsData = items.map(item => ({ queue_id: queueId, ...item, status: 'pending', attempts: 0, created_at: new Date().toISOString() })); const { data, error } = await supabase.from('queue_items').insert(itemsData).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getNextItem(queueId: string, workerId?: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('queue_items').select('*').eq('queue_id', queueId).eq('status', 'pending').or(`delay_until.is.null,delay_until.lte.${now}`).order('priority', { ascending: false }).order('created_at', { ascending: true }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: true, data: null }; await supabase.from('queue_items').update({ status: 'processing', worker_id: workerId, started_at: new Date().toISOString(), attempts: data.attempts + 1 }).eq('id', data.id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeItem(itemId: string, result?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_items').update({ status: 'completed', result, completed_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; await supabase.from('queues').update({ processed_count: supabase.sql`processed_count + 1` }).eq('id', data.queue_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failItem(itemId: string, error_message: string, shouldRetry?: boolean) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('queue_items').select('queue_id, attempts, max_attempts').eq('id', itemId).single(); if (!item) return { success: false, error: 'Item not found' }; const { data: queue } = await supabase.from('queues').select('retry_limit').eq('id', item.queue_id).single(); const maxAttempts = item.max_attempts || queue?.retry_limit || 3; const shouldRetryNow = shouldRetry !== false && item.attempts < maxAttempts; const { data, error } = await supabase.from('queue_items').update({ status: shouldRetryNow ? 'pending' : 'failed', error_message, failed_at: shouldRetryNow ? null : new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; if (!shouldRetryNow) { await supabase.from('queues').update({ failed_count: supabase.sql`failed_count + 1` }).eq('id', item.queue_id) } return { success: true, data, willRetry: shouldRetryNow } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getItems(queueId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('queue_items').select('*').eq('queue_id', queueId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerWorker(queueId: string, workerData: { worker_id: string; name?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_workers').insert({ queue_id: queueId, ...workerData, status: 'active', last_heartbeat: new Date().toISOString(), started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function heartbeat(workerId: string, stats?: { items_processed?: number; items_failed?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_workers').update({ last_heartbeat: new Date().toISOString(), ...stats }).eq('worker_id', workerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deregisterWorker(workerId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('queue_workers').update({ status: 'stopped', stopped_at: new Date().toISOString() }).eq('worker_id', workerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleJob(queueId: string, scheduleData: { name: string; cron_expression: string; payload: any; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_schedules').insert({ queue_id: queueId, ...scheduleData, is_active: scheduleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function purgeQueue(queueId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('queue_items').delete().eq('queue_id', queueId); if (status) query = query.eq('status', status); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function retryFailedItems(queueId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('queue_items').update({ status: 'pending', attempts: 0, error_message: null, failed_at: null }).eq('queue_id', queueId).eq('status', 'failed'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
