'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createDependency(data: {
  dependency_name: string
  predecessor_task: string
  successor_task: string
  dependency_type?: string
  impact_level?: string
  owner?: string
  team?: string
  due_date?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: dependency, error } = await supabase
    .from('dependencies')
    .insert({
      user_id: user.id,
      ...data
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/dependencies-v2')
  return dependency
}

export async function updateDependencyStatus(id: string, status: string, resolution?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = { status }

  if (status === 'resolved') {
    updateData.resolution_date = new Date().toISOString()
    updateData.days_remaining = 0
  }

  if (resolution) {
    updateData.resolution = resolution
  }

  const { data: dependency, error } = await supabase
    .from('dependencies')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/dependencies-v2')
  return dependency
}

export async function updateDependencyProgress(id: string, predecessorProgress: number, successorProgress: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const overallProgress = (predecessorProgress + successorProgress) / 2

  const { data: dependency, error } = await supabase
    .from('dependencies')
    .update({
      predecessor_progress: predecessorProgress,
      successor_progress: successorProgress,
      overall_progress: overallProgress
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/dependencies-v2')
  return dependency
}

export async function markAsCriticalPath(id: string, isCritical: boolean, order?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = { is_on_critical_path: isCritical }

  if (isCritical && order !== undefined) {
    updateData.critical_path_order = order
  }

  const { data: dependency, error } = await supabase
    .from('dependencies')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/dependencies-v2')
  return dependency
}

export async function updateBlockedStatus(id: string, isBlocked: boolean, blockerReason?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('dependencies')
    .select('blocked_days')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const updateData: any = {
    status: isBlocked ? 'blocked' : 'active'
  }

  if (isBlocked) {
    updateData.blocker_reason = blockerReason
    updateData.blocked_days = (current?.blocked_days || 0) + 1
  }

  const { data: dependency, error } = await supabase
    .from('dependencies')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/dependencies-v2')
  return dependency
}

export async function calculateRiskScore(id: string, estimatedDelayDays: number, affectedTasks: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Risk score calculation: delay impact * task count / 10
  const riskScore = parseFloat(((estimatedDelayDays * affectedTasks) / 10).toFixed(2))

  const { data: dependency, error } = await supabase
    .from('dependencies')
    .update({
      estimated_delay_days: estimatedDelayDays,
      affected_tasks: affectedTasks,
      risk_score: riskScore
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/dependencies-v2')
  return dependency
}
