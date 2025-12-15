'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createGrowthMetric(input: GrowthMetricInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/growth-hub-v2')
  return { data }
}

export async function updateGrowthMetric(id: string, updates: Partial<GrowthMetricInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get current metric to calculate growth rate
  const { data: currentMetric } = await supabase
    .from('growth_metrics')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentMetric) {
    return { error: 'Metric not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/growth-hub-v2')
  return { data }
}

export async function deleteGrowthMetric(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('growth_metrics')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/growth-hub-v2')
  return { success: true }
}

export async function recordValue(id: string, newValue: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentMetric } = await supabase
    .from('growth_metrics')
    .select('current_value')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentMetric) {
    return { error: 'Metric not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/growth-hub-v2')
  return { data }
}

export async function setAsGoal(id: string, targetValue: number, deadline?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/growth-hub-v2')
  return { data }
}

export async function getGrowthMetrics() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('growth_metrics')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}

export async function getGoals() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('growth_metrics')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_goal', true)
    .order('goal_deadline', { ascending: true })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
