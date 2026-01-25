'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useCallback, useState } from 'react'

export type DeploymentEnvironment = 'production' | 'staging' | 'development' | 'testing' | 'qa' | 'sandbox' | 'preview'
export type DeploymentStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back' | 'cancelled' | 'skipped'
export type DeploymentType = 'full' | 'incremental' | 'rollback' | 'hotfix' | 'canary' | 'blue_green' | 'rolling'
export type DeploymentStrategy = 'standard' | 'blue_green' | 'canary' | 'rolling' | 'recreate' | 'custom'

export interface Deployment {
  id: string
  user_id: string
  deployment_name: string
  version: string

  environment: DeploymentEnvironment
  status: DeploymentStatus
  deployment_state?: string

  branch?: string
  commit_hash?: string
  commit_message?: string
  commit_author?: string
  repository_url?: string

  deploy_type?: DeploymentType
  deployment_strategy?: DeploymentStrategy

  scheduled_at?: string
  started_at?: string
  completed_at?: string
  duration_seconds: number

  deployed_by_id?: string
  deployed_by_name?: string
  deployed_by_email?: string

  server_count: number
  healthy_servers: number
  unhealthy_servers: number
  traffic_percentage: number
  target_instances?: number
  active_instances: number

  build_id?: string
  build_number?: number
  build_url?: string
  artifact_url?: string
  docker_image?: string
  docker_tag?: string

  health_check_passed?: boolean
  health_check_url?: string
  health_check_count: number
  last_health_check_at?: string

  rollback_to_version?: string
  rollback_reason?: string
  can_rollback: boolean
  auto_rollback_enabled: boolean

  error_message?: string
  error_code?: string
  error_logs?: string
  failed_steps?: string[]

  request_count: number
  error_count: number
  error_rate: number
  avg_response_time_ms?: number

  send_notifications: boolean
  notification_channels?: string[]
  notifications_sent: boolean

  requires_approval: boolean
  approved_by_id?: string
  approved_by_name?: string
  approved_at?: string

  tags?: string[]
  metadata?: any
  notes?: string

  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface CreateDeploymentInput {
  deployment_name: string
  version: string
  environment?: DeploymentEnvironment
  branch?: string
  commit_hash?: string
  commit_message?: string
  commit_author?: string
  deploy_type?: DeploymentType
  notes?: string
  tags?: string[]
}

export interface UpdateDeploymentInput {
  id: string
  deployment_name?: string
  version?: string
  environment?: DeploymentEnvironment
  status?: DeploymentStatus
  branch?: string
  commit_hash?: string
  commit_message?: string
  commit_author?: string
  deploy_type?: DeploymentType
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  error_message?: string
  can_rollback?: boolean
  notes?: string
  tags?: string[]
}

export interface UseDeploymentsOptions {
  environment?: DeploymentEnvironment | 'all'
  status?: DeploymentStatus | 'all'
  limit?: number
}

export function useDeployments(options: UseDeploymentsOptions = {}) {
  const { environment, status, limit } = options
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationError, setMutationError] = useState<Error | null>(null)

  const filters: Record<string, any> = {}
  if (environment && environment !== 'all') filters.environment = environment
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'deployments',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true,
    softDelete: false
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Deployment>(queryOptions)

  const { create, update, remove } = useSupabaseMutation({
    table: 'deployments',
    onSuccess: () => {
      refetch()
    },
    onError: (err) => {
      setMutationError(err)
    }
  })

  // Create a new deployment
  const createDeployment = useCallback(async (input: CreateDeploymentInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const deploymentData = {
        deployment_name: input.deployment_name,
        version: input.version,
        environment: input.environment || 'development',
        status: 'pending' as DeploymentStatus,
        branch: input.branch || null,
        commit_hash: input.commit_hash || null,
        commit_message: input.commit_message || null,
        commit_author: input.commit_author || null,
        deploy_type: input.deploy_type || 'full',
        notes: input.notes || null,
        tags: input.tags || [],
        duration_seconds: 0,
        server_count: 0,
        healthy_servers: 0,
        unhealthy_servers: 0,
        traffic_percentage: 0,
        active_instances: 0,
        health_check_count: 0,
        can_rollback: true,
        auto_rollback_enabled: false,
        request_count: 0,
        error_count: 0,
        error_rate: 0,
        send_notifications: true,
        notifications_sent: false,
        requires_approval: false,
        metadata: {}
      }
      const result = await create(deploymentData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create deployment')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [create])

  // Update an existing deployment
  const updateDeployment = useCallback(async (input: UpdateDeploymentInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const { id, ...updateData } = input
      const result = await update(id, updateData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update deployment')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [update])

  // Delete a deployment
  const deleteDeployment = useCallback(async (id: string) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      await remove(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete deployment')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [remove])

  // Start a deployment (update status to in_progress)
  const startDeployment = useCallback(async (id: string) => {
    return updateDeployment({
      id,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
  }, [updateDeployment])

  // Complete a deployment
  const completeDeployment = useCallback(async (id: string, success: boolean, startedAt?: string) => {
    const startTime = startedAt ? new Date(startedAt).getTime() : Date.now()
    const duration = Math.floor((Date.now() - startTime) / 1000)

    return updateDeployment({
      id,
      status: success ? 'success' : 'failed',
      completed_at: new Date().toISOString(),
      duration_seconds: duration
    })
  }, [updateDeployment])

  // Rollback a deployment
  const rollbackDeployment = useCallback(async (id: string) => {
    return updateDeployment({
      id,
      status: 'rolled_back'
    })
  }, [updateDeployment])

  // Cancel a deployment
  const cancelDeployment = useCallback(async (id: string) => {
    return updateDeployment({
      id,
      status: 'cancelled'
    })
  }, [updateDeployment])

  return {
    data,
    deployments: data,
    isLoading: loading,
    loading,
    error,
    refetch,
    mutationLoading,
    mutationError,
    createDeployment,
    updateDeployment,
    deleteDeployment,
    startDeployment,
    completeDeployment,
    rollbackDeployment,
    cancelDeployment
  }
}

// Standalone mutation hooks for compatibility
export function useCreateDeployment() {
  const { create } = useSupabaseMutation<Deployment>({ table: 'deployments' })

  const mutateAsync = async (data: Partial<Deployment>) => {
    return create(data)
  }

  return { mutateAsync, mutate: mutateAsync }
}

export function useUpdateDeployment() {
  const { update } = useSupabaseMutation<Deployment>({ table: 'deployments' })

  const mutateAsync = async (data: { id: string } & Partial<Deployment>) => {
    const { id, ...updateData } = data
    return update(id, updateData)
  }

  return { mutateAsync, mutate: mutateAsync }
}

export function useDeleteDeployment() {
  const { remove } = useSupabaseMutation<Deployment>({ table: 'deployments' })

  const mutateAsync = async (id: string) => {
    return remove(id)
  }

  return { mutateAsync, mutate: mutateAsync }
}
