'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('features-actions')

export async function createFeature(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feature, error } = await supabase
      .from('features')
      .insert({
        ...data,
        user_id: user.id,
        created_by: user.email || 'Unknown'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create feature', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('Feature created successfully', { featureId: feature.id })
    return actionSuccess(feature, 'Feature created successfully')
  } catch (error) {
    logger.error('Unexpected error creating feature', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateFeature(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feature, error } = await supabase
      .from('features')
      .update({
        ...data,
        updated_by: user.email || 'Unknown',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update feature', { error, featureId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('Feature updated successfully', { featureId: id })
    return actionSuccess(feature, 'Feature updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating feature', { error, featureId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteFeature(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feature, error } = await supabase
      .from('features')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to delete feature', { error, featureId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('Feature deleted successfully', { featureId: id })
    return actionSuccess(feature, 'Feature deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting feature', { error, featureId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function enableFeature(id: string, environment?: 'production' | 'staging' | 'development'): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const updates: any = {
      status: 'enabled',
      is_enabled: true,
      enabled_at: new Date().toISOString(),
      updated_by: user.email || 'Unknown'
    }

    if (environment) {
      updates[`${environment}_enabled`] = true
    }

    const { data: feature, error } = await supabase
      .from('features')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to enable feature', { error, featureId: id, environment })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('Feature enabled successfully', { featureId: id, environment })
    return actionSuccess(feature, 'Feature enabled successfully')
  } catch (error) {
    logger.error('Unexpected error enabling feature', { error, featureId: id, environment })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function disableFeature(id: string, environment?: 'production' | 'staging' | 'development'): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const updates: any = {
      status: 'disabled',
      is_enabled: false,
      disabled_at: new Date().toISOString(),
      updated_by: user.email || 'Unknown'
    }

    if (environment) {
      updates[`${environment}_enabled`] = false
    }

    const { data: feature, error } = await supabase
      .from('features')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to disable feature', { error, featureId: id, environment })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('Feature disabled successfully', { featureId: id, environment })
    return actionSuccess(feature, 'Feature disabled successfully')
  } catch (error) {
    logger.error('Unexpected error disabling feature', { error, featureId: id, environment })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateRollout(id: string, percentage: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feature, error } = await supabase
      .from('features')
      .update({
        rollout_percentage: percentage,
        rollout_type: percentage === 100 ? 'full' : percentage === 0 ? 'off' : 'percentage',
        status: percentage > 0 && percentage < 100 ? 'rollout' : percentage === 100 ? 'enabled' : 'disabled',
        updated_by: user.email || 'Unknown'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update rollout', { error, featureId: id, percentage })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('Rollout updated successfully', { featureId: id, percentage })
    return actionSuccess(feature, 'Rollout updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating rollout', { error, featureId: id, percentage })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startABTest(id: string, variants: any, trafficSplit: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feature, error } = await supabase
      .from('features')
      .update({
        is_ab_test: true,
        ab_test_variants: variants,
        ab_test_traffic: trafficSplit,
        status: 'testing',
        updated_by: user.email || 'Unknown'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start A/B test', { error, featureId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('A/B test started successfully', { featureId: id })
    return actionSuccess(feature, 'A/B test started successfully')
  } catch (error) {
    logger.error('Unexpected error starting A/B test', { error, featureId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rollbackFeature(id: string, reason: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feature, error } = await supabase
      .from('features')
      .update({
        status: 'disabled',
        is_enabled: false,
        last_rollback_at: new Date().toISOString(),
        rollback_reason: reason,
        updated_by: user.email || 'Unknown'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rollback feature', { error, featureId: id, reason })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('Feature rolled back successfully', { featureId: id, reason })
    return actionSuccess(feature, 'Feature rolled back successfully')
  } catch (error) {
    logger.error('Unexpected error rolling back feature', { error, featureId: id, reason })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateFeatureMetrics(id: string, success: boolean, responseTime: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // First get current metrics
    const { data: current } = await supabase
      .from('features')
      .select('total_requests, successful_requests, failed_requests, avg_response_time_ms')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.error('Feature not found for metrics update', { featureId: id })
      return actionError('Feature not found', 'DATABASE_ERROR')
    }

    const totalRequests = current.total_requests + 1
    const successfulRequests = current.successful_requests + (success ? 1 : 0)
    const failedRequests = current.failed_requests + (success ? 0 : 1)
    const avgResponseTime = Math.round(
      ((current.avg_response_time_ms * current.total_requests) + responseTime) / totalRequests
    )
    const successRate = parseFloat(((successfulRequests / totalRequests) * 100).toFixed(2))

    const { data: feature, error } = await supabase
      .from('features')
      .update({
        total_requests: totalRequests,
        successful_requests: successfulRequests,
        failed_requests: failedRequests,
        avg_response_time_ms: avgResponseTime,
        success_rate: successRate
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update feature metrics', { error, featureId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/features-v2')
    logger.info('Feature metrics updated successfully', { featureId: id, successRate })
    return actionSuccess(feature, 'Feature metrics updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating feature metrics', { error, featureId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
