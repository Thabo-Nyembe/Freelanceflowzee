'use server'

/**
 * Extended Dashboards Server Actions
 * Tables: dashboards, dashboard_widgets, dashboard_layouts, dashboard_shares, dashboard_filters
 */

import { createClient } from '@/lib/supabase/server'

export async function getDashboard(dashboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboards').select('*, dashboard_widgets(*), dashboard_filters(*)').eq('id', dashboardId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDashboard(dashboardData: { user_id: string; name: string; description?: string; type?: string; layout?: any; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboards').insert({ ...dashboardData, is_public: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboard(dashboardId: string, updates: Partial<{ name: string; description: string; type: string; layout: any; is_default: boolean; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', dashboardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDashboard(dashboardId: string) {
  try { const supabase = await createClient(); await supabase.from('dashboard_widgets').delete().eq('dashboard_id', dashboardId); await supabase.from('dashboard_filters').delete().eq('dashboard_id', dashboardId); await supabase.from('dashboard_shares').delete().eq('dashboard_id', dashboardId); const { error } = await supabase.from('dashboards').delete().eq('id', dashboardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserDashboards(userId: string, options?: { type?: string; is_default?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('dashboards').select('*').eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDashboardWidget(widgetData: { dashboard_id: string; widget_type: string; title?: string; config?: any; position?: any; size?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_widgets').insert({ ...widgetData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDashboardWidget(widgetId: string, updates: Partial<{ title: string; config: any; position: any; size: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_widgets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', widgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeDashboardWidget(widgetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('dashboard_widgets').delete().eq('id', widgetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardWidgets(dashboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_widgets').select('*').eq('dashboard_id', dashboardId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareDashboard(dashboardId: string, userId: string, permission?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_shares').insert({ dashboard_id: dashboardId, user_id: userId, permission: permission || 'view', shared_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSharedDashboards(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_shares').select('*, dashboards(*)').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveDashboardFilter(filterData: { dashboard_id: string; name: string; filter_config: any; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('dashboard_filters').insert({ ...filterData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
