'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('deployments-actions')

export async function createDeployment(deploymentData: {
  deployment_name: string
  version: string
  environment: string
  branch?: string
  commit_hash?: string
  commit_message?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: deployment, error } = await supabase
      .from('deployments')
      .insert({
        user_id: user.id,
        deployed_by_id: user.id,
        status: 'pending',
        ...deploymentData
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create deployment', { error: error.message, deploymentData })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/deployments-v2')
    logger.info('Deployment created successfully', { deploymentId: deployment.id })
    return actionSuccess(deployment, 'Deployment created successfully')
  } catch (error) {
    logger.error('Unexpected error creating deployment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startDeployment(id: string, serverCount: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: deployment, error } = await supabase
      .from('deployments')
      .update({
        status: 'in_progress',
        deployment_state: 'deploying',
        started_at: new Date().toISOString(),
        server_count: serverCount,
        target_instances: serverCount
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start deployment', { error: error.message, id, serverCount })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/deployments-v2')
    logger.info('Deployment started successfully', { deploymentId: id, serverCount })
    return actionSuccess(deployment, 'Deployment started successfully')
  } catch (error) {
    logger.error('Unexpected error starting deployment', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeDeployment(id: string, success: boolean, healthCheckPassed?: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('deployments')
      .select('started_at, server_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.error('Deployment not found', { id })
      return actionError('Deployment not found', 'DATABASE_ERROR')
    }

    const completedAt = new Date()
    const startedAt = new Date(current.started_at)
    const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000)

    const { data: deployment, error } = await supabase
      .from('deployments')
      .update({
        status: success ? 'success' : 'failed',
        deployment_state: success ? 'completed' : 'failed',
        completed_at: completedAt.toISOString(),
        duration_seconds: durationSeconds,
        healthy_servers: success ? current.server_count : 0,
        unhealthy_servers: success ? 0 : current.server_count,
        active_instances: success ? current.server_count : 0,
        health_check_passed: healthCheckPassed,
        traffic_percentage: success ? 100 : 0
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete deployment', { error: error.message, id, success })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/deployments-v2')
    logger.info('Deployment completed successfully', { deploymentId: id, success })
    return actionSuccess(deployment, 'Deployment completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing deployment', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rollbackDeployment(id: string, reason: string, rollbackToVersion: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: deployment, error } = await supabase
      .from('deployments')
      .update({
        status: 'rolled_back',
        rollback_reason: reason,
        rollback_to_version: rollbackToVersion,
        traffic_percentage: 0
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rollback deployment', { error: error.message, id, reason })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/deployments-v2')
    logger.info('Deployment rolled back successfully', { deploymentId: id, rollbackToVersion })
    return actionSuccess(deployment, 'Deployment rolled back successfully')
  } catch (error) {
    logger.error('Unexpected error rolling back deployment', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateDeploymentMetrics(id: string, metrics: {
  requestCount?: number
  errorCount?: number
  avgResponseTime?: number
  cpuUsage?: number
  memoryUsage?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const updateData: any = {}

    if (metrics.requestCount !== undefined) {
      updateData.request_count = metrics.requestCount
    }

    if (metrics.errorCount !== undefined) {
      updateData.error_count = metrics.errorCount
    }

    if (metrics.avgResponseTime !== undefined) {
      updateData.avg_response_time_ms = parseFloat(metrics.avgResponseTime.toFixed(2))
    }

    if (metrics.cpuUsage !== undefined) {
      updateData.cpu_usage_percentage = parseFloat(metrics.cpuUsage.toFixed(2))
    }

    if (metrics.memoryUsage !== undefined) {
      updateData.memory_usage_percentage = parseFloat(metrics.memoryUsage.toFixed(2))
    }

    // Calculate error rate
    if (metrics.requestCount && metrics.errorCount !== undefined) {
      updateData.error_rate = parseFloat(((metrics.errorCount / metrics.requestCount) * 100).toFixed(2))
    }

    const { data: deployment, error } = await supabase
      .from('deployments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update deployment metrics', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/deployments-v2')
    logger.info('Deployment metrics updated successfully', { deploymentId: id })
    return actionSuccess(deployment, 'Deployment metrics updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating deployment metrics', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function approveDeployment(id: string, approverName: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: deployment, error } = await supabase
      .from('deployments')
      .update({
        approved_by_id: user.id,
        approved_by_name: approverName,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to approve deployment', { error: error.message, id, approverName })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/deployments-v2')
    logger.info('Deployment approved successfully', { deploymentId: id, approverName })
    return actionSuccess(deployment, 'Deployment approved successfully')
  } catch (error) {
    logger.error('Unexpected error approving deployment', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
