'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('system-insights-actions')

export async function createInsight(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: insight, error } = await supabase
      .from('system_insights')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create insight', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/system-insights-v2')
    logger.info('Insight created', { insightId: insight.id })
    return actionSuccess(insight, 'Insight created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating insight', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateInsight(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: insight, error } = await supabase
      .from('system_insights')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update insight', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/system-insights-v2')
    logger.info('Insight updated', { insightId: id })
    return actionSuccess(insight, 'Insight updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating insight', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteInsight(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('system_insights')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete insight', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/system-insights-v2')
    logger.info('Insight deleted', { insightId: id })
    return actionSuccess({ success: true }, 'Insight deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting insight', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function acknowledgeInsight(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: insight, error } = await supabase
      .from('system_insights')
      .update({
        status: 'acknowledged',
        acknowledged_by: user.id,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to acknowledge insight', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/system-insights-v2')
    logger.info('Insight acknowledged', { insightId: id })
    return actionSuccess(insight, 'Insight acknowledged successfully')
  } catch (error: any) {
    logger.error('Unexpected error acknowledging insight', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resolveInsight(id: string, actionTaken?: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: insight, error } = await supabase
      .from('system_insights')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        action_taken: actionTaken,
        action_taken_at: new Date().toISOString(),
        action_taken_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resolve insight', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/system-insights-v2')
    logger.info('Insight resolved', { insightId: id })
    return actionSuccess(insight, 'Insight resolved successfully')
  } catch (error: any) {
    logger.error('Unexpected error resolving insight', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function dismissInsight(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: insight, error } = await supabase
      .from('system_insights')
      .update({ status: 'dismissed' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to dismiss insight', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/system-insights-v2')
    logger.info('Insight dismissed', { insightId: id })
    return actionSuccess(insight, 'Insight dismissed successfully')
  } catch (error: any) {
    logger.error('Unexpected error dismissing insight', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
