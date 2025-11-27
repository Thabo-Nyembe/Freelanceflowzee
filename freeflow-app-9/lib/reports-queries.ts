// Reports Queries - Supabase integration for custom reports management
// Handles report creation, scheduling, exports, and management

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('reports')

// ============================================================================
// Types
// ============================================================================

export type ReportType = 'analytics' | 'financial' | 'performance' | 'sales' | 'custom'
export type ReportStatus = 'draft' | 'generating' | 'ready' | 'scheduled' | 'failed'
export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'

export interface Report {
  id: string
  user_id: string
  name: string
  description?: string
  type: ReportType
  status: ReportStatus
  date_range_start?: string
  date_range_end?: string
  filters: Record<string, any>
  metrics: string[]
  grouping: string[]
  frequency: ReportFrequency
  next_run_at?: string
  last_run_at?: string
  recipients: string[]
  tags: string[]
  data_points: number
  file_size: number
  created_at: string
  updated_at: string
  created_by?: string
}

export interface ReportExport {
  id: string
  report_id: string
  user_id: string
  name: string
  format: ExportFormat
  file_url?: string
  file_size: number
  date_range_start?: string
  date_range_end?: string
  data_points: number
  status: ReportStatus
  generated_at?: string
  error_message?: string
  download_count: number
  last_downloaded_at?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface ReportSchedule {
  id: string
  report_id: string
  user_id: string
  frequency: ReportFrequency
  recipients: string[]
  day_of_week?: number
  day_of_month?: number
  hour: number
  timezone: string
  is_active: boolean
  next_run_at: string
  last_run_at?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// Report Management
// ============================================================================

/**
 * Get all reports for a user with optional filtering
 */
export async function getReports(
  userId: string,
  filters?: {
    type?: ReportType
    status?: ReportStatus
    tags?: string[]
    search?: string
  }
): Promise<{ data: Report[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    let query = supabase
      .from('custom_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching reports', { error: error.message, userId, filters, duration })
      return { data: [], error }
    }

    logger.info('Reports fetched successfully', { userId, count: data.length, filters, duration })
    return { data: data as Report[], error: null }
  } catch (error: any) {
    logger.error('Exception in getReports', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get a single report by ID
 */
export async function getReport(reportId: string, userId: string): Promise<{ data: Report | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('custom_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching report', { error: error.message, reportId, userId, duration })
      return { data: null, error }
    }

    logger.info('Report fetched successfully', { reportId, userId, duration })
    return { data: data as Report, error: null }
  } catch (error: any) {
    logger.error('Exception in getReport', { error: error.message, reportId, userId })
    return { data: null, error }
  }
}

/**
 * Create a new report
 */
export async function createReport(
  userId: string,
  report: {
    name: string
    description?: string
    type: ReportType
    status?: ReportStatus
    date_range_start?: string
    date_range_end?: string
    filters?: Record<string, any>
    metrics?: string[]
    grouping?: string[]
    frequency?: ReportFrequency
    recipients?: string[]
    tags?: string[]
    created_by?: string
  }
): Promise<{ data: Report | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('custom_reports')
      .insert({
        user_id: userId,
        name: report.name,
        description: report.description,
        type: report.type,
        status: report.status || 'draft',
        date_range_start: report.date_range_start,
        date_range_end: report.date_range_end,
        filters: report.filters || {},
        metrics: report.metrics || [],
        grouping: report.grouping || [],
        frequency: report.frequency || 'once',
        recipients: report.recipients || [],
        tags: report.tags || [],
        created_by: report.created_by,
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error creating report', { error: error.message, userId, reportName: report.name, duration })
      return { data: null, error }
    }

    logger.info('Report created successfully', { reportId: data.id, userId, reportName: report.name, duration })
    return { data: data as Report, error: null }
  } catch (error: any) {
    logger.error('Exception in createReport', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Update an existing report
 */
export async function updateReport(
  reportId: string,
  userId: string,
  updates: Partial<Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Report | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('custom_reports')
      .update(updates)
      .eq('id', reportId)
      .eq('user_id', userId)
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error updating report', { error: error.message, reportId, userId, duration })
      return { data: null, error }
    }

    logger.info('Report updated successfully', { reportId, userId, updates: Object.keys(updates), duration })
    return { data: data as Report, error: null }
  } catch (error: any) {
    logger.error('Exception in updateReport', { error: error.message, reportId, userId })
    return { data: null, error }
  }
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: string, userId: string): Promise<{ success: boolean; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('custom_reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error deleting report', { error: error.message, reportId, userId, duration })
      return { success: false, error }
    }

    logger.info('Report deleted successfully', { reportId, userId, duration })
    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in deleteReport', { error: error.message, reportId, userId })
    return { success: false, error }
  }
}

/**
 * Duplicate a report
 */
export async function duplicateReport(reportId: string, userId: string): Promise<{ data: Report | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    // Get the original report
    const { data: originalReport, error: fetchError } = await supabase
      .from('custom_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      logger.error('Error fetching report to duplicate', { error: fetchError.message, reportId, userId })
      return { data: null, error: fetchError }
    }

    // Create duplicate with modified name
    const { data, error } = await supabase
      .from('custom_reports')
      .insert({
        user_id: userId,
        name: `${originalReport.name} (Copy)`,
        description: originalReport.description,
        type: originalReport.type,
        status: 'draft',
        date_range_start: originalReport.date_range_start,
        date_range_end: originalReport.date_range_end,
        filters: originalReport.filters,
        metrics: originalReport.metrics,
        grouping: originalReport.grouping,
        frequency: originalReport.frequency,
        recipients: originalReport.recipients,
        tags: originalReport.tags,
        created_by: originalReport.created_by,
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error duplicating report', { error: error.message, reportId, userId, duration })
      return { data: null, error }
    }

    logger.info('Report duplicated successfully', { originalId: reportId, newId: data.id, userId, duration })
    return { data: data as Report, error: null }
  } catch (error: any) {
    logger.error('Exception in duplicateReport', { error: error.message, reportId, userId })
    return { data: null, error }
  }
}

// ============================================================================
// Report Exports
// ============================================================================

/**
 * Get all exports for a report
 */
export async function getReportExports(reportId: string, userId: string): Promise<{ data: ReportExport[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('report_exports')
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching report exports', { error: error.message, reportId, userId, duration })
      return { data: [], error }
    }

    logger.info('Report exports fetched successfully', { reportId, userId, count: data.length, duration })
    return { data: data as ReportExport[], error: null }
  } catch (error: any) {
    logger.error('Exception in getReportExports', { error: error.message, reportId, userId })
    return { data: [], error }
  }
}

