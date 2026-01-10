'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { hasPermission, canAccessResource } from '@/lib/auth/permissions'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  type ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema, dateSchema } from '@/lib/validations'

// ============================================
// LOGGER
// ============================================

const logger = createFeatureLogger('analytics')

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createAnalyticSchema = z.object({
  event_name: z.string().min(1, 'Event name is required').max(100),
  event_type: z.string().max(50).optional().nullable(),
  metric_value: z.number().optional().nullable(),
  metric_unit: z.string().max(50).optional().nullable(),
  dimension_1: z.string().max(100).optional().nullable(),
  dimension_2: z.string().max(100).optional().nullable(),
  dimension_3: z.string().max(100).optional().nullable(),
  timestamp: dateSchema.optional().nullable(),
  session_id: z.string().max(100).optional().nullable(),
  page_url: z.string().max(2000).optional().nullable(),
  referrer: z.string().max(2000).optional().nullable(),
  is_alert_triggered: z.boolean().default(false),
  alert_threshold: z.number().optional().nullable(),
  alert_type: z.string().max(50).optional().nullable(),
  properties: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional()
})

const updateAnalyticSchema = createAnalyticSchema.partial()

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AnalyticData {
  id: string
  user_id: string
  event_name: string
  event_type?: string | null
  metric_value?: number | null
  metric_unit?: string | null
  dimension_1?: string | null
  dimension_2?: string | null
  dimension_3?: string | null
  timestamp?: string | null
  session_id?: string | null
  page_url?: string | null
  referrer?: string | null
  is_alert_triggered: boolean
  alert_triggered_at?: string | null
  alert_threshold?: number | null
  alert_type?: string | null
  properties?: Record<string, unknown>
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

type CreateAnalyticInput = z.infer<typeof createAnalyticSchema>
type UpdateAnalyticInput = z.infer<typeof updateAnalyticSchema>

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a new analytic event
 */
export async function createAnalytic(
  data: CreateAnalyticInput
): Promise<ActionResult<AnalyticData>> {
  try {
    // Validate input
    const validation = createAnalyticSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('Analytic creation validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Analytic creation attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check analytics permission
    const canViewAnalytics = await hasPermission('view_analytics')
    if (!canViewAnalytics) {
      logger.warn('Analytic creation permission denied', { userId: user.id })
      return actionError('Permission denied: analytics access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Create analytic
    const { data: analytic, error } = await supabase
      .from('analytics')
      .insert({
        ...validation.data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create analytic', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Analytic created successfully', {
      analyticId: analytic.id,
      userId: user.id,
      eventName: analytic.event_name
    })

    revalidatePath('/dashboard/analytics-v2')
    return actionSuccess(analytic as AnalyticData, 'Analytic event created successfully')
  } catch (error) {
    logger.error('Unexpected error creating analytic', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing analytic event
 */
export async function updateAnalytic(
  id: string,
  data: UpdateAnalyticInput
): Promise<ActionResult<AnalyticData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid analytic ID format', 'VALIDATION_ERROR')
    }

    // Validate input
    const validation = updateAnalyticSchema.safeParse(data)
    if (!validation.success) {
      logger.warn('Analytic update validation failed', { errors: validation.error.errors })
      return actionValidationError(validation.error.errors)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Analytic update attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check analytics permission
    const canViewAnalytics = await hasPermission('view_analytics')
    if (!canViewAnalytics) {
      logger.warn('Analytic update permission denied', { userId: user.id, analyticId: id })
      return actionError('Permission denied: analytics access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('analytics', id)
    if (!canAccess) {
      logger.warn('Analytic update access denied', { userId: user.id, analyticId: id })
      return actionError('Access denied: you cannot modify this analytic', 'FORBIDDEN')
    }

    // Update analytic
    const { data: analytic, error } = await supabase
      .from('analytics')
      .update(validation.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update analytic', { error, userId: user.id, analyticId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Analytic updated successfully', {
      analyticId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/analytics-v2')
    return actionSuccess(analytic as AnalyticData, 'Analytic event updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating analytic', { error, analyticId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete an analytic event (soft delete)
 */
export async function deleteAnalytic(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid analytic ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Analytic deletion attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check delete permission
    const canDelete = await hasPermission('delete')
    if (!canDelete) {
      logger.warn('Analytic deletion permission denied', { userId: user.id, analyticId: id })
      return actionError('Permission denied: delete access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('analytics', id)
    if (!canAccess) {
      logger.warn('Analytic deletion access denied', { userId: user.id, analyticId: id })
      return actionError('Access denied: you cannot delete this analytic', 'FORBIDDEN')
    }

    // Soft delete analytic
    const { error } = await supabase
      .from('analytics')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete analytic', { error, userId: user.id, analyticId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Analytic deleted successfully', {
      analyticId: id,
      userId: user.id
    })

    revalidatePath('/dashboard/analytics-v2')
    return actionSuccess({ deleted: true }, 'Analytic event deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting analytic', { error, analyticId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Trigger an alert for an analytic event
 */
export async function triggerAlert(id: string): Promise<ActionResult<AnalyticData>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid analytic ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Alert trigger attempted without authentication')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check analytics permission
    const canViewAnalytics = await hasPermission('view_analytics')
    if (!canViewAnalytics) {
      logger.warn('Alert trigger permission denied', { userId: user.id, analyticId: id })
      return actionError('Permission denied: analytics access required', 'INSUFFICIENT_PERMISSIONS')
    }

    // Check resource access
    const canAccess = await canAccessResource('analytics', id)
    if (!canAccess) {
      logger.warn('Alert trigger access denied', { userId: user.id, analyticId: id })
      return actionError('Access denied: you cannot trigger this alert', 'FORBIDDEN')
    }

    // Trigger alert
    const { data: analytic, error } = await supabase
      .from('analytics')
      .update({
        is_alert_triggered: true,
        alert_triggered_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to trigger alert', { error, userId: user.id, analyticId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Alert triggered successfully', {
      analyticId: id,
      userId: user.id,
      eventName: analytic.event_name
    })

    revalidatePath('/dashboard/analytics-v2')
    return actionSuccess(analytic as AnalyticData, 'Alert triggered successfully')
  } catch (error) {
    logger.error('Unexpected error triggering alert', { error, analyticId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
