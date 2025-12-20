'use server'

/**
 * Extended Calendar Server Actions - Covers all Calendar-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCalendar(calendarId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendars').select('*').eq('id', calendarId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCalendar(calendarData: { name: string; description?: string; color?: string; timezone?: string; is_default?: boolean; is_public?: boolean; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); if (calendarData.is_default && calendarData.user_id) { await supabase.from('calendars').update({ is_default: false }).eq('user_id', calendarData.user_id); } const { data, error } = await supabase.from('calendars').insert({ ...calendarData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCalendar(calendarId: string, updates: Partial<{ name: string; description: string; color: string; timezone: string; is_default: boolean; is_public: boolean }>) {
  try { const supabase = await createClient(); if (updates.is_default) { const { data: calendar } = await supabase.from('calendars').select('user_id').eq('id', calendarId).single(); if (calendar) { await supabase.from('calendars').update({ is_default: false }).eq('user_id', calendar.user_id); } } const { data, error } = await supabase.from('calendars').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', calendarId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCalendar(calendarId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('calendars').delete().eq('id', calendarId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserCalendars(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendars').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSharedCalendars(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendar_shares').select('calendar_id, permission, calendars(*)').eq('shared_with_id', userId); if (error) throw error; return { success: true, data: data?.map(cs => ({ ...cs.calendars, permission: cs.permission })) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareCalendar(calendarId: string, sharedWithId: string, permission: 'view' | 'edit' | 'admin') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendar_shares').upsert({ calendar_id: calendarId, shared_with_id: sharedWithId, permission, shared_at: new Date().toISOString() }, { onConflict: 'calendar_id,shared_with_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unshareCalendar(calendarId: string, sharedWithId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('calendar_shares').delete().eq('calendar_id', calendarId).eq('shared_with_id', sharedWithId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCalendarEvents(calendarId: string, start: string, end: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendar_events').select('*').eq('calendar_id', calendarId).gte('start_time', start).lte('end_time', end).order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function syncExternalCalendar(calendarId: string, provider: string, externalId: string, accessToken: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('calendar_syncs').upsert({ calendar_id: calendarId, provider, external_id: externalId, access_token: accessToken, last_synced_at: new Date().toISOString() }, { onConflict: 'calendar_id,provider' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
