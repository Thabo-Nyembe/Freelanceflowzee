'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('growth-metrics-actions')

export interface GrowthMetricInput {
  metric_name: string
  metric_type?: 'revenue' | 'users' | 'conversion' | 'engagement' | 'retention' | 'custom'
  current_value?: number
  previous_value?: number
  target_value?: number
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  unit?: string
  is_goal?: boolean
  goal_deadline?: string
  notes?: string
}

export async function createGrowthMetric(input: GrowthMetricInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const currentValue = input.current_value || 0
    const previousValue = input.previous_value || 0
    const growthRate = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0

    const { data, error } = await supabase
      .from('growth_metrics')
      .insert({
        user_id: user.id,
        metric_name: input.metric_name,
        metric_type: input.metric_type || 'custom',
        current_value: currentValue,
        previous_value: previousValue,
        target_value: input.target_value || null,
        growth_rate: growthRate,
        period: input.period || 'monthly',
        unit: input.unit || 'count',
        is_goal: input.is_goal || false,
        goal_deadline: input.goal_deadline || null,
        notes: input.notes || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create growth metric', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Growth metric created successfully', { metricId: data.id })
    revalidatePath('/dashboard/growth-hub-v2')
    return actionSuccess(data, 'Growth metric created successfully')
  } catch (error) {
    logger.error('Unexpected error creating growth metric', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateGrowthMetric(id: string, updates: Partial<GrowthMetricInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current metric to calculate growth rate
    const { data: currentMetric } = await supabase
      .from('growth_metrics')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!currentMetric) {
      return actionError('Metric not found', 'NOT_FOUND')
    }

    const currentValue = updates.current_value ?? currentMetric.current_value
    const previousValue = updates.previous_value ?? currentMetric.previous_value
    const growthRate = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0

    const { data, error } = await supabase
      .from('growth_metrics')
      .update({
        ...updates,
        growth_rate: growthRate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update growth metric', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Growth metric updated successfully', { metricId: id })
    revalidatePath('/dashboard/growth-hub-v2')
    return actionSuccess(data, 'Growth metric updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating growth metric', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteGrowthMetric(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('growth_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete growth metric', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Growth metric deleted successfully', { metricId: id })
    revalidatePath('/dashboard/growth-hub-v2')
    return actionSuccess({ success: true }, 'Growth metric deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting growth metric', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordValue(id: string, newValue: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: currentMetric } = await supabase
      .from('growth_metrics')
      .select('current_value')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!currentMetric) {
      return actionError('Metric not found', 'NOT_FOUND')
    }

    const previousValue = currentMetric.current_value
    const growthRate = previousValue > 0
      ? ((newValue - previousValue) / previousValue) * 100
      : 0

    const { data, error } = await supabase
      .from('growth_metrics')
      .update({
        previous_value: previousValue,
        current_value: newValue,
        growth_rate: growthRate,
        recorded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record value', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Value recorded successfully', { metricId: id, newValue })
    revalidatePath('/dashboard/growth-hub-v2')
    return actionSuccess(data, 'Value recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording value', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function setAsGoal(id: string, targetValue: number, deadline?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('growth_metrics')
      .update({
        is_goal: true,
        target_value: targetValue,
        goal_deadline: deadline || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to set as goal', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Metric set as goal successfully', { metricId: id })
    revalidatePath('/dashboard/growth-hub-v2')
    return actionSuccess(data, 'Metric set as goal successfully')
  } catch (error) {
    logger.error('Unexpected error setting metric as goal', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getGrowthMetrics(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('growth_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get growth metrics', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Growth metrics fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Growth metrics fetched successfully')
  } catch (error) {
    logger.error('Unexpected error getting growth metrics', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getGoals(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('growth_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_goal', true)
      .order('goal_deadline', { ascending: true })

    if (error) {
      logger.error('Failed to get goals', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Goals fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Goals fetched successfully')
  } catch (error) {
    logger.error('Unexpected error getting goals', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