/**
 * Create a new report export
 */
export async function createReportExport(
  reportId: string,
  userId: string,
  exportData: {
    name: string
    format: ExportFormat
    file_url?: string
    file_size?: number
    date_range_start?: string
    date_range_end?: string
    data_points?: number
    expires_at?: string
  }
): Promise<{ data: ReportExport | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('report_exports')
      .insert({
        report_id: reportId,
        user_id: userId,
        name: exportData.name,
        format: exportData.format,
        file_url: exportData.file_url,
        file_size: exportData.file_size || 0,
        date_range_start: exportData.date_range_start,
        date_range_end: exportData.date_range_end,
        data_points: exportData.data_points || 0,
        status: 'generating',
        expires_at: exportData.expires_at,
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error creating report export', { error: error.message, reportId, userId, duration })
      return { data: null, error }
    }

    logger.info('Report export created successfully', { exportId: data.id, reportId, userId, format: exportData.format, duration })
    return { data: data as ReportExport, error: null }
  } catch (error: any) {
    logger.error('Exception in createReportExport', { error: error.message, reportId, userId })
    return { data: null, error }
  }
}

/**
 * Update export status after generation
 */
export async function updateReportExportStatus(
  exportId: string,
  userId: string,
  status: ReportStatus,
  fileUrl?: string,
  fileSize?: number,
  errorMessage?: string
): Promise<{ data: ReportExport | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const updates: any = {
      status,
      generated_at: status === 'ready' ? new Date().toISOString() : undefined,
      file_url: fileUrl,
      file_size: fileSize,
      error_message: errorMessage,
    }

    const { data, error } = await supabase
      .from('report_exports')
      .update(updates)
      .eq('id', exportId)
      .eq('user_id', userId)
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error updating export status', { error: error.message, exportId, userId, status, duration })
      return { data: null, error }
    }

    logger.info('Export status updated successfully', { exportId, userId, status, duration })
    return { data: data as ReportExport, error: null }
  } catch (error: any) {
    logger.error('Exception in updateReportExportStatus', { error: error.message, exportId, userId })
    return { data: null, error }
  }
}

