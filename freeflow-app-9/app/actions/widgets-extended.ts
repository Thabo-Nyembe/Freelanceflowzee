'use server'

/**
 * Extended Widgets Server Actions
 * Tables: widgets, widget_instances, widget_settings, widget_data
 */

import { createClient } from '@/lib/supabase/server'

export async function getWidget(widgetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widgets').select('*').eq('id', widgetId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWidget(widgetData: { name: string; type: string; config?: Record<string, any>; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widgets').insert({ ...widgetData, is_active: widgetData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWidget(widgetId: string, updates: Partial<{ name: string; type: string; config: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widgets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', widgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWidget(widgetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('widgets').delete().eq('id', widgetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWidgets(options?: { type?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('widgets').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWidgetInstances(options?: { widget_id?: string; dashboard_id?: string; user_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('widget_instances').select('*, widgets(*)'); if (options?.widget_id) query = query.eq('widget_id', options.widget_id); if (options?.dashboard_id) query = query.eq('dashboard_id', options.dashboard_id); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWidgetSettings(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widget_settings').select('*').eq('instance_id', instanceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWidgetData(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widget_data').select('*').eq('instance_id', instanceId).order('created_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
