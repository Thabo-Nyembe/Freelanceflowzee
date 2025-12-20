'use server'

/**
 * Extended Scheduled Server Actions
 * Tables: scheduled_tasks, scheduled_jobs, scheduled_reports, scheduled_notifications
 */

import { createClient } from '@/lib/supabase/server'

export async function getScheduledTask(taskId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduled_tasks').select('*').eq('id', taskId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createScheduledTask(taskData: { name: string; cron_expression?: string; handler: string; payload?: Record<string, any>; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduled_tasks').insert({ ...taskData, is_active: taskData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateScheduledTask(taskId: string, updates: Partial<{ name: string; cron_expression: string; handler: string; payload: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduled_tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteScheduledTask(taskId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('scheduled_tasks').delete().eq('id', taskId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScheduledTasks(options?: { is_active?: boolean; handler?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('scheduled_tasks').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.handler) query = query.eq('handler', options.handler); const { data, error } = await query.order('next_run_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getScheduledJobs(options?: { task_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('scheduled_jobs').select('*'); if (options?.task_id) query = query.eq('task_id', options.task_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('scheduled_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getScheduledReports(options?: { user_id?: string; report_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('scheduled_reports').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.report_type) query = query.eq('report_type', options.report_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('next_run_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getScheduledNotifications(options?: { user_id?: string; is_sent?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('scheduled_notifications').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_sent !== undefined) query = query.eq('is_sent', options.is_sent); const { data, error } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
