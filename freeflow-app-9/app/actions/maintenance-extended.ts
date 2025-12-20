'use server'

/**
 * Extended Maintenance Server Actions - Covers all Maintenance-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMaintenanceWindows(upcomingOnly = false) {
  try { const supabase = await createClient(); let query = supabase.from('maintenance_windows').select('*').order('scheduled_start', { ascending: true }); if (upcomingOnly) query = query.gte('scheduled_start', new Date().toISOString()); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMaintenanceWindow(windowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_windows').select('*').eq('id', windowId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMaintenanceWindow(input: { title: string; description?: string; type: string; scheduled_start: string; scheduled_end: string; affected_services?: string[]; notification_message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_windows').insert({ ...input, status: 'scheduled' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMaintenanceWindow(windowId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_windows').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', windowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startMaintenanceWindow(windowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_windows').update({ status: 'in_progress', actual_start: new Date().toISOString() }).eq('id', windowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeMaintenanceWindow(windowId: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_windows').update({ status: 'completed', actual_end: new Date().toISOString(), completion_notes: notes }).eq('id', windowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelMaintenanceWindow(windowId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_windows').update({ status: 'cancelled', cancellation_reason: reason }).eq('id', windowId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMaintenanceWindow(windowId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('maintenance_windows').delete().eq('id', windowId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMaintenanceTasks(windowId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_tasks').select('*').eq('window_id', windowId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMaintenanceTask(windowId: string, input: { title: string; description?: string; order_index?: number; estimated_duration?: number; assignee_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_tasks').insert({ window_id: windowId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMaintenanceTask(taskId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startMaintenanceTask(taskId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_tasks').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeMaintenanceTask(taskId: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_tasks').update({ status: 'completed', completed_at: new Date().toISOString(), completion_notes: notes }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMaintenanceTask(taskId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('maintenance_tasks').delete().eq('id', taskId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveMaintenanceWindows() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('maintenance_windows').select('*').eq('status', 'in_progress'); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
