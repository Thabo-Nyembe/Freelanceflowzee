'use server'

/**
 * Extended Calendars Server Actions
 * Tables: calendars, calendar_events, calendar_sharing, calendar_sync
 */

import { createClient } from '@/lib/supabase/server'

export async function getCalendar(calendarId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendars').select('*').eq('id', calendarId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCalendar(calendarData: { user_id: string; name: string; description?: string; color?: string; timezone?: string; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendars').insert({ ...calendarData, is_visible: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCalendar(calendarId: string, updates: Partial<{ name: string; description: string; color: string; timezone: string; is_visible: boolean; is_default: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendars').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', calendarId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCalendar(calendarId: string) {
  try { const supabase = await createClient(); await supabase.from('calendar_events').delete().eq('calendar_id', calendarId); await supabase.from('calendar_sharing').delete().eq('calendar_id', calendarId); const { error } = await supabase.from('calendars').delete().eq('id', calendarId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCalendars(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendars').select('*').eq('user_id', userId).order('is_default', { ascending: false }).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCalendarEvents(calendarId: string, options?: { start_date?: string; end_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('calendar_events').select('*').eq('calendar_id', calendarId); if (options?.start_date) query = query.gte('start_time', options.start_date); if (options?.end_date) query = query.lte('end_time', options.end_date); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCalendarEvent(eventData: { calendar_id: string; title: string; start_time: string; end_time: string; description?: string; location?: string; is_all_day?: boolean; recurrence?: string; reminder_minutes?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendar_events').insert({ ...eventData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function shareCalendar(calendarId: string, shareWithId: string, permission?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendar_sharing').insert({ calendar_id: calendarId, shared_with_id: shareWithId, permission: permission || 'view', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSharedCalendars(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendar_sharing').select('*, calendars(*)').eq('shared_with_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
