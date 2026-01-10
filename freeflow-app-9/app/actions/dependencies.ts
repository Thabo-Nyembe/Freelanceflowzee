'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('dependencies-actions')

export async function createDependency(data: {
  dependency_name: string
  predecessor_task: string
  successor_task: string
  dependency_type?: string
  impact_level?: string
  owner?: string
  team?: string
  due_date?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: dependency, error } = await supabase
      .from('dependencies')
      .insert({
        user_id: user.id,
        ...data
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create dependency', { error: error.message, data })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/dependencies-v2')
    logger.info('Dependency created successfully', { dependencyId: dependency.id })
    return actionSuccess(dependency, 'Dependency created successfully')
  } catch (error) {
    logger.error('Unexpected error creating dependency', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateDependencyStatus(id: string, status: string, resolution?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to update dependency status', { error: error.message, id, status })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/dependencies-v2')
    logger.info('Dependency status updated successfully', { dependencyId: id, status })
    return actionSuccess(dependency, 'Dependency status updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating dependency status', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateDependencyProgress(id: string, predecessorProgress: number, successorProgress: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to update dependency progress', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/dependencies-v2')
    logger.info('Dependency progress updated successfully', { dependencyId: id, overallProgress })
    return actionSuccess(dependency, 'Dependency progress updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating dependency progress', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markAsCriticalPath(id: string, isCritical: boolean, order?: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to mark dependency as critical path', { error: error.message, id, isCritical })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/dependencies-v2')
    logger.info('Dependency critical path updated successfully', { dependencyId: id, isCritical })
    return actionSuccess(dependency, 'Dependency critical path updated successfully')
  } catch (error) {
    logger.error('Unexpected error marking dependency as critical path', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateBlockedStatus(id: string, isBlocked: boolean, blockerReason?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to update blocked status', { error: error.message, id, isBlocked })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/dependencies-v2')
    logger.info('Dependency blocked status updated successfully', { dependencyId: id, isBlocked })
    return actionSuccess(dependency, 'Dependency blocked status updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating blocked status', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function calculateRiskScore(id: string, estimatedDelayDays: number, affectedTasks: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to calculate risk score', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/dependencies-v2')
    logger.info('Dependency risk score calculated successfully', { dependencyId: id, riskScore })
    return actionSuccess(dependency, 'Dependency risk score calculated successfully')
  } catch (error) {
    logger.error('Unexpected error calculating risk score', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
