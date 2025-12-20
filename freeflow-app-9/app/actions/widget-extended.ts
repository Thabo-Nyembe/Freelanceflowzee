'use server'

/**
 * Extended Widget Server Actions - Covers all Widget-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getWidgets(userId?: string, widgetType?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('widgets').select('*').order('sort_order', { ascending: true }); if (userId) query = query.eq('user_id', userId); if (widgetType) query = query.eq('widget_type', widgetType); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWidget(widgetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widgets').select('*').eq('id', widgetId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWidget(input: { user_id: string; name: string; widget_type: string; title?: string; description?: string; config?: any; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widgets').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWidget(widgetId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widgets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', widgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleWidgetActive(widgetId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widgets').update({ is_active: isActive }).eq('id', widgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWidget(widgetId: string) {
  try { const supabase = await createClient(); await supabase.from('widget_configs').delete().eq('widget_id', widgetId); await supabase.from('dashboard_widgets').delete().eq('widget_id', widgetId); const { error } = await supabase.from('widgets').delete().eq('id', widgetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderWidgets(widgetIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < widgetIds.length; i++) { await supabase.from('widgets').update({ sort_order: i }).eq('id', widgetIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWidgetConfig(widgetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('widget_configs').select('*').eq('widget_id', widgetId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setWidgetConfig(widgetId: string, config: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('widget_configs').select('id').eq('widget_id', widgetId).single(); if (existing) { const { data, error } = await supabase.from('widget_configs').update({ config, updated_at: new Date().toISOString() }).eq('widget_id', widgetId).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('widget_configs').insert({ widget_id: widgetId, config }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardWidgets(dashboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_widgets').select('*, widgets(*)').eq('dashboard_id', dashboardId).order('position', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addWidgetToDashboard(dashboardId: string, widgetId: string, position?: number, size?: { width: number; height: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_widgets').insert({ dashboard_id: dashboardId, widget_id: widgetId, position: position || 0, width: size?.width || 1, height: size?.height || 1 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeWidgetFromDashboard(dashboardId: string, widgetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('dashboard_widgets').delete().eq('dashboard_id', dashboardId).eq('widget_id', widgetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboardWidgetPosition(dashboardId: string, widgetId: string, position: number, size?: { width: number; height: number }) {
  try { const supabase = await createClient(); const updates: any = { position }; if (size) { updates.width = size.width; updates.height = size.height; } const { data, error } = await supabase.from('dashboard_widgets').update(updates).eq('dashboard_id', dashboardId).eq('widget_id', widgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
