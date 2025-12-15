'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CreateMilestoneInput {
  name: string
  description?: string
  type?: string
  priority?: string
  due_date?: string
  owner_name?: string
  owner_email?: string
  team_name?: string
  deliverables?: number
  budget?: number
  currency?: string
  dependencies?: number
  stakeholders?: string[]
  tags?: string[]
}

export interface UpdateMilestoneInput {
  name?: string
  description?: string
  type?: string
  status?: string
  priority?: string
  due_date?: string
  days_remaining?: number
  progress?: number
  owner_name?: string
  owner_email?: string
  team_name?: string
  deliverables?: number
  completed_deliverables?: number
  budget?: number
  spent?: number
  dependencies?: number
  stakeholders?: string[]
  tags?: string[]
}

export async function createMilestone(input: CreateMilestoneInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const milestoneCode = `MLS-${Date.now().toString(36).toUpperCase()}`

  let daysRemaining = 0
  if (input.due_date) {
    const due = new Date(input.due_date)
    const now = new Date()
    daysRemaining = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const { data, error } = await supabase
    .from('milestones')
    .insert({
      user_id: user.id,
      milestone_code: milestoneCode,
      name: input.name,
      description: input.description,
      type: input.type || 'project',
      status: 'upcoming',
      priority: input.priority || 'medium',
      due_date: input.due_date,
      days_remaining: daysRemaining,
      owner_name: input.owner_name,
      owner_email: input.owner_email,
      team_name: input.team_name,
      deliverables: input.deliverables || 0,
      budget: input.budget || 0,
      currency: input.currency || 'USD',
      dependencies: input.dependencies || 0,
      stakeholders: input.stakeholders || [],
      tags: input.tags || []
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/milestones-v2')
  return { data }
}

export async function updateMilestone(id: string, input: UpdateMilestoneInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('milestones')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/milestones-v2')
  return { data }
}

export async function updateMilestoneProgress(id: string, progress: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  let status = 'in-progress'
  if (progress >= 100) status = 'completed'

  const { data, error } = await supabase
    .from('milestones')
    .update({ progress, status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/milestones-v2')
  return { data }
}

export async function markMilestoneAtRisk(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('milestones')
    .update({ status: 'at-risk' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/milestones-v2')
  return { data }
}

export async function completeMilestone(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('milestones')
    .update({
      status: 'completed',
      progress: 100,
      days_remaining: 0
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/milestones-v2')
  return { data }
}

export async function deleteMilestone(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('milestones')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/milestones-v2')
  return { success: true }
}

export async function getMilestones(filters?: {
  status?: string
  type?: string
  priority?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('milestones')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('due_date', { ascending: true })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return { error: error.message }
  }

  return { data }
}
