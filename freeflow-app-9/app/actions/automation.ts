'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Automation } from '@/lib/hooks/use-automation'

export async function createAutomation(data: Partial<Automation>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: automation, error } = await supabase
    .from('automation')
    .insert([{ ...data, user_id: user.id, created_by: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/automation-v2')
  return automation
}

export async function updateAutomation(id: string, data: Partial<Automation>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: automation, error } = await supabase
    .from('automation')
    .update({ ...data, updated_by: user.id })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/automation-v2')
  return automation
}

export async function deleteAutomation(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('automation')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/automation-v2')
  return { success: true }
}

export async function toggleAutomation(id: string, enabled: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: automation, error } = await supabase
    .from('automation')
    .update({
      is_enabled: enabled,
      status: enabled ? 'active' : 'inactive',
      updated_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/automation-v2')
  return automation
}

export async function runAutomation(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const startTime = Date.now()

  const { data: automation, error } = await supabase
    .from('automation')
    .update({
      is_running: true,
      status: 'running',
      last_run_at: new Date().toISOString(),
      run_count: supabase.raw('run_count + 1'),
      updated_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  // Simulate automation execution (in real app, this would trigger actual automation logic)
  const executionTime = Date.now() - startTime

  // Update with completion status
  const { data: completedAutomation, error: updateError } = await supabase
    .from('automation')
    .update({
      is_running: false,
      status: 'active',
      last_success_at: new Date().toISOString(),
      success_count: supabase.raw('success_count + 1'),
      total_execution_time_ms: supabase.raw(`total_execution_time_ms + ${executionTime}`),
      avg_execution_time_ms: supabase.raw(`(total_execution_time_ms + ${executionTime}) / run_count`)
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) throw updateError

  revalidatePath('/dashboard/automation-v2')
  return completedAutomation
}
