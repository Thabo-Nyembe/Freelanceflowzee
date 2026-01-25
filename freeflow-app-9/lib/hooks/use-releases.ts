'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useState } from 'react'

// Types
export type ReleaseStatus = 'draft' | 'scheduled' | 'rolling' | 'deployed' | 'failed' | 'rolled_back'
export type ReleaseType = 'major' | 'minor' | 'patch' | 'hotfix' | 'prerelease'
export type Environment = 'development' | 'staging' | 'production' | 'canary'
export type DeploymentStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled' | 'rolled_back'

export interface Release {
  id: string
  user_id: string
  version: string
  release_name: string
  description: string | null
  status: ReleaseStatus
  release_type: ReleaseType
  environment: Environment
  deployed_at: string | null
  scheduled_for: string | null
  deploy_time_minutes: number | null
  commits_count: number
  contributors_count: number
  coverage_percentage: number
  rollback_rate: number
  changelog: string | null
  breaking_changes: string[]
  git_branch: string | null
  git_tag: string | null
  build_number: string | null
  is_prerelease: boolean
  is_draft: boolean
  is_latest: boolean
  downloads_count: number
  views_count: number
  additions_count: number
  deletions_count: number
  files_changed: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Deployment {
  id: string
  release_id: string
  user_id: string
  environment: string
  status: DeploymentStatus
  started_at: string | null
  completed_at: string | null
  duration_minutes: number | null
  servers_count: number
  health_percentage: number
  logs: string | null
  error_message: string | null
  deployed_by: string | null
  created_at: string
}

export interface Rollback {
  id: string
  user_id: string
  release_id: string
  release_version: string
  target_version: string
  reason: string
  status: 'completed' | 'failed' | 'in_progress'
  started_at: string
  completed_at: string | null
  initiated_by: string | null
  created_at: string
}

// Hook Options
export interface UseReleasesOptions {
  status?: ReleaseStatus | 'all'
  environment?: Environment | 'all'
  limit?: number
}

export interface CreateReleaseInput {
  version: string
  release_name: string
  description?: string
  release_type?: ReleaseType
  environment?: Environment
  changelog?: string
  git_branch?: string
  git_tag?: string
  is_prerelease?: boolean
  is_draft?: boolean
  scheduled_for?: string
}

export interface UpdateReleaseInput {
  id: string
  version?: string
  release_name?: string
  description?: string
  status?: ReleaseStatus
  release_type?: ReleaseType
  environment?: Environment
  changelog?: string
  git_branch?: string
  git_tag?: string
  is_prerelease?: boolean
  is_draft?: boolean
  scheduled_for?: string
}

// Main Releases Hook
export function useReleases(options: UseReleasesOptions = {}) {
  const { status, environment, limit } = options
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationError, setMutationError] = useState<Error | null>(null)

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (environment && environment !== 'all') filters.environment = environment

  const { data, loading, error, refetch } = useSupabaseQuery<Release>({
    table: 'releases',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
  })

  const { mutate, remove } = useSupabaseMutation<Release>({
    table: 'releases',
    onSuccess: () => {
      refetch()
    },
    onError: (err) => {
      setMutationError(err)
    }
  })

  // Create a new release
  const createRelease = useCallback(async (input: CreateReleaseInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const releaseData = {
        version: input.version,
        release_name: input.release_name,
        description: input.description || null,
        status: input.scheduled_for ? 'scheduled' : (input.is_draft ? 'draft' : 'deployed') as ReleaseStatus,
        release_type: input.release_type || 'minor',
        environment: input.environment || 'development',
        changelog: input.changelog || null,
        git_branch: input.git_branch || null,
        git_tag: input.git_tag || input.version,
        is_prerelease: input.is_prerelease || false,
        is_draft: input.is_draft ?? true,
        is_latest: false,
        scheduled_for: input.scheduled_for || null,
        commits_count: 0,
        contributors_count: 1,
        coverage_percentage: 0,
        rollback_rate: 0,
        breaking_changes: [],
        downloads_count: 0,
        views_count: 0,
        additions_count: 0,
        deletions_count: 0,
        files_changed: 0,
        metadata: {}
      }
      const result = await mutate(releaseData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create release')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [mutate])

  // Update an existing release
  const updateRelease = useCallback(async (input: UpdateReleaseInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const { id, ...updateData } = input
      const result = await mutate(updateData, id)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update release')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [mutate])

  // Delete a release (soft delete)
  const deleteRelease = useCallback(async (id: string) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      await remove(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete release')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [remove])

  // Deploy a release (update status to rolling)
  const deployRelease = useCallback(async (id: string) => {
    return updateRelease({ id, status: 'rolling' })
  }, [updateRelease])

  // Mark release as deployed
  const markDeployed = useCallback(async (id: string) => {
    return updateRelease({
      id,
      status: 'deployed',
    })
  }, [updateRelease])

  // Rollback a release
  const rollbackRelease = useCallback(async (id: string) => {
    return updateRelease({ id, status: 'rolled_back' })
  }, [updateRelease])

  return {
    releases: data,
    loading,
    error,
    refetch,
    mutationLoading,
    mutationError,
    createRelease,
    updateRelease,
    deleteRelease,
    deployRelease,
    markDeployed,
    rollbackRelease
  }
}

// Release Statistics Hook
export function useReleaseStats() {
  const { data, loading, error, refetch } = useSupabaseQuery<Release>({
    table: 'releases',
    orderBy: { column: 'created_at', ascending: false },
  })

  const stats = data ? {
    totalReleases: data.length,
    deployedReleases: data.filter((r) => r.status === 'deployed').length,
    rollingReleases: data.filter((r) => r.status === 'rolling').length,
    scheduledReleases: data.filter((r) => r.status === 'scheduled').length,
    failedReleases: data.filter((r) => r.status === 'failed').length,
    draftReleases: data.filter((r) => r.status === 'draft').length,
    averageDeployTime: data.filter((r) => r.deploy_time_minutes).length > 0
      ? data.filter((r) => r.deploy_time_minutes).reduce((sum, r) => sum + (r.deploy_time_minutes || 0), 0) /
        data.filter((r) => r.deploy_time_minutes).length
      : 0,
    totalCommits: data.reduce((sum, r) => sum + (r.commits_count || 0), 0),
    totalDownloads: data.reduce((sum, r) => sum + (r.downloads_count || 0), 0),
    successRate: data.length > 0
      ? (data.filter((r) => r.status === 'deployed').length / data.length) * 100
      : 0
  } : null

  return { stats, loading, error, refetch }
}
