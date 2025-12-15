'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'

// Types
export type ReleaseStatus = 'draft' | 'scheduled' | 'rolling' | 'deployed' | 'failed' | 'rolled_back'
export type Environment = 'development' | 'staging' | 'production' | 'all'
export type DeploymentStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled' | 'rolled_back'

export interface Release {
  id: string
  user_id: string
  version: string
  release_name: string
  description: string | null
  status: ReleaseStatus
  environment: Environment
  deployed_at: string | null
  scheduled_for: string | null
  deploy_time_minutes: number | null
  commits_count: number
  contributors_count: number
  coverage_percentage: number
  rollback_rate: number
  changelog: any[]
  breaking_changes: string[]
  git_branch: string | null
  git_tag: string | null
  build_number: string | null
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
  created_at: string
}

// Hook Options
interface UseReleasesOptions {
  status?: ReleaseStatus
  environment?: Environment
  searchQuery?: string
}

interface UseDeploymentsOptions {
  releaseId?: string
  status?: DeploymentStatus
}

// Releases Hook
export function useReleases(options: UseReleasesOptions = {}) {
  const { status, environment, searchQuery } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('releases')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (environment) {
      query = query.eq('environment', environment)
    }

    if (searchQuery) {
      query = query.or(`version.ilike.%${searchQuery}%,release_name.ilike.%${searchQuery}%`)
    }

    return query
  }

  return useSupabaseQuery<Release>('releases', buildQuery, [status, environment, searchQuery])
}

// Single Release Hook
export function useRelease(releaseId: string | null) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('releases')
      .select('*')
      .eq('id', releaseId)
      .single()
  }

  return useSupabaseQuery<Release>(
    'releases',
    buildQuery,
    [releaseId],
    { enabled: !!releaseId }
  )
}

// Deployments Hook
export function useDeployments(options: UseDeploymentsOptions = {}) {
  const { releaseId, status } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('deployments')
      .select('*')
      .order('started_at', { ascending: false, nullsFirst: false })

    if (releaseId) {
      query = query.eq('release_id', releaseId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    return query
  }

  return useSupabaseQuery<Deployment>('deployments', buildQuery, [releaseId, status])
}

// Release Statistics Hook
export function useReleaseStats() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('releases')
      .select('status, environment, deploy_time_minutes, commits_count, coverage_percentage')
      .is('deleted_at', null)
  }

  const { data, ...rest } = useSupabaseQuery<any>('releases', buildQuery, [])

  const stats = data ? {
    totalReleases: data.length,
    deployedReleases: data.filter((r: any) => r.status === 'deployed').length,
    rollingReleases: data.filter((r: any) => r.status === 'rolling').length,
    scheduledReleases: data.filter((r: any) => r.status === 'scheduled').length,
    failedReleases: data.filter((r: any) => r.status === 'failed').length,
    averageDeployTime: data.filter((r: any) => r.deploy_time_minutes).length > 0
      ? data.filter((r: any) => r.deploy_time_minutes).reduce((sum: number, r: any) => sum + r.deploy_time_minutes, 0) /
        data.filter((r: any) => r.deploy_time_minutes).length
      : 0,
    totalCommits: data.reduce((sum: number, r: any) => sum + (r.commits_count || 0), 0),
    successRate: data.length > 0
      ? (data.filter((r: any) => r.status === 'deployed').length / data.length) * 100
      : 0
  } : null

  return { stats, ...rest }
}

// Recent Releases Hook
export function useRecentReleases(limit: number = 5) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('releases')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
  }

  return useSupabaseQuery<Release>('releases', buildQuery, [limit])
}

// Mutations
export function useReleaseMutations() {
  return useSupabaseMutation()
}
