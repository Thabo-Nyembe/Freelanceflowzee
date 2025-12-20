'use server'

/**
 * Extended System Server Actions - Covers all System-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSystemSettings(category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('system_settings').select('*').order('key', { ascending: true }); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSystemSetting(key: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_settings').select('*').eq('key', key).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSystemSetting(key: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSystemSetting(key: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('system_settings').delete().eq('key', key); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSystemHealth(limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_health').select('*').order('checked_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordSystemHealth(input: { component: string; status: string; response_time_ms?: number; details?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_health').insert({ ...input, checked_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSystemComponentHealth(component: string, limit = 24) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_health').select('*').eq('component', component).order('checked_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSystemAlerts(resolvedOnly = false) {
  try { const supabase = await createClient(); let query = supabase.from('system_alerts').select('*').order('created_at', { ascending: false }); if (!resolvedOnly) query = query.eq('is_resolved', false); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSystemAlert(input: { type: string; severity: string; title: string; message: string; component?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_alerts').insert({ ...input, is_resolved: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveSystemAlert(alertId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_alerts').update({ is_resolved: true, resolved_at: new Date().toISOString(), resolution }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acknowledgeSystemAlert(alertId: string, acknowledgedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_alerts').update({ is_acknowledged: true, acknowledged_at: new Date().toISOString(), acknowledged_by: acknowledgedBy }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSystemHealthSummary() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_health').select('component, status').order('checked_at', { ascending: false }); if (error) throw error; const components = new Map(); data?.forEach(h => { if (!components.has(h.component)) components.set(h.component, h.status); }); return { success: true, data: Object.fromEntries(components) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
