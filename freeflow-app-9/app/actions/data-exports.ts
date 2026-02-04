'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { hasPermission, canAccessResource } from '@/lib/auth/permissions'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { uuidSchema } from '@/lib/validations'

// ============================================
// TYPES
// ============================================

interface DataExport {
  id: string
  user_id: string
  export_name: string
  description?: string | null
  export_format: string
  data_source: string
  export_type?: string | null
  status: string
  started_at?: string | null
  completed_at?: string | null
  progress_percentage: number
  processed_records: number
  duration_seconds?: number | null
  file_size_bytes?: number | null
  file_size_mb?: number | null
  download_url?: string | null
  scheduled_at?: string | null
  is_recurring?: boolean
  recurrence_pattern?: string | null
  error_message?: string | null
  error_code?: string | null
  expires_at?: string | null
  created_at: string
  updated_at: string
}

interface CreateDataExportInput {
  export_name: string
  description?: string
  export_format: string
  data_source: string
  export_type?: string
}

interface ScheduleExportUpdate {
  status: string
  scheduled_at: string
  is_recurring?: boolean
  recurrence_pattern?: string
}

// ============================================
// LOGGER
// ============================================

const logger = createSimpleLogger('data-exports')

// ============================================
// DATA EXPORT ACTIONS
// ============================================

/**
 * Create a new data export
 */
export async function createDataExport(
  exportData: CreateDataExportInput
): Promise<ActionResult<DataExport>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Create data export failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Data exports require export_data permission
    const canExport = await hasPermission('export_data')
    if (!canExport) {
      logger.warn('Create data export failed: Insufficient permissions', { userId: user.id })
      return actionError('Permission denied: data export access required', 'FORBIDDEN')
    }

    const { data: dataExport, error } = await supabase
      .from('data_exports')
      .insert({
        user_id: user.id,
        status: 'pending',
        ...exportData
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create data export', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Data export created successfully', {
      exportId: dataExport.id,
      userId: user.id,
      exportFormat: exportData.export_format
    })

    revalidatePath('/dashboard/data-export-v2')
    return actionSuccess(dataExport as DataExport)
  } catch (error) {
    logger.error('Unexpected error creating data export', { error })
    return actionError('Failed to create data export', 'INTERNAL_ERROR')
  }
}

/**
 * Start a data export
 */
export async function startExport(id: string): Promise<ActionResult<DataExport>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid export ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Start export failed: User not authenticated', { exportId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check export permission and resource access
    const canExport = await hasPermission('export_data')
    if (!canExport) {
      logger.warn('Start export failed: Insufficient permissions', { userId: user.id, exportId: id })
      return actionError('Permission denied: data export access required', 'FORBIDDEN')
    }

    const canAccess = await canAccessResource('data_exports', id)
    if (!canAccess) {
      logger.warn('Start export failed: Access denied', { userId: user.id, exportId: id })
      return actionError('Access denied: you cannot access this export', 'FORBIDDEN')
    }

    const { data: dataExport, error } = await supabase
      .from('data_exports')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start export', { error, exportId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Export started successfully', { exportId: id, userId: user.id })

    revalidatePath('/dashboard/data-export-v2')
    return actionSuccess(dataExport as DataExport)
  } catch (error) {
    logger.error('Unexpected error starting export', { error, exportId: id })
    return actionError('Failed to start export', 'INTERNAL_ERROR')
  }
}

/**
 * Update export progress
 */
export async function updateExportProgress(
  id: string,
  progress: number,
  processedRecords: number
): Promise<ActionResult<DataExport>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid export ID format', 'VALIDATION_ERROR')
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      return actionError('Progress must be between 0 and 100', 'VALIDATION_ERROR')
    }

    if (processedRecords < 0) {
      return actionError('Processed records must be non-negative', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Update export progress failed: User not authenticated', { exportId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check export permission and resource access
    const canExport = await hasPermission('export_data')
    if (!canExport) {
      logger.warn('Update export progress failed: Insufficient permissions', { userId: user.id, exportId: id })
      return actionError('Permission denied: data export access required', 'FORBIDDEN')
    }

    const canAccess = await canAccessResource('data_exports', id)
    if (!canAccess) {
      logger.warn('Update export progress failed: Access denied', { userId: user.id, exportId: id })
      return actionError('Access denied: you cannot access this export', 'FORBIDDEN')
    }

    const { data: dataExport, error } = await supabase
      .from('data_exports')
      .update({
        progress_percentage: parseFloat(progress.toFixed(2)),
        processed_records: processedRecords
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update export progress', {
        error,
        exportId: id,
        userId: user.id,
        progress,
        processedRecords
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Export progress updated', {
      exportId: id,
      userId: user.id,
      progress,
      processedRecords
    })

    revalidatePath('/dashboard/data-export-v2')
    return actionSuccess(dataExport as DataExport)
  } catch (error) {
    logger.error('Unexpected error updating export progress', { error, exportId: id })
    return actionError('Failed to update export progress', 'INTERNAL_ERROR')
  }
}

/**
 * Complete a data export
 */
