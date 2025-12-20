'use server'

/**
 * Extended Reminder Server Actions - Covers all Reminder-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getReminders(userId: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('reminders').select('*').eq('user_id', userId).order('remind_at', { ascending: true }).limit(limit); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReminder(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').select('*').eq('id', reminderId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReminder(input: { user_id: string; title: string; description?: string; remind_at: string; reminder_type?: string; repeat_type?: string; repeat_interval?: number; item_id?: string; item_type?: string; channels?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').insert({ ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReminder(reminderId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', reminderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReminder(reminderId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('reminders').delete().eq('id', reminderId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markReminderSent(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', reminderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissReminder(reminderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminders').update({ status: 'dismissed', dismissed_at: new Date().toISOString() }).eq('id', reminderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function snoozeReminder(reminderId: string, snoozeMinutes: number) {
  try { const supabase = await createClient(); const newTime = new Date(); newTime.setMinutes(newTime.getMinutes() + snoozeMinutes); const { data: reminder } = await supabase.from('reminders').select('snooze_count').eq('id', reminderId).single(); const { data, error } = await supabase.from('reminders').update({ remind_at: newTime.toISOString(), status: 'pending', snooze_count: (reminder?.snooze_count || 0) + 1 }).eq('id', reminderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUpcomingReminders(userId: string, limit = 10) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'pending').gte('remind_at', now).order('remind_at', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDueReminders(userId: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); const { data, error } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('status', 'pending').lte('remind_at', now).order('remind_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReminderSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reminder_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReminderSettings(userId: string, settings: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('reminder_settings').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('reminder_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('reminder_settings').insert({ user_id: userId, ...settings }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
