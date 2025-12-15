'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createInvestorMetric(input: InvestorMetricInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/investor-metrics-v2')
  return { data }
}

export async function updateInvestorMetric(id: string, updates: Partial<InvestorMetricInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: currentMetric } = await supabase
    .from('investor_metrics')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentMetric) {
    return { error: 'Metric not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/investor-metrics-v2')
  return { data }
}

export async function deleteInvestorMetric(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('investor_metrics')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/investor-metrics-v2')
  return { success: true }
}

export async function getInvestorMetrics() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('investor_metrics')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}

export async function getMetricsByCategory(category: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('investor_metrics')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