export async function completeExport(
  id: string,
  fileSize: number,
  downloadUrl: string
): Promise<ActionResult<DataExport>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid export ID format', 'VALIDATION_ERROR')
    }

    if (fileSize < 0) {
      return actionError('File size must be non-negative', 'VALIDATION_ERROR')
    }

    if (!downloadUrl || downloadUrl.trim().length === 0) {
      return actionError('Download URL is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Complete export failed: User not authenticated', { exportId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check export permission and resource access
    const canExport = await hasPermission('export_data')
    if (!canExport) {
      logger.warn('Complete export failed: Insufficient permissions', { userId: user.id, exportId: id })
      return actionError('Permission denied: data export access required', 'FORBIDDEN')
    }

    const canAccess = await canAccessResource('data_exports', id)
    if (!canAccess) {
      logger.warn('Complete export failed: Access denied', { userId: user.id, exportId: id })
      return actionError('Access denied: you cannot access this export', 'FORBIDDEN')
    }

    const { data: current } = await supabase
      .from('data_exports')
      .select('started_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.warn('Complete export failed: Export not found', { exportId: id, userId: user.id })
      return actionError('Export not found', 'NOT_FOUND')
    }

    const completedAt = new Date()
    const startedAt = new Date(current.started_at)
    const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000)

    const { data: dataExport, error } = await supabase
      .from('data_exports')
      .update({
        status: 'completed',
        completed_at: completedAt.toISOString(),
        duration_seconds: durationSeconds,
        file_size_bytes: fileSize,
        file_size_mb: parseFloat((fileSize / (1024 * 1024)).toFixed(2)),
        download_url: downloadUrl,
        progress_percentage: 100,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete export', { error, exportId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Export completed successfully', {
      exportId: id,
      userId: user.id,
      durationSeconds,
      fileSizeMb: dataExport.file_size_mb
    })

    revalidatePath('/dashboard/data-export-v2')
    return actionSuccess(dataExport as DataExport)
  } catch (error) {
    logger.error('Unexpected error completing export', { error, exportId: id })
    return actionError('Failed to complete export', 'INTERNAL_ERROR')
  }
}

/**
 * Mark a data export as failed
 */
export async function failExport(
  id: string,
  errorMessage: string,
  errorCode?: string
): Promise<ActionResult<DataExport>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid export ID format', 'VALIDATION_ERROR')
    }

    if (!errorMessage || errorMessage.trim().length === 0) {
      return actionError('Error message is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Fail export failed: User not authenticated', { exportId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const canAccess = await canAccessResource('data_exports', id)
    if (!canAccess) {
      logger.warn('Fail export failed: Access denied', { userId: user.id, exportId: id })
      return actionError('Access denied: you cannot access this export', 'FORBIDDEN')
    }

    const { data: dataExport, error } = await supabase
      .from('data_exports')
      .update({
        status: 'failed',
        error_message: errorMessage,
        error_code: errorCode
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark export as failed', { error, exportId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.warn('Export marked as failed', {
      exportId: id,
      userId: user.id,
      errorMessage,
      errorCode
    })

    revalidatePath('/dashboard/data-export-v2')
    return actionSuccess(dataExport as DataExport)
  } catch (error) {
    logger.error('Unexpected error marking export as failed', { error, exportId: id })
    return actionError('Failed to mark export as failed', 'INTERNAL_ERROR')
  }
}

/**
 * Schedule a data export
 */
export async function scheduleExport(
  id: string,
  scheduledAt: string,
  recurrencePattern?: string
): Promise<ActionResult<DataExport>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid export ID format', 'VALIDATION_ERROR')
    }

    if (!scheduledAt || scheduledAt.trim().length === 0) {
      return actionError('Scheduled date is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Schedule export failed: User not authenticated', { exportId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check export permission and resource access
    const canExport = await hasPermission('export_data')
    if (!canExport) {
      logger.warn('Schedule export failed: Insufficient permissions', { userId: user.id, exportId: id })
      return actionError('Permission denied: data export access required', 'FORBIDDEN')
    }

    const canAccess = await canAccessResource('data_exports', id)
    if (!canAccess) {
      logger.warn('Schedule export failed: Access denied', { userId: user.id, exportId: id })
      return actionError('Access denied: you cannot access this export', 'FORBIDDEN')
    }

    const updateData: ScheduleExportUpdate = {
      status: 'scheduled',
      scheduled_at: scheduledAt
    }

    if (recurrencePattern) {
      updateData.is_recurring = true
      updateData.recurrence_pattern = recurrencePattern
    }

    const { data: dataExport, error } = await supabase
      .from('data_exports')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to schedule export', { error, exportId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Export scheduled successfully', {
      exportId: id,
      userId: user.id,
      scheduledAt,
      isRecurring: !!recurrencePattern
    })

    revalidatePath('/dashboard/data-export-v2')
    return actionSuccess(dataExport as DataExport)
  } catch (error) {
    logger.error('Unexpected error scheduling export', { error, exportId: id })
    return actionError('Failed to schedule export', 'INTERNAL_ERROR')
  }
}

/**
 * Cancel a data export
 */
export async function cancelExport(id: string): Promise<ActionResult<DataExport>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid export ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Cancel export failed: User not authenticated', { exportId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const canAccess = await canAccessResource('data_exports', id)
    if (!canAccess) {
      logger.warn('Cancel export failed: Access denied', { userId: user.id, exportId: id })
      return actionError('Access denied: you cannot access this export', 'FORBIDDEN')
    }

    const { data: dataExport, error } = await supabase
      .from('data_exports')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to cancel export', { error, exportId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Export cancelled successfully', { exportId: id, userId: user.id })

    revalidatePath('/dashboard/data-export-v2')
    return actionSuccess(dataExport as DataExport)
  } catch (error) {
    logger.error('Unexpected error cancelling export', { error, exportId: id })
    return actionError('Failed to cancel export', 'INTERNAL_ERROR')
  }
}
