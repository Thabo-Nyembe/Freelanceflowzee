'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createDeployment(deploymentData: {
  deployment_name: string
  version: string
  environment: string
  branch?: string
  commit_hash?: string
  commit_message?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/deployments-v2')
  return deployment
}

export async function startDeployment(id: string, serverCount: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/deployments-v2')
  return deployment
}

export async function completeDeployment(id: string, success: boolean, healthCheckPassed?: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('deployments')
    .select('started_at, server_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Deployment not found')

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

  if (error) throw error

  revalidatePath('/dashboard/deployments-v2')
  return deployment
}

export async function rollbackDeployment(id: string, reason: string, rollbackToVersion: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/deployments-v2')
  return deployment
}

export async function updateDeploymentMetrics(id: string, metrics: {
  requestCount?: number
  errorCount?: number
  avgResponseTime?: number
  cpuUsage?: number
  memoryUsage?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/deployments-v2')
  return deployment
}

export async function approveDeployment(id: string, approverName: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/deployments-v2')
  return deployment
}
