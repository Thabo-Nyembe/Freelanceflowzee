'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createFeature(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: feature, error } = await supabase
    .from('features')
    .insert({
      ...data,
      user_id: user.id,
      created_by: user.email || 'Unknown'
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}

export async function updateFeature(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}

export async function deleteFeature(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: feature, error } = await supabase
    .from('features')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}

export async function enableFeature(id: string, environment?: 'production' | 'staging' | 'development') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}

export async function disableFeature(id: string, environment?: 'production' | 'staging' | 'development') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}

export async function updateRollout(id: string, percentage: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}

export async function startABTest(id: string, variants: any, trafficSplit: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}

export async function rollbackFeature(id: string, reason: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}

export async function updateFeatureMetrics(id: string, success: boolean, responseTime: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // First get current metrics
  const { data: current } = await supabase
    .from('features')
    .select('total_requests, successful_requests, failed_requests, avg_response_time_ms')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Feature not found')

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

  if (error) throw error
  revalidatePath('/dashboard/features-v2')
  return feature
}