/**
 * Track export download
 */
export async function trackExportDownload(exportId: string, userId: string): Promise<{ success: boolean; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    // Increment download count and update last downloaded timestamp
    const { error } = await supabase.rpc('increment_export_download', {
      export_id: exportId,
      user_id: userId,
    })

    // If RPC doesn't exist, fall back to manual update
    if (error) {
      const { data: currentExport } = await supabase
        .from('report_exports')
        .select('download_count')
        .eq('id', exportId)
        .eq('user_id', userId)
        .single()

      if (currentExport) {
        await supabase
          .from('report_exports')
          .update({
            download_count: currentExport.download_count + 1,
            last_downloaded_at: new Date().toISOString(),
          })
          .eq('id', exportId)
          .eq('user_id', userId)
      }
    }

    const duration = performance.now() - startTime
    logger.info('Export download tracked', { exportId, userId, duration })
    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in trackExportDownload', { error: error.message, exportId, userId })
    return { success: false, error }
  }
}

/**
 * Delete expired exports (cleanup function)
 */
export async function deleteExpiredExports(userId: string): Promise<{ count: number; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('report_exports')
      .delete()
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString())
      .select()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error deleting expired exports', { error: error.message, userId, duration })
      return { count: 0, error }
    }

    logger.info('Expired exports deleted successfully', { userId, count: data.length, duration })
    return { count: data.length, error: null }
  } catch (error: any) {
    logger.error('Exception in deleteExpiredExports', { error: error.message, userId })
    return { count: 0, error }
  }
}

// ============================================================================
// Report Schedules
// ============================================================================

/**
 * Get all schedules for a report
 */
export async function getReportSchedules(reportId: string, userId: string): Promise<{ data: ReportSchedule[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching report schedules', { error: error.message, reportId, userId, duration })
      return { data: [], error }
    }

    logger.info('Report schedules fetched successfully', { reportId, userId, count: data.length, duration })
    return { data: data as ReportSchedule[], error: null }
  } catch (error: any) {
    logger.error('Exception in getReportSchedules', { error: error.message, reportId, userId })
    return { data: [], error }
  }
}

/**
 * Create a report schedule
 */
export async function createReportSchedule(
  reportId: string,
  userId: string,
  schedule: {
    frequency: ReportFrequency
    recipients: string[]
    day_of_week?: number
    day_of_month?: number
    hour?: number
    timezone?: string
  }
): Promise<{ data: ReportSchedule | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    // Calculate next run time using the database function
    const { data: nextRunData, error: nextRunError } = await supabase.rpc('calculate_next_run', {
      p_frequency: schedule.frequency,
      p_current_time: new Date().toISOString(),
      p_day_of_week: schedule.day_of_week,
      p_day_of_month: schedule.day_of_month,
      p_hour: schedule.hour || 9,
    })

    if (nextRunError) {
      logger.error('Error calculating next run time', { error: nextRunError.message, reportId, userId })
      return { data: null, error: nextRunError }
    }

    const { data, error } = await supabase
      .from('report_schedules')
      .insert({
        report_id: reportId,
        user_id: userId,
        frequency: schedule.frequency,
        recipients: schedule.recipients,
        day_of_week: schedule.day_of_week,
        day_of_month: schedule.day_of_month,
        hour: schedule.hour || 9,
        timezone: schedule.timezone || 'UTC',
        is_active: true,
        next_run_at: nextRunData || new Date().toISOString(),
      })
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error creating report schedule', { error: error.message, reportId, userId, duration })
      return { data: null, error }
    }

    logger.info('Report schedule created successfully', { scheduleId: data.id, reportId, userId, frequency: schedule.frequency, duration })
    return { data: data as ReportSchedule, error: null }
  } catch (error: any) {
    logger.error('Exception in createReportSchedule', { error: error.message, reportId, userId })
    return { data: null, error }
  }
}

