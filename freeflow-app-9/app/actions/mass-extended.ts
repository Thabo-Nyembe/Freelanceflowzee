'use server'

/**
 * Extended Mass Server Actions - Covers all Mass action/notification tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMassAction(actionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mass_actions').select('*').eq('id', actionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMassAction(actionData: { name: string; action_type: string; target_type: string; target_criteria?: Record<string, any>; action_config: Record<string, any>; scheduled_at?: string; user_id: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mass_actions').insert({ ...actionData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMassAction(actionId: string, updates: Partial<{ name: string; target_criteria: Record<string, any>; action_config: Record<string, any>; scheduled_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mass_actions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', actionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function executeMassAction(actionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mass_actions').update({ status: 'executing', started_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', actionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeMassAction(actionId: string, results: { total_targets: number; successful: number; failed: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mass_actions').update({ status: 'completed', ...results, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', actionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelMassAction(actionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mass_actions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', actionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMassAction(actionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('mass_actions').delete().eq('id', actionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMassActions(options?: { actionType?: string; targetType?: string; status?: string; userId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('mass_actions').select('*'); if (options?.actionType) query = query.eq('action_type', options.actionType); if (options?.targetType) query = query.eq('target_type', options.targetType); if (options?.status) query = query.eq('status', options.status); if (options?.userId) query = query.eq('user_id', options.userId); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendMassNotification(notificationData: { title: string; message: string; notification_type: string; target_users: string[] | 'all'; channels?: string[]; scheduled_at?: string; user_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mass_notifications').insert({ ...notificationData, status: 'pending', sent_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMassNotifications(options?: { notificationType?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('mass_notifications').select('*'); if (options?.notificationType) query = query.eq('notification_type', options.notificationType); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
