'use server'

/**
 * Extended Schedule Server Actions - Covers all Schedule-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedules').select('*').eq('id', scheduleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSchedule(scheduleData: { name: string; schedule_type: string; cron_expression?: string; interval_minutes?: number; start_time?: string; end_time?: string; timezone?: string; days_of_week?: number[]; entity_type?: string; entity_id?: string; action?: string; action_config?: Record<string, any>; user_id?: string }) {
  try { const supabase = await createClient(); const nextRunAt = calculateNextRun(scheduleData); const { data, error } = await supabase.from('schedules').insert({ ...scheduleData, is_active: true, run_count: 0, next_run_at: nextRunAt, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function calculateNextRun(schedule: any): string {
  const now = new Date();
  if (schedule.start_time && new Date(schedule.start_time) > now) { return schedule.start_time; }
  if (schedule.interval_minutes) { return new Date(now.getTime() + schedule.interval_minutes * 60000).toISOString(); }
  return new Date(now.getTime() + 3600000).toISOString();
}

export async function updateSchedule(scheduleId: string, updates: Partial<{ name: string; cron_expression: string; interval_minutes: number; start_time: string; end_time: string; timezone: string; days_of_week: number[]; action: string; action_config: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('schedules').delete().eq('id', scheduleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function activateSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedules').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateSchedule(scheduleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedules').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordScheduleRun(scheduleId: string, result: { status: 'success' | 'failure'; duration_ms?: number; error_message?: string; output?: Record<string, any> }) {
  try { const supabase = await createClient(); await supabase.from('schedule_runs').insert({ schedule_id: scheduleId, ...result, executed_at: new Date().toISOString() }); const { data: schedule } = await supabase.from('schedules').select('*').eq('id', scheduleId).single(); if (schedule) { const nextRunAt = calculateNextRun(schedule); await supabase.from('schedules').update({ run_count: schedule.run_count + 1, last_run_at: new Date().toISOString(), last_status: result.status, next_run_at: nextRunAt }).eq('id', scheduleId); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSchedules(options?: { userId?: string; entityType?: string; entityId?: string; isActive?: boolean; scheduleType?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('schedules').select('*'); if (options?.userId) query = query.eq('user_id', options.userId); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.entityId) query = query.eq('entity_id', options.entityId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.scheduleType) query = query.eq('schedule_type', options.scheduleType); const { data, error } = await query.order('next_run_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDueSchedules() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedules').select('*').eq('is_active', true).lte('next_run_at', new Date().toISOString()).order('next_run_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getScheduleRuns(scheduleId: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('schedule_runs').select('*').eq('schedule_id', scheduleId).order('executed_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
