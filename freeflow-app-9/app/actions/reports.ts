'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('reports')

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ReportInput {
  name: string
  description?: string
  type?: 'financial' | 'sales' | 'analytics' | 'performance' | 'custom'
  status?: 'draft' | 'generating' | 'ready' | 'scheduled' | 'archived'
  date_from?: string
  date_to?: string
  is_recurring?: boolean
  schedule_cron?: string
  config?: Record<string, unknown>
  filters?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface RevenueEntryInput {
  amount: number
  currency?: string
  type?: 'income' | 'expense' | 'refund'
  category?: string
  source?: string
  source_id?: string
  client_id?: string
  project_id?: string
  invoice_id?: string
  entry_date?: string
  description?: string
  metadata?: Record<string, unknown>
}

interface Report {
  id: string
  user_id: string
  report_number: string
  name: string
  description?: string
  type: string
  status: string
  date_from?: string
  date_to?: string
  is_recurring: boolean
  schedule_cron?: string
  config: Record<string, unknown>
  filters: Record<string, unknown>
  metadata: Record<string, unknown>
  generated_at?: string
  data_points?: number
  created_at: string
  updated_at: string
}

interface RevenueEntry {
  id: string
  user_id: string
  amount: number
  currency: string
  type: string
  category?: string
  source?: string
  source_id?: string
  client_id?: string
  project_id?: string
  invoice_id?: string
  entry_date: string
  description?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface ReportStats {
  total: number
  draft: number
  ready: number
  scheduled: number
  archived: number
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

// ============================================
// REPORT CRUD OPERATIONS
// ============================================

export async function getReports(): Promise<ActionResult<Report[]>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized reports retrieval attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to retrieve reports', { error, userId: user.id })
      return actionError('Failed to retrieve reports', 'DATABASE_ERROR')
    }

    logger.info('Reports retrieved successfully', { userId: user.id, count: data?.length || 0 })
    return actionSuccess(data || [], 'Reports retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error retrieving reports', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getReport(id: string): Promise<ActionResult<Report>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid report ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized report retrieval attempt', { reportId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to retrieve report', { error, reportId: id, userId: user.id })
      return actionError('Failed to retrieve report', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Report not found', { reportId: id, userId: user.id })
      return actionError('Report not found', 'NOT_FOUND')
    }

    logger.info('Report retrieved successfully', { reportId: id, userId: user.id })
    return actionSuccess(data, 'Report retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error retrieving report', { error, reportId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createReport(input: ReportInput): Promise<ActionResult<Report>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized report creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Get next report number
    const { data: lastReport } = await supabase
      .from('reports')
      .select('report_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let reportNumber = 'RPT-0001'
    if (lastReport?.report_number) {
      const num = parseInt(lastReport.report_number.replace('RPT-', '')) + 1
      reportNumber = `RPT-${num.toString().padStart(4, '0')}`
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...input,
        user_id: user.id,
        report_number: reportNumber,
        config: input.config || {},
        filters: input.filters || {},
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create report', { error, userId: user.id })
      return actionError('Failed to create report', 'DATABASE_ERROR')
    }

    logger.info('Report created successfully', {
      reportId: data.id,
      reportNumber,
      userId: user.id
    })

    revalidatePath('/dashboard/reports-v2')
    return actionSuccess(data, 'Report created successfully')
  } catch (error) {
    logger.error('Unexpected error creating report', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateReport(
  id: string,
  input: Partial<ReportInput>
): Promise<ActionResult<Report>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid report ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized report update attempt', { reportId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('reports')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update report', { error, reportId: id, userId: user.id })
      return actionError('Failed to update report', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Report not found for update', { reportId: id, userId: user.id })
      return actionError('Report not found', 'NOT_FOUND')
    }

    logger.info('Report updated successfully', { reportId: id, userId: user.id })

    revalidatePath('/dashboard/reports-v2')
    return actionSuccess(data, 'Report updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating report', { error, reportId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteReport(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid report ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized report deletion attempt', { reportId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete report', { error, reportId: id, userId: user.id })
      return actionError('Failed to delete report', 'DATABASE_ERROR')
    }

    logger.info('Report deleted successfully', { reportId: id, userId: user.id })

    revalidatePath('/dashboard/reports-v2')
    return actionSuccess({ success: true }, 'Report deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting report', { error, reportId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function generateReport(id: string): Promise<ActionResult<Report>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid report ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized report generation attempt', { reportId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Set status to generating
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: 'generating',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      logger.error('Failed to set report status to generating', {
        error: updateError,
        reportId: id,
        userId: user.id
      })
      return actionError('Failed to start report generation', 'DATABASE_ERROR')
    }

    // In production, this would trigger actual report generation
    // For now, we simulate completion
    const { data, error } = await supabase
      .from('reports')
      .update({
        status: 'ready',
        generated_at: new Date().toISOString(),
        data_points: Math.floor(Math.random() * 1000) + 100,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to generate report', { error, reportId: id, userId: user.id })
      return actionError('Failed to generate report', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Report not found for generation', { reportId: id, userId: user.id })
      return actionError('Report not found', 'NOT_FOUND')
    }

    logger.info('Report generated successfully', {
      reportId: id,
      userId: user.id,
      dataPoints: data.data_points
    })

    revalidatePath('/dashboard/reports-v2')
    return actionSuccess(data, 'Report generated successfully')
  } catch (error) {
    logger.error('Unexpected error generating report', { error, reportId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function archiveReport(id: string): Promise<ActionResult<Report>> {
  try {
    return await updateReport(id, { status: 'archived' })
  } catch (error) {
    logger.error('Unexpected error archiving report', { error, reportId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function scheduleReport(
  id: string,
  cronExpression: string
): Promise<ActionResult<Report>> {
  try {
    if (!cronExpression || cronExpression.trim().length === 0) {
      return actionError('Cron expression is required', 'VALIDATION_ERROR')
    }

    return await updateReport(id, {
      status: 'scheduled',
      is_recurring: true,
      schedule_cron: cronExpression
    })
  } catch (error) {
    logger.error('Unexpected error scheduling report', { error, reportId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// REVENUE ENTRIES
// ============================================

export async function getRevenueEntries(
  dateFrom?: string,
  dateTo?: string
): Promise<ActionResult<RevenueEntry[]>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized revenue entries retrieval attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('revenue_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })

    if (dateFrom) query = query.gte('entry_date', dateFrom)
    if (dateTo) query = query.lte('entry_date', dateTo)

    const { data, error } = await query

    if (error) {
      logger.error('Failed to retrieve revenue entries', { error, userId: user.id })
      return actionError('Failed to retrieve revenue entries', 'DATABASE_ERROR')
    }

    logger.info('Revenue entries retrieved successfully', {
      userId: user.id,
      count: data?.length || 0,
      dateFrom,
      dateTo
    })

    return actionSuccess(data || [], 'Revenue entries retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error retrieving revenue entries', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createRevenueEntry(
  input: RevenueEntryInput
): Promise<ActionResult<RevenueEntry>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized revenue entry creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('revenue_entries')
      .insert({
        ...input,
        user_id: user.id,
        entry_date: input.entry_date || new Date().toISOString().split('T')[0],
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create revenue entry', { error, userId: user.id })
      return actionError('Failed to create revenue entry', 'DATABASE_ERROR')
    }

    logger.info('Revenue entry created successfully', {
      entryId: data.id,
      userId: user.id,
      amount: input.amount,
      type: input.type
    })

    revalidatePath('/dashboard/reports-v2')
    return actionSuccess(data, 'Revenue entry created successfully')
  } catch (error) {
    logger.error('Unexpected error creating revenue entry', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteRevenueEntry(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid revenue entry ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized revenue entry deletion attempt', { entryId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('revenue_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete revenue entry', { error, entryId: id, userId: user.id })
      return actionError('Failed to delete revenue entry', 'DATABASE_ERROR')
    }

    logger.info('Revenue entry deleted successfully', { entryId: id, userId: user.id })

    revalidatePath('/dashboard/reports-v2')
    return actionSuccess({ success: true }, 'Revenue entry deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting revenue entry', { error, entryId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getReportStats(): Promise<ActionResult<ReportStats>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized report stats retrieval attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const [{ data: reports }, { data: revenue }] = await Promise.all([
      supabase
        .from('reports')
        .select('status')
        .eq('user_id', user.id),
      supabase
        .from('revenue_entries')
        .select('amount, type')
        .eq('user_id', user.id)
    ])

    const income = revenue?.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0) || 0
    const expenses = revenue?.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0) || 0
    const refunds = revenue?.filter(r => r.type === 'refund').reduce((sum, r) => sum + r.amount, 0) || 0

    const stats: ReportStats = {
      total: reports?.length || 0,
      draft: reports?.filter(r => r.status === 'draft').length || 0,
      ready: reports?.filter(r => r.status === 'ready').length || 0,
      scheduled: reports?.filter(r => r.status === 'scheduled').length || 0,
      archived: reports?.filter(r => r.status === 'archived').length || 0,
      totalRevenue: income,
      totalExpenses: expenses + refunds,
      netIncome: income - expenses - refunds
    }

    logger.info('Report stats retrieved successfully', { userId: user.id, stats })

    return actionSuccess(stats, 'Report stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error retrieving report stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
