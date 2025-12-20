'use server'

/**
 * Extended Habits Server Actions
 * Tables: habits, habit_logs, habit_streaks, habit_reminders, habit_categories, habit_templates
 */

import { createClient } from '@/lib/supabase/server'

export async function getHabit(habitId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('habits').select('*, habit_logs(*), habit_streaks(*), habit_reminders(*)').eq('id', habitId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createHabit(habitData: { user_id: string; name: string; description?: string; category_id?: string; frequency: string; target_count?: number; color?: string; icon?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('habits').insert({ ...habitData, current_streak: 0, longest_streak: 0, total_completions: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('habit_streaks').insert({ habit_id: data.id, user_id: habitData.user_id, current_streak: 0, longest_streak: 0, updated_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateHabit(habitId: string, updates: Partial<{ name: string; description: string; frequency: string; target_count: number; color: string; icon: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('habits').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', habitId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteHabit(habitId: string) {
  try { const supabase = await createClient(); await supabase.from('habit_logs').delete().eq('habit_id', habitId); await supabase.from('habit_streaks').delete().eq('habit_id', habitId); await supabase.from('habit_reminders').delete().eq('habit_id', habitId); const { error } = await supabase.from('habits').delete().eq('id', habitId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHabits(options?: { user_id?: string; category_id?: string; frequency?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('habits').select('*, habit_categories(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.frequency) query = query.eq('frequency', options.frequency); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logHabitCompletion(logData: { habit_id: string; user_id: string; completed_at?: string; count?: number; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('habit_logs').insert({ ...logData, count: logData.count || 1, completed_at: logData.completed_at || new Date().toISOString() }).select().single(); if (error) throw error; const { data: habit } = await supabase.from('habits').select('total_completions, current_streak, longest_streak').eq('id', logData.habit_id).single(); const newStreak = (habit?.current_streak || 0) + 1; await supabase.from('habits').update({ total_completions: (habit?.total_completions || 0) + (logData.count || 1), current_streak: newStreak, longest_streak: Math.max(newStreak, habit?.longest_streak || 0), updated_at: new Date().toISOString() }).eq('id', logData.habit_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHabitLogs(habitId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('habit_logs').select('*').eq('habit_id', habitId); if (options?.from_date) query = query.gte('completed_at', options.from_date); if (options?.to_date) query = query.lte('completed_at', options.to_date); const { data, error } = await query.order('completed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHabitStreak(habitId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('habit_streaks').select('*').eq('habit_id', habitId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addHabitReminder(reminderData: { habit_id: string; reminder_time: string; days_of_week: string[]; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('habit_reminders').insert({ ...reminderData, is_active: reminderData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHabitReminders(habitId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('habit_reminders').select('*').eq('habit_id', habitId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHabitCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('habit_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHabitTemplates(options?: { category_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('habit_templates').select('*'); if (options?.category_id) query = query.eq('category_id', options.category_id); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTodaysHabits(userId: string) {
  try { const supabase = await createClient(); const today = new Date().toISOString().split('T')[0]; const { data: habits } = await supabase.from('habits').select('*').eq('user_id', userId).eq('is_active', true); const { data: logs } = await supabase.from('habit_logs').select('habit_id').eq('user_id', userId).gte('completed_at', `${today}T00:00:00`).lte('completed_at', `${today}T23:59:59`); const completedIds = new Set(logs?.map(l => l.habit_id)); const habitsWithStatus = habits?.map(h => ({ ...h, completedToday: completedIds.has(h.id) })); return { success: true, data: habitsWithStatus || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
