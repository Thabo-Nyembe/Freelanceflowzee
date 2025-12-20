'use server'

/**
 * Extended Insights Server Actions
 * Tables: insights, insight_reports, insight_dashboards, insight_widgets, insight_alerts, insight_schedules
 */

import { createClient } from '@/lib/supabase/server'

export async function getInsight(insightId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insights').select('*').eq('id', insightId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInsight(insightData: { title: string; description?: string; type: string; source: string; query?: any; visualization?: any; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insights').insert({ ...insightData, view_count: 0, is_public: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInsight(insightId: string, updates: Partial<{ title: string; description: string; query: any; visualization: any; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insights').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', insightId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInsights(options?: { type?: string; source?: string; created_by?: string; is_public?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('insights').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.source) query = query.eq('source', options.source); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInsightReport(reportData: { name: string; description?: string; insights: string[]; layout?: any; created_by: string; schedule_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_reports').insert({ ...reportData, generation_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInsightReports(options?: { created_by?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('insight_reports').select('*'); if (options?.created_by) query = query.eq('created_by', options.created_by); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInsightDashboard(dashboardData: { name: string; description?: string; layout: any; widgets?: any[]; created_by: string; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_dashboards').insert({ ...dashboardData, is_public: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInsightDashboard(dashboardId: string, updates: Partial<{ name: string; description: string; layout: any; widgets: any[]; is_public: boolean; is_default: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_dashboards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', dashboardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInsightDashboards(options?: { created_by?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('insight_dashboards').select('*'); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('is_default', { ascending: false }).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDashboardWidget(widgetData: { dashboard_id: string; insight_id?: string; type: string; title: string; config: any; position: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_widgets').insert({ ...widgetData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDashboardWidgets(dashboardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_widgets').select('*, insights(*)').eq('dashboard_id', dashboardId).order('position', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInsightAlert(alertData: { insight_id: string; name: string; condition: any; threshold?: number; recipients: string[]; channel: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_alerts').insert({ ...alertData, is_active: true, trigger_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInsightAlerts(options?: { insight_id?: string; created_by?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('insight_alerts').select('*'); if (options?.insight_id) query = query.eq('insight_id', options.insight_id); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function scheduleInsight(scheduleData: { insight_id?: string; report_id?: string; frequency: string; next_run: string; recipients?: string[]; format?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_schedules').insert({ ...scheduleData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInsightSchedules(options?: { created_by?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('insight_schedules').select('*, insights(*), insight_reports(*)'); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('next_run', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
