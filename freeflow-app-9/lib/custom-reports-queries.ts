/**
 * Custom Reports Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type ReportType = 'financial' | 'project-performance' | 'client-activity' | 'time-tracking' | 'resource-utilization' | 'sales-pipeline' | 'team-productivity' | 'custom'
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'funnel' | 'gauge' | 'heatmap'
export type WidgetType = 'chart' | 'table' | 'metric' | 'text' | 'image'
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'png' | 'svg'
export type ReportStatus = 'draft' | 'active' | 'archived' | 'scheduled'
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface CustomReport {
  id: string
  user_id: string
  name: string
  description?: string
  type: ReportType
  status: ReportStatus
  date_range_start?: string
  date_range_end?: string
  is_favorite: boolean
  last_generated_at?: string
  generation_count: number
  view_count: number
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ReportTemplate {
  id: string
  name: string
  description?: string
  type: ReportType
  category: string
  icon: string
  thumbnail?: string
  is_premium: boolean
  is_public: boolean
  usage_count: number
  popularity: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ReportWidget {
  id: string
  report_id: string
  type: WidgetType
  title: string
  description?: string
  position_x: number
  position_y: number
  width: number
  height: number
  chart_type?: ChartType
  data_source: string
  data_fields: string[]
  aggregation?: string
  group_by: string[]
  settings: Record<string, any>
  widget_order: number
  created_at: string
  updated_at: string
}

export interface ReportFilter {
  id: string
  report_id?: string
  widget_id?: string
  field: string
  operator: string
  value: any
  is_active: boolean
  created_at: string
}

export interface ReportShare {
  id: string
  report_id: string
  shared_by: string
  shared_with?: string
  share_token?: string
  expires_at?: string
  can_edit: boolean
  can_export: boolean
  access_count: number
  last_accessed_at?: string
  created_at: string
}

export interface ReportSchedule {
  id: string
  report_id: string
  user_id: string
  frequency: ScheduleFrequency
  export_format: ExportFormat
  recipients: string[]
  is_active: boolean
  next_run_at: string
  last_run_at?: string
  run_count: number
  created_at: string
  updated_at: string
}

export interface ReportExport {
  id: string
  report_id: string
  user_id: string
  format: ExportFormat
  file_url?: string
  file_size?: number
  status: string
  error_message?: string
  expires_at?: string
  created_at: string
}

// CUSTOM REPORTS
export async function getCustomReports(userId: string, filters?: { type?: ReportType; status?: ReportStatus; is_favorite?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('custom_reports').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.is_favorite !== undefined) query = query.eq('is_favorite', filters.is_favorite)
  return await query
}

export async function getCustomReport(reportId: string) {
  const supabase = createClient()
  return await supabase.from('custom_reports').select('*').eq('id', reportId).single()
}

export async function createCustomReport(userId: string, report: Partial<CustomReport>) {
  const supabase = createClient()
  return await supabase.from('custom_reports').insert({ user_id: userId, ...report }).select().single()
}

export async function updateCustomReport(reportId: string, updates: Partial<CustomReport>) {
  const supabase = createClient()
  return await supabase.from('custom_reports').update(updates).eq('id', reportId).select().single()
}

export async function toggleFavorite(reportId: string, isFavorite: boolean) {
  const supabase = createClient()
  return await supabase.from('custom_reports').update({ is_favorite: isFavorite }).eq('id', reportId).select().single()
}

export async function incrementViewCount(reportId: string) {
  const supabase = createClient()
  const { data: report } = await supabase.from('custom_reports').select('view_count').eq('id', reportId).single()
  if (!report) return { data: null, error: new Error('Report not found') }
  return await supabase.from('custom_reports').update({ view_count: report.view_count + 1 }).eq('id', reportId).select().single()
}

export async function deleteCustomReport(reportId: string) {
  const supabase = createClient()
  return await supabase.from('custom_reports').delete().eq('id', reportId)
}

// REPORT TEMPLATES
export async function getReportTemplates(filters?: { type?: ReportType; category?: string; is_public?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('report_templates').select('*').order('popularity', { ascending: false })
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)
  return await query
}

export async function getReportTemplate(templateId: string) {
  const supabase = createClient()
  return await supabase.from('report_templates').select('*').eq('id', templateId).single()
}

export async function getPopularTemplates(limit: number = 5) {
  const supabase = createClient()
  return await supabase.from('report_templates').select('*').eq('is_public', true).order('usage_count', { ascending: false }).limit(limit)
}

// REPORT WIDGETS
export async function getReportWidgets(reportId: string) {
  const supabase = createClient()
  return await supabase.from('report_widgets').select('*').eq('report_id', reportId).order('widget_order')
}

export async function createReportWidget(reportId: string, widget: Partial<ReportWidget>) {
  const supabase = createClient()
  return await supabase.from('report_widgets').insert({ report_id: reportId, ...widget }).select().single()
}

export async function updateReportWidget(widgetId: string, updates: Partial<ReportWidget>) {
  const supabase = createClient()
  return await supabase.from('report_widgets').update(updates).eq('id', widgetId).select().single()
}

export async function deleteReportWidget(widgetId: string) {
  const supabase = createClient()
  return await supabase.from('report_widgets').delete().eq('id', widgetId)
}

// REPORT FILTERS
export async function getReportFilters(reportId: string) {
  const supabase = createClient()
  return await supabase.from('report_filters').select('*').eq('report_id', reportId).eq('is_active', true)
}

export async function getWidgetFilters(widgetId: string) {
  const supabase = createClient()
  return await supabase.from('report_filters').select('*').eq('widget_id', widgetId).eq('is_active', true)
}

export async function createReportFilter(filter: Partial<ReportFilter>) {
  const supabase = createClient()
  return await supabase.from('report_filters').insert(filter).select().single()
}

export async function updateReportFilter(filterId: string, updates: Partial<ReportFilter>) {
  const supabase = createClient()
  return await supabase.from('report_filters').update(updates).eq('id', filterId).select().single()
}

export async function deleteReportFilter(filterId: string) {
  const supabase = createClient()
  return await supabase.from('report_filters').delete().eq('id', filterId)
}

// REPORT SHARES
export async function getReportShares(reportId: string) {
  const supabase = createClient()
  return await supabase.from('report_shares').select('*').eq('report_id', reportId).order('created_at', { ascending: false })
}

export async function createReportShare(share: Partial<ReportShare>) {
  const supabase = createClient()
  return await supabase.from('report_shares').insert(share).select().single()
}

export async function getReportByShareToken(shareToken: string) {
  const supabase = createClient()
  const { data: share } = await supabase.from('report_shares').select('*, custom_reports(*)').eq('share_token', shareToken).single()
  if (share) {
    await supabase.from('report_shares').update({ access_count: share.access_count + 1, last_accessed_at: new Date().toISOString() }).eq('id', share.id)
  }
  return { data: share, error: null }
}

export async function deleteReportShare(shareId: string) {
  const supabase = createClient()
  return await supabase.from('report_shares').delete().eq('id', shareId)
}

// REPORT SCHEDULES
export async function getReportSchedules(reportId: string) {
  const supabase = createClient()
  return await supabase.from('report_schedules').select('*').eq('report_id', reportId).order('next_run_at')
}

export async function createReportSchedule(schedule: Partial<ReportSchedule>) {
  const supabase = createClient()
  return await supabase.from('report_schedules').insert(schedule).select().single()
}

export async function updateReportSchedule(scheduleId: string, updates: Partial<ReportSchedule>) {
  const supabase = createClient()
  return await supabase.from('report_schedules').update(updates).eq('id', scheduleId).select().single()
}

export async function toggleScheduleActive(scheduleId: string, isActive: boolean) {
  const supabase = createClient()
  return await supabase.from('report_schedules').update({ is_active: isActive }).eq('id', scheduleId).select().single()
}

export async function deleteReportSchedule(scheduleId: string) {
  const supabase = createClient()
  return await supabase.from('report_schedules').delete().eq('id', scheduleId)
}

// REPORT EXPORTS
export async function getReportExports(reportId: string) {
  const supabase = createClient()
  return await supabase.from('report_exports').select('*').eq('report_id', reportId).order('created_at', { ascending: false })
}

export async function createReportExport(userId: string, reportId: string, format: ExportFormat) {
  const supabase = createClient()
  return await supabase.from('report_exports').insert({ user_id: userId, report_id: reportId, format, status: 'pending' }).select().single()
}

export async function updateReportExport(exportId: string, updates: Partial<ReportExport>) {
  const supabase = createClient()
  return await supabase.from('report_exports').update(updates).eq('id', exportId).select().single()
}

export async function deleteReportExport(exportId: string) {
  const supabase = createClient()
  return await supabase.from('report_exports').delete().eq('id', exportId)
}

// STATS
export async function getCustomReportsStats(userId: string) {
  const supabase = createClient()
  const [reportsResult, templatesResult, exportsResult, schedulesResult] = await Promise.all([
    supabase.from('custom_reports').select('id, status, is_favorite, generation_count, view_count').eq('user_id', userId),
    supabase.from('report_templates').select('id', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('report_exports').select('id, status').eq('user_id', userId),
    supabase.from('report_schedules').select('id, is_active').eq('user_id', userId)
  ])

  const activeReports = reportsResult.data?.filter(r => r.status === 'active').length || 0
  const favoriteReports = reportsResult.data?.filter(r => r.is_favorite).length || 0
  const totalGenerations = reportsResult.data?.reduce((sum, r) => sum + (r.generation_count || 0), 0) || 0
  const totalViews = reportsResult.data?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0
  const completedExports = exportsResult.data?.filter(e => e.status === 'completed').length || 0
  const activeSchedules = schedulesResult.data?.filter(s => s.is_active).length || 0

  return {
    data: {
      total_reports: reportsResult.count || 0,
      active_reports: activeReports,
      favorite_reports: favoriteReports,
      total_generations: totalGenerations,
      total_views: totalViews,
      total_templates: templatesResult.count || 0,
      total_exports: exportsResult.count || 0,
      completed_exports: completedExports,
      total_schedules: schedulesResult.count || 0,
      active_schedules: activeSchedules
    },
    error: reportsResult.error || templatesResult.error || exportsResult.error || schedulesResult.error
  }
}
