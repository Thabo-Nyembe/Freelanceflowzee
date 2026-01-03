'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('investor-metrics-actions')

export interface InvestorMetricInput {
  metric_name: string
  category?: 'revenue' | 'growth' | 'efficiency' | 'engagement'
  current_value?: number
  previous_value?: number
  unit?: string
  description?: string
  period?: 'monthly' | 'quarterly' | 'yearly'
  quarter?: string
  year?: number
}

export async function createInvestorMetric(input: InvestorMetricInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const currentValue = input.current_value || 0
    const previousValue = input.previous_value || 0
    const changePercent = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0

    const { data, error } = await supabase
      .from('investor_metrics')
      .insert({
        user_id: user.id,
        metric_name: input.metric_name,
        category: input.category || 'revenue',
        current_value: currentValue,
        previous_value: previousValue,
        change_percent: changePercent,
        unit: input.unit || 'currency',
        description: input.description || null,
        period: input.period || 'quarterly',
        quarter: input.quarter || null,
        year: input.year || new Date().getFullYear()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create investor metric', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Investor metric created successfully', { metricId: data.id })
    revalidatePath('/dashboard/investor-metrics-v2')
    return actionSuccess(data, 'Investor metric created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating investor metric', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateInvestorMetric(id: string, updates: Partial<InvestorMetricInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: currentMetric } = await supabase
      .from('investor_metrics')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!currentMetric) {
      return actionError('Metric not found', 'NOT_FOUND')
    }

    const currentValue = updates.current_value ?? currentMetric.current_value
    const previousValue = updates.previous_value ?? currentMetric.previous_value
    const changePercent = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0

    const { data, error } = await supabase
      .from('investor_metrics')
      .update({
        ...updates,
        change_percent: changePercent,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update investor metric', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Investor metric updated successfully', { metricId: id })
    revalidatePath('/dashboard/investor-metrics-v2')
    return actionSuccess(data, 'Investor metric updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating investor metric', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteInvestorMetric(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('investor_metrics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete investor metric', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Investor metric deleted successfully', { metricId: id })
    revalidatePath('/dashboard/investor-metrics-v2')
    return actionSuccess({ success: true }, 'Investor metric deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting investor metric', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getInvestorMetrics(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('investor_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get investor metrics', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Investor metrics fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Investor metrics fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting investor metrics', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getMetricsByCategory(category: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('investor_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get metrics by category', { error: error.message, category })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Metrics by category fetched successfully', { category, count: data?.length || 0 })
    return actionSuccess(data || [], 'Metrics fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting metrics by category', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
