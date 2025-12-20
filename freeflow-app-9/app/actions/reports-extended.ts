'use server'

/**
 * Extended Reports Server Actions
 * Tables: reports, report_templates, report_schedules, report_exports, report_widgets, report_permissions
 */

import { createClient } from '@/lib/supabase/server'

export async function getReport(reportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reports').select('*, report_templates(*), report_widgets(*), users(*), report_exports(*)').eq('id', reportId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReport(reportData: { name: string; description?: string; type: string; template_id?: string; user_id: string; organization_id?: string; parameters?: any; filters?: any; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reports').insert({ ...reportData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReport(reportId: string, updates: Partial<{ name: string; description: string; parameters: any; filters: any; layout: any; is_public: boolean; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reports').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', reportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReport(reportId: string) {
  try { const supabase = await createClient(); await supabase.from('report_widgets').delete().eq('report_id', reportId); await supabase.from('report_schedules').delete().eq('report_id', reportId); const { error } = await supabase.from('reports').delete().eq('id', reportId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function runReport(reportId: string, parameters?: any) {
  try { const supabase = await createClient(); const { data: report, error: reportError } = await supabase.from('reports').select('*, report_templates(*)').eq('id', reportId).single(); if (reportError) throw reportError; await supabase.from('reports').update({ last_run_at: new Date().toISOString(), run_count: (report.run_count || 0) + 1 }).eq('id', reportId); return { success: true, data: { report, parameters: parameters || report.parameters } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReports(options?: { user_id?: string; organization_id?: string; type?: string; template_id?: string; status?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reports').select('*, report_templates(*), users(*), report_widgets(count)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.type) query = query.eq('type', options.type); if (options?.template_id) query = query.eq('template_id', options.template_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReportTemplates(options?: { type?: string; category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('report_templates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReportTemplate(templateData: { name: string; description?: string; type: string; category?: string; schema: any; default_parameters?: any; layout?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_templates').insert({ ...templateData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportWidgets(reportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_widgets').select('*').eq('report_id', reportId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addReportWidget(reportId: string, widgetData: { type: string; title?: string; config: any; position?: any; size?: any; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_widgets').insert({ report_id: reportId, ...widgetData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReportWidget(widgetId: string, updates: Partial<{ title: string; config: any; position: any; size: any; order: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_widgets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', widgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleReport(reportId: string, scheduleData: { frequency: 'daily' | 'weekly' | 'monthly'; time?: string; day_of_week?: number; day_of_month?: number; recipients: string[]; format?: 'pdf' | 'excel' | 'csv' }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_schedules').insert({ report_id: reportId, ...scheduleData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportSchedules(reportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_schedules').select('*').eq('report_id', reportId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function exportReport(reportId: string, format: 'pdf' | 'excel' | 'csv', userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_exports').insert({ report_id: reportId, format, user_id: userId, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportExports(reportId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_exports').select('*, users(*)').eq('report_id', reportId).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function duplicateReport(reportId: string, userId: string) {
  try { const supabase = await createClient(); const { data: original, error: fetchError } = await supabase.from('reports').select('*, report_widgets(*)').eq('id', reportId).single(); if (fetchError) throw fetchError; const { id, created_at, updated_at, run_count, last_run_at, report_widgets, ...reportData } = original; const { data: newReport, error: createError } = await supabase.from('reports').insert({ ...reportData, name: `${reportData.name} (Copy)`, user_id: userId, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (createError) throw createError; if (report_widgets && report_widgets.length > 0) { const widgetsData = report_widgets.map((w: any) => { const { id, report_id, created_at, ...widgetData } = w; return { ...widgetData, report_id: newReport.id, created_at: new Date().toISOString() } }); await supabase.from('report_widgets').insert(widgetsData) } return { success: true, data: newReport } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
