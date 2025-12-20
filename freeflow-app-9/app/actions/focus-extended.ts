'use server'

/**
 * Extended Focus Server Actions
 * Tables: focus_sessions, focus_goals, focus_blocks, focus_timers, focus_streaks, focus_stats
 */

import { createClient } from '@/lib/supabase/server'

export async function getFocusSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('focus_sessions').select('*, focus_blocks(*)').eq('id', sessionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFocusSession(sessionData: { user_id: string; title?: string; duration_minutes: number; focus_type?: string; goal_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('focus_sessions').insert({ ...sessionData, status: 'active', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endFocusSession(sessionId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('focus_sessions').update({ status, notes, ended_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFocusSessions(userId: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('focus_sessions').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('started_at', options.from_date); if (options?.to_date) query = query.lte('started_at', options.to_date); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFocusGoal(goalData: { user_id: string; title: string; description?: string; target_minutes: number; target_sessions?: number; deadline?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('focus_goals').insert({ ...goalData, progress_minutes: 0, completed_sessions: 0, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFocusGoal(goalId: string, updates: Partial<{ title: string; target_minutes: number; progress_minutes: number; completed_sessions: number; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('focus_goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFocusGoals(userId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('focus_goals').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFocusBlock(blockData: { user_id: string; name: string; start_time: string; end_time: string; days_of_week: string[]; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('focus_blocks').insert({ ...blockData, is_active: blockData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFocusBlocks(userId: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('focus_blocks').select('*').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFocusStreak(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('focus_streaks').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFocusStreak(userId: string, incrementStreak: boolean) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('focus_streaks').select('*').eq('user_id', userId).single(); if (existing) { const newStreak = incrementStreak ? existing.current_streak + 1 : 0; const { data, error } = await supabase.from('focus_streaks').update({ current_streak: newStreak, longest_streak: Math.max(newStreak, existing.longest_streak), last_session_date: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('focus_streaks').insert({ user_id: userId, current_streak: 1, longest_streak: 1, last_session_date: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFocusStats(userId: string, period?: string) {
  try { const supabase = await createClient(); let query = supabase.from('focus_stats').select('*').eq('user_id', userId); if (period) query = query.eq('period', period); const { data, error } = await query.order('date', { ascending: false }).limit(30); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTodaysFocusStats(userId: string) {
  try { const supabase = await createClient(); const today = new Date().toISOString().split('T')[0]; const { data, error } = await supabase.from('focus_sessions').select('*').eq('user_id', userId).gte('started_at', `${today}T00:00:00`).lte('started_at', `${today}T23:59:59`); if (error) throw error; const totalMinutes = data?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0; const completedSessions = data?.filter(s => s.status === 'completed').length || 0; return { success: true, data: { sessions: data || [], totalMinutes, completedSessions } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
