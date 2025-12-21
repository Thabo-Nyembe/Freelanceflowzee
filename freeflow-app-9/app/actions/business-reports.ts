'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('business-reports-actions')

export interface ReportInput {
  title: string
  description?: string
  report_type?: 'financial' | 'operational' | 'custom' | 'analytics' | 'sales'
  schedule?: 'on-demand' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  file_format?: string
  data_range_start?: string
  data_range_end?: string
  filters?: Record<string, any>
}

export async function createReport(input: ReportInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('business_reports')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        report_type: input.report_type || 'custom',
        schedule: input.schedule || 'on-demand',
        file_format: input.file_format || 'pdf',
        data_range_start: input.data_range_start || null,
        data_range_end: input.data_range_end || null,
        filters: input.filters || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create report', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/reporting-v2')
    logger.info('Report created successfully', { reportId: data.id })
    return actionSuccess(data, 'Report created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating report', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateReport(id: string, updates: Partial<ReportInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('business_reports')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update report', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/reporting-v2')
    logger.info('Report updated successfully', { reportId: id })
    return actionSuccess(data, 'Report updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating report', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteReport(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('business_reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete report', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/reporting-v2')
    logger.info('Report deleted successfully', { reportId: id })
    return actionSuccess({ success: true }, 'Report deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting report', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function generateReport(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Set status to generating
    const { error: updateError } = await supabase
      .from('business_reports')
      .update({
        status: 'generating',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      logger.error('Failed to set report generating status', updateError)
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    // In a real app, this would trigger an async job
    // For now, we'll simulate completion
    const { data, error } = await supabase
      .from('business_reports')
      .update({
        status: 'ready',
        last_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to generate report', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/reporting-v2')
    logger.info('Report generated successfully', { reportId: id })
    return actionSuccess(data, 'Report generated successfully')
  } catch (error: any) {
    logger.error('Unexpected error generating report', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function viewReport(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: report, error: fetchError } = await supabase
      .from('business_reports')
      .select('views_count')
      .eq('id', id)
      .single()

    if (fetchError || !report) {
      logger.error('Report not found', { reportId: id })
      return actionError('Report not found', 'DATABASE_ERROR')
    }

    const { data, error } = await supabase
      .from('business_reports')
      .update({
        views_count: report.views_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update report view count', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/reporting-v2')
    logger.info('Report view count updated', { reportId: id })
    return actionSuccess(data, 'Report viewed successfully')
  } catch (error: any) {
    logger.error('Unexpected error viewing report', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function downloadReport(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: report, error: fetchError } = await supabase
      .from('business_reports')
      .select('downloads_count, file_url')
      .eq('id', id)
      .single()

    if (fetchError || !report) {
      logger.error('Report not found', { reportId: id })
      return actionError('Report not found', 'DATABASE_ERROR')
    }

    const { data, error } = await supabase
      .from('business_reports')
      .update({
        downloads_count: report.downloads_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update report download count', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/reporting-v2')
    logger.info('Report downloaded successfully', { reportId: id })
    return actionSuccess({ ...data, downloadUrl: report.file_url }, 'Report downloaded successfully')
  } catch (error: any) {
    logger.error('Unexpected error downloading report', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function shareReport(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: report, error: fetchError } = await supabase
      .from('business_reports')
      .select('shares_count')
      .eq('id', id)
      .single()

    if (fetchError || !report) {
      logger.error('Report not found', { reportId: id })
      return actionError('Report not found', 'DATABASE_ERROR')
    }

    const { data, error } = await supabase
      .from('business_reports')
      .update({
        shares_count: report.shares_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update report share count', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/reporting-v2')
    logger.info('Report shared successfully', { reportId: id })
    return actionSuccess(data, 'Report shared successfully')
  } catch (error: any) {
    logger.error('Unexpected error sharing report', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function scheduleReport(id: string, schedule: string, nextScheduledAt?: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('business_reports')
      .update({
        schedule,
        next_scheduled_at: nextScheduledAt || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to schedule report', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/reporting-v2')
    logger.info('Report scheduled successfully', { reportId: id, schedule })
    return actionSuccess(data, 'Report scheduled successfully')
  } catch (error: any) {
    logger.error('Unexpected error scheduling report', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getReports(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('business_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get reports', error)
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Reports retrieved successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Reports retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting reports', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
