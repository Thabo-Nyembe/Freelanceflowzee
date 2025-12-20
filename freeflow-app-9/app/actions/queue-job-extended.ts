'use server'

/**
 * Extended Queue Job Server Actions - Covers all Queue/Job processing tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getQueueJob(jobId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_jobs').select('*').eq('id', jobId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createQueueJob(jobData: { queue_name: string; job_type: string; payload: Record<string, any>; priority?: number; max_attempts?: number; delay_until?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_jobs').insert({ ...jobData, status: 'pending', priority: jobData.priority ?? 0, attempts: 0, max_attempts: jobData.max_attempts ?? 3, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function claimQueueJob(queueName: string, workerId: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('queue_jobs').update({ status: 'processing', worker_id: workerId, started_at: now, updated_at: now }).eq('queue_name', queueName).eq('status', 'pending').or(`delay_until.is.null,delay_until.lte.${now}`).order('priority', { ascending: false }).order('created_at', { ascending: true }).limit(1).select().single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeQueueJob(jobId: string, result?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('queue_jobs').update({ status: 'completed', result, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failQueueJob(jobId: string, errorMessage: string, shouldRetry: boolean = true) {
  try { const supabase = await createClient(); const { data: job } = await supabase.from('queue_jobs').select('attempts, max_attempts').eq('id', jobId).single(); const newAttempts = (job?.attempts || 0) + 1; const canRetry = shouldRetry && newAttempts < (job?.max_attempts || 3); const { data, error } = await supabase.from('queue_jobs').update({ status: canRetry ? 'pending' : 'failed', attempts: newAttempts, last_error: errorMessage, worker_id: null, started_at: null, updated_at: new Date().toISOString() }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data, willRetry: canRetry } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteQueueJob(jobId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('queue_jobs').delete().eq('id', jobId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQueueJobs(options?: { queueName?: string; jobType?: string; status?: string; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('queue_jobs').select('*'); if (options?.queueName) query = query.eq('queue_name', options.queueName); if (options?.jobType) query = query.eq('job_type', options.jobType); if (options?.status) query = query.eq('status', options.status); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('priority', { ascending: false }).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getQueueStats(queueName?: string) {
  try { const supabase = await createClient(); let query = supabase.from('queue_jobs').select('status'); if (queueName) query = query.eq('queue_name', queueName); const { data } = await query; const stats = { pending: 0, processing: 0, completed: 0, failed: 0, total: data?.length || 0 }; data?.forEach(job => { if (job.status in stats) stats[job.status as keyof typeof stats]++; }); return { success: true, stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', stats: { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 } } }
}

export async function retryFailedJobs(queueName?: string) {
  try { const supabase = await createClient(); let query = supabase.from('queue_jobs').update({ status: 'pending', attempts: 0, last_error: null, updated_at: new Date().toISOString() }).eq('status', 'failed'); if (queueName) query = query.eq('queue_name', queueName); const { data, error } = await query.select(); if (error) throw error; return { success: true, count: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function purgeCompletedJobs(queueName?: string, olderThanDays: number = 7) {
  try { const supabase = await createClient(); const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString(); let query = supabase.from('queue_jobs').delete().eq('status', 'completed').lt('completed_at', cutoffDate); if (queueName) query = query.eq('queue_name', queueName); const { error, count } = await query; if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}
