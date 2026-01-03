'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('performance-analytics-actions')

export async function createPerformanceAnalytic(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: analytic, error } = await supabase
      .from('performance_analytics')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create performance analytic', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-analytics-v2')
    return actionSuccess(analytic, 'Performance analytic created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating performance analytic', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePerformanceAnalytic(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: analytic, error } = await supabase
      .from('performance_analytics')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update performance analytic', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-analytics-v2')
    return actionSuccess(analytic, 'Performance analytic updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating performance analytic', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deletePerformanceAnalytic(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('performance_analytics')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete performance analytic', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-analytics-v2')
    return actionSuccess({ success: true }, 'Performance analytic deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting performance analytic', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resolveAlert(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: analytic, error } = await supabase
      .from('performance_analytics')
      .update({
        is_alert_active: false,
        alert_resolved_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resolve alert', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-analytics-v2')
    return actionSuccess(analytic, 'Alert resolved successfully')
  } catch (error: any) {
    logger.error('Unexpected error resolving alert', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markDegraded(id: string, reason: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: analytic, error } = await supabase
      .from('performance_analytics')
      .update({
        is_degraded: true,
        degradation_reason: reason
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark degraded', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/performance-analytics-v2')
    return actionSuccess(analytic, 'Marked as degraded successfully')
  } catch (error: any) {
    logger.error('Unexpected error marking degraded', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
