'use server'

/**
 * Extended Timer Server Actions
 * Tables: timers, timer_entries, timer_settings, timer_reports
 */

import { createClient } from '@/lib/supabase/server'

export async function getTimer(timerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timers').select('*').eq('id', timerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startTimer(timerData: { user_id: string; project_id?: string; task_id?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timers').insert({ ...timerData, status: 'running', started_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopTimer(timerId: string) {
  try { const supabase = await createClient(); const timer = await supabase.from('timers').select('started_at').eq('id', timerId).single(); if (timer.error) throw timer.error; const startedAt = new Date(timer.data.started_at); const stoppedAt = new Date(); const duration = Math.floor((stoppedAt.getTime() - startedAt.getTime()) / 1000); const { data, error } = await supabase.from('timers').update({ status: 'stopped', stopped_at: stoppedAt.toISOString(), duration }).eq('id', timerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function pauseTimer(timerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timers').update({ status: 'paused', paused_at: new Date().toISOString() }).eq('id', timerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resumeTimer(timerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timers').update({ status: 'running', resumed_at: new Date().toISOString() }).eq('id', timerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimers(options?: { user_id?: string; project_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('timers').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActiveTimer(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timers').select('*').eq('user_id', userId).eq('status', 'running').order('started_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimerEntries(options?: { user_id?: string; project_id?: string; date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('timer_entries').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.date) query = query.gte('created_at', options.date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTimerSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timer_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
