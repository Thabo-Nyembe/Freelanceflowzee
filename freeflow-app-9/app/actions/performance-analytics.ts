'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createPerformanceAnalytic(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: analytic, error } = await supabase
    .from('performance_analytics')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/performance-analytics-v2')
  return analytic
}

export async function updatePerformanceAnalytic(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: analytic, error } = await supabase
    .from('performance_analytics')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/performance-analytics-v2')
  return analytic
}

export async function deletePerformanceAnalytic(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('performance_analytics')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/performance-analytics-v2')
}

export async function resolveAlert(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/performance-analytics-v2')
  return analytic
}

export async function markDegraded(id: string, reason: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/performance-analytics-v2')
  return analytic
}