/**
 * Update a report schedule
 */
export async function updateReportSchedule(
  scheduleId: string,
  userId: string,
  updates: Partial<Omit<ReportSchedule, 'id' | 'report_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ReportSchedule | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('report_schedules')
      .update(updates)
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select()
      .single()

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error updating report schedule', { error: error.message, scheduleId, userId, duration })
      return { data: null, error }
    }

    logger.info('Report schedule updated successfully', { scheduleId, userId, updates: Object.keys(updates), duration })
    return { data: data as ReportSchedule, error: null }
  } catch (error: any) {
    logger.error('Exception in updateReportSchedule', { error: error.message, scheduleId, userId })
    return { data: null, error }
  }
}

/**
 * Toggle schedule active status
 */
export async function toggleReportSchedule(scheduleId: string, userId: string, isActive: boolean): Promise<{ success: boolean; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('report_schedules')
      .update({ is_active: isActive })
      .eq('id', scheduleId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error toggling report schedule', { error: error.message, scheduleId, userId, isActive, duration })
      return { success: false, error }
    }

    logger.info('Report schedule toggled successfully', { scheduleId, userId, isActive, duration })
    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in toggleReportSchedule', { error: error.message, scheduleId, userId })
    return { success: false, error }
  }
}

/**
 * Delete a report schedule
 */
export async function deleteReportSchedule(scheduleId: string, userId: string): Promise<{ success: boolean; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('report_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId)

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error deleting report schedule', { error: error.message, scheduleId, userId, duration })
      return { success: false, error }
    }

    logger.info('Report schedule deleted successfully', { scheduleId, userId, duration })
    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in deleteReportSchedule', { error: error.message, scheduleId, userId })
    return { success: false, error }
  }
}

/**
 * Get all active schedules that need to run (for cron jobs)
 */
export async function getSchedulesToRun(): Promise<{ data: ReportSchedule[]; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString())

    const duration = performance.now() - startTime

    if (error) {
      logger.error('Error fetching schedules to run', { error: error.message, duration })
      return { data: [], error }
    }

    logger.info('Schedules to run fetched successfully', { count: data.length, duration })
    return { data: data as ReportSchedule[], error: null }
  } catch (error: any) {
    logger.error('Exception in getSchedulesToRun', { error: error.message })
    return { data: [], error }
  }
}

// ============================================================================
// Report Generation (Utility Functions)
// ============================================================================

/**
 * Get report statistics for dashboard
 */
export async function getReportStatistics(userId: string): Promise<{
  data: {
    totalReports: number
    activeSchedules: number
    totalExports: number
    storageUsed: number
  } | null
  error: any
}> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    // Get counts in parallel
    const [reportsResult, schedulesResult, exportsResult] = await Promise.all([
      supabase
        .from('custom_reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('report_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true),
      supabase
        .from('report_exports')
        .select('file_size')
        .eq('user_id', userId),
    ])

    const totalReports = reportsResult.count || 0
    const activeSchedules = schedulesResult.count || 0
    const totalExports = exportsResult.data?.length || 0
    const storageUsed = exportsResult.data?.reduce((sum, exp) => sum + (exp.file_size || 0), 0) || 0

    const duration = performance.now() - startTime

    logger.info('Report statistics fetched successfully', {
      userId,
      totalReports,
      activeSchedules,
      totalExports,
      storageUsed,
      duration,
    })

    return {
      data: {
        totalReports,
        activeSchedules,
        totalExports,
        storageUsed,
      },
      error: null,
    }
  } catch (error: any) {
    logger.error('Exception in getReportStatistics', { error: error.message, userId })
    return { data: null, error }
  }
}
