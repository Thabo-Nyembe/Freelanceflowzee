'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createInsight(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: insight, error } = await supabase
    .from('system_insights')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/system-insights-v2')
  return insight
}

export async function updateInsight(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: insight, error } = await supabase
    .from('system_insights')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/system-insights-v2')
  return insight
}

export async function deleteInsight(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('system_insights')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/system-insights-v2')
}

export async function acknowledgeInsight(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/system-insights-v2')
  return insight
}

export async function resolveInsight(id: string, actionTaken?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error
  revalidatePath('/dashboard/system-insights-v2')
  return insight
}

export async function dismissInsight(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: insight, error } = await supabase
    .from('system_insights')
    .update({ status: 'dismissed' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/system-insights-v2')
  return insight
}
