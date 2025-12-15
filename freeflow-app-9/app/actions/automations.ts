'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { AutomationWorkflow } from '@/lib/hooks/use-automations'

export async function createWorkflow(data: Partial<AutomationWorkflow>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: workflow, error } = await supabase
    .from('automations')
    .insert([{ ...data, user_id: user.id, created_by: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/automations-v2')
  return workflow
}

export async function updateWorkflow(id: string, data: Partial<AutomationWorkflow>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: workflow, error } = await supabase
    .from('automations')
    .update({ ...data, updated_by: user.id })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/automations-v2')
  return workflow
}

export async function deleteWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('automations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/automations-v2')
  return { success: true }
}

export async function publishWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get current version
  const { data: currentWorkflow } = await supabase
    .from('automations')
    .select('version')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentWorkflow) throw new Error('Workflow not found')

  const { data: workflow, error } = await supabase
    .from('automations')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      published_version: currentWorkflow.version,
      status: 'active',
      updated_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/automations-v2')
  return workflow
}

export async function executeWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const startTime = Date.now()

  const { data: workflow, error } = await supabase
    .from('automations')
    .update({
      is_running: true,
      status: 'running',
      last_execution_at: new Date().toISOString(),
      total_executions: supabase.raw('total_executions + 1'),
      updated_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  // Simulate workflow execution (in real app, this would execute the steps)
  const executionTime = Math.floor((Date.now() - startTime) / 1000)

  // Update with completion status
  const { data: completedWorkflow, error: updateError } = await supabase
    .from('automations')
    .update({
      is_running: false,
      status: 'active',
      last_execution_status: 'completed',
      successful_executions: supabase.raw('successful_executions + 1'),
      total_duration_seconds: supabase.raw(`total_duration_seconds + ${executionTime}`),
      avg_duration_seconds: supabase.raw(`(total_duration_seconds + ${executionTime}) / total_executions`)
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) throw updateError

  revalidatePath('/dashboard/automations-v2')
  return completedWorkflow
}

export async function toggleWorkflow(id: string, enabled: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: workflow, error } = await supabase
    .from('automations')
    .update({
      is_enabled: enabled,
      status: enabled ? 'active' : 'paused',
      updated_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/automations-v2')
  return workflow
}

export async function approveWorkflow(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: workflow, error } = await supabase
    .from('automations')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: user.id
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/automations-v2')
  return workflow
}
