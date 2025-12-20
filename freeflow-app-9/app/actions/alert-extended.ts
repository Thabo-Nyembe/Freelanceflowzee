'use server'

/**
 * Extended Alert Server Actions - Covers all Alert-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAlerts(userId: string, alertType?: string, isRead?: boolean, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (alertType) query = query.eq('alert_type', alertType); if (isRead !== undefined) query = query.eq('is_read', isRead); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAlert(alertId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').select('*').eq('id', alertId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAlert(input: { user_id: string; title: string; message: string; alert_type: string; severity?: string; action_url?: string; action_text?: string; metadata?: any; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').insert({ ...input, is_read: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAlertRead(alertId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllAlertsRead(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('is_read', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAlert(alertId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('alerts').delete().eq('id', alertId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAllReadAlerts(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('alerts').delete().eq('user_id', userId).eq('is_read', true); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUnreadAlertCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getAlertRules(userId: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('alert_rules').select('*').eq('user_id', userId).order('name', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAlertRule(input: { user_id: string; name: string; description?: string; conditions: any; actions: any; alert_type?: string; channels?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alert_rules').insert({ ...input, is_active: true, trigger_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAlertRule(ruleId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alert_rules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAlertRule(ruleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('alert_rules').delete().eq('id', ruleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleAlertRule(ruleId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alert_rules').update({ is_active: isActive }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
