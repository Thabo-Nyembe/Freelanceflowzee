'use server'

/**
 * Extended Report Server Actions - Covers all 7 Report-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getReportExports(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_exports').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReportExport(userId: string, reportId: string, format: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_exports').insert({ user_id: userId, report_id: reportId, format, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReportExportStatus(exportId: string, status: string, fileUrl?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_exports').update({ status, file_url: fileUrl, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', exportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportFilters(reportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_filters').select('*').eq('report_id', reportId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveReportFilter(reportId: string, name: string, filterData: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_filters').insert({ report_id: reportId, name, filter_data: filterData }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReportFilter(filterId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('report_filters').delete().eq('id', filterId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportSchedules(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_schedules').select('*').eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReportSchedule(userId: string, reportId: string, input: { frequency: string; recipients: string[]; format?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_schedules').insert({ user_id: userId, report_id: reportId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleReportSchedule(scheduleId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_schedules').update({ is_active: isActive }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportShares(reportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_shares').select('*').eq('report_id', reportId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareReport(reportId: string, sharedBy: string, sharedWith: string, permission: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_shares').insert({ report_id: reportId, shared_by: sharedBy, shared_with: sharedWith, permission, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeReportShare(shareId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_shares').update({ is_active: false }).eq('id', shareId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportTemplates(userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('report_templates').select('*').order('name', { ascending: true }); if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReportTemplate(userId: string, input: { name: string; description?: string; template_data: any; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_templates').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportViews(reportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_views').select('*').eq('report_id', reportId).order('viewed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackReportView(reportId: string, userId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_views').insert({ report_id: reportId, user_id: userId, viewed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReportWidgets(reportId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_widgets').select('*').eq('report_id', reportId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addReportWidget(reportId: string, input: { type: string; title: string; config: any; order_index: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_widgets').insert({ report_id: reportId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReportWidget(widgetId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('report_widgets').update(updates).eq('id', widgetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeReportWidget(widgetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('report_widgets').delete().eq('id', widgetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
