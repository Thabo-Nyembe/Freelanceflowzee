'use server'

/**
 * Extended Alerts Server Actions
 * Tables: alerts, alert_rules, alert_notifications
 */

import { createClient } from '@/lib/supabase/server'

export async function getAlert(alertId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').select('*').eq('id', alertId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAlert(alertData: { user_id: string; title: string; message: string; type: string; severity?: 'low' | 'medium' | 'high' | 'critical'; source?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').insert({ ...alertData, severity: alertData.severity || 'medium', status: 'active', is_read: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAlert(alertId: string, updates: Partial<{ title: string; message: string; severity: string; status: string; is_read: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAlert(alertId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('alerts').delete().eq('id', alertId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAlerts(options?: { user_id?: string; type?: string; severity?: string; status?: string; is_read?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('alerts').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.severity) query = query.eq('severity', options.severity); if (options?.status) query = query.eq('status', options.status); if (options?.is_read !== undefined) query = query.eq('is_read', options.is_read); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markAlertAsRead(alertId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllAlertsAsRead(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('is_read', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissAlert(alertId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').update({ status: 'dismissed', dismissed_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acknowledgeAlert(alertId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveAlert(alertId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUnreadAlertCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false).eq('status', 'active'); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getCriticalAlerts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('alerts').select('*').eq('user_id', userId).in('severity', ['high', 'critical']).eq('status', 'active').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
