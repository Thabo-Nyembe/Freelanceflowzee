'use server'

/**
 * Extended Timezone Server Actions - Covers all Timezone-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTimezone(timezoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timezones').select('*').eq('id', timezoneId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimezoneByName(name: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timezones').select('*').eq('name', name).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimezones(options?: { region?: string; isActive?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('timezones').select('*'); if (options?.region) query = query.eq('region', options.region); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); const { data, error } = await query.order('utc_offset', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTimezonesByRegion(region: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timezones').select('*').eq('region', region).eq('is_active', true).order('utc_offset', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTimezoneRegions() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timezones').select('region').eq('is_active', true); if (error) throw error; const regions = [...new Set(data?.map(t => t.region) || [])].sort(); return { success: true, data: regions } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setUserTimezone(userId: string, timezoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_timezones').upsert({ user_id: userId, timezone_id: timezoneId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserTimezone(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_timezones').select('timezone_id, timezones(*)').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data?.timezones || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function convertTime(time: string, fromTimezone: string, toTimezone: string) {
  try { const date = new Date(time); const result = { originalTime: time, fromTimezone, toTimezone, convertedTime: date.toISOString() }; return { success: true, data: result } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCurrentTimeInTimezone(timezoneName: string) {
  try { const now = new Date(); const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezoneName, dateStyle: 'full', timeStyle: 'long' }); return { success: true, data: { timezone: timezoneName, localTime: formatter.format(now), utcTime: now.toISOString() } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchTimezones(query: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('timezones').select('*').eq('is_active', true).or(`name.ilike.%${query}%,display_name.ilike.%${query}%,abbreviation.ilike.%${query}%`).order('name', { ascending: true }).limit(20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
