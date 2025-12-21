'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, type ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('milestones')

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

interface Milestone {
  id: string
  user_id: string
  milestone_code: string
  name: string
  description?: string
  type: string
  status: string
  priority: string
  due_date?: string
  days_remaining: number
  progress: number
  owner_name?: string
  owner_email?: string
  team_name?: string
  deliverables: number
  completed_deliverables?: number
  budget: number
  spent?: number
  currency: string
  dependencies: number
  stakeholders?: string[]
  tags?: string[]
  created_at: string
  updated_at: string
  deleted_at?: string
}

export async function createMilestone(input: CreateMilestoneInput): Promise<ActionResult<Milestone>> {
  try {
    if (!input.name || input.name.trim().length === 0) {
      return actionError('Milestone name is required', 400)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to create milestone', { error, userId: user.id })
      return actionError('Failed to create milestone', 500)
    }

    revalidatePath('/dashboard/milestones-v2')
    return actionSuccess(data, 'Milestone created successfully')
  } catch (error) {
    logger.error('Unexpected error creating milestone', { error })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function updateMilestone(id: string, input: UpdateMilestoneInput): Promise<ActionResult<Milestone>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid milestone ID format', 400)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
    }

    const { data, error } = await supabase
      .from('milestones')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update milestone', { error, milestoneId: id, userId: user.id })
      return actionError('Failed to update milestone', 500)
    }

    revalidatePath('/dashboard/milestones-v2')
    return actionSuccess(data, 'Milestone updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating milestone', { error, milestoneId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function updateMilestoneProgress(id: string, progress: number): Promise<ActionResult<Milestone>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid milestone ID format', 400)
    }

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return actionError('Progress must be a number between 0 and 100', 400)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to update milestone progress', { error, milestoneId: id, progress, userId: user.id })
      return actionError('Failed to update milestone progress', 500)
    }

    revalidatePath('/dashboard/milestones-v2')
    return actionSuccess(data, 'Milestone progress updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating milestone progress', { error, milestoneId: id, progress })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function markMilestoneAtRisk(id: string): Promise<ActionResult<Milestone>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid milestone ID format', 400)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
    }

    const { data, error } = await supabase
      .from('milestones')
      .update({ status: 'at-risk' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark milestone at risk', { error, milestoneId: id, userId: user.id })
      return actionError('Failed to mark milestone at risk', 500)
    }

    revalidatePath('/dashboard/milestones-v2')
    return actionSuccess(data, 'Milestone marked at risk')
  } catch (error) {
    logger.error('Unexpected error marking milestone at risk', { error, milestoneId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function completeMilestone(id: string): Promise<ActionResult<Milestone>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid milestone ID format', 400)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to complete milestone', { error, milestoneId: id, userId: user.id })
      return actionError('Failed to complete milestone', 500)
    }

    revalidatePath('/dashboard/milestones-v2')
    return actionSuccess(data, 'Milestone completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing milestone', { error, milestoneId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function deleteMilestone(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid milestone ID format', 400)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
    }

    const { error } = await supabase
      .from('milestones')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete milestone', { error, milestoneId: id, userId: user.id })
      return actionError('Failed to delete milestone', 500)
    }

    revalidatePath('/dashboard/milestones-v2')
    return actionSuccess({ success: true }, 'Milestone deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting milestone', { error, milestoneId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function getMilestones(filters?: {
  status?: string
  type?: string
  priority?: string
}): Promise<ActionResult<Milestone[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to fetch milestones', { error, userId: user.id, filters })
      return actionError('Failed to fetch milestones', 500)
    }

    return actionSuccess(data, 'Milestones fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching milestones', { error, filters })
    return actionError('An unexpected error occurred', 500)
  }
}
