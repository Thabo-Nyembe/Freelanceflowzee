'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useMemo } from 'react'

export interface BuildPipeline {
  id: string
  user_id: string
  pipeline_name: string
  pipeline_type: string
  description: string | null
  repository_url: string | null
  branch_pattern: string | null
  trigger_on: string[]
  configuration: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Build {
  id: string
  user_id: string
  pipeline_id: string | null
  build_number: number
  branch: string
  commit_hash: string | null
  commit_message: string | null
  author_name: string | null
  author_email: string | null
  status: string
  duration_seconds: number
  tests_passed: number
  tests_failed: number
  tests_total: number
  coverage_percentage: number
  artifacts_count: number
  started_at: string | null
  completed_at: string | null
  logs_url: string | null
  artifacts_url: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface BuildArtifact {
  id: string
  build_id: string
  user_id: string
  artifact_name: string
  artifact_type: string
  file_path: string | null
  file_size: number
  download_url: string | null
  checksum: string | null
  expires_at: string | null
  download_count: number
  created_at: string
}

export interface BuildFilters {
  status?: string
  branch?: string
  pipelineId?: string
}

export function useBuildPipelines(initialData?: BuildPipeline[]) {
  const query = useSupabaseQuery<BuildPipeline>({
    table: 'build_pipelines',
    select: '*',
    filters: [
      { column: 'deleted_at', operator: 'is', value: null }
    ],
    orderBy: { column: 'pipeline_name', ascending: true },
    initialData
  })

  const activePipelines = useMemo(() => {
    if (!query.data) return []
    return query.data.filter(p => p.is_active)
  }, [query.data])

  return {
    ...query,
    pipelines: query.data || [],
    activePipelines
  }
}

export function useBuilds(initialData?: Build[], filters?: BuildFilters) {
  const query = useSupabaseQuery<Build>({
    table: 'builds',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    initialData
  })

  const filteredBuilds = useMemo(() => {
    if (!query.data) return []

    return query.data.filter(build => {
      if (filters?.status && filters.status !== 'all' && build.status !== filters.status) return false
      if (filters?.branch && filters.branch !== 'all' && build.branch !== filters.branch) return false
      if (filters?.pipelineId && filters.pipelineId !== 'all' && build.pipeline_id !== filters.pipelineId) return false
      return true
    })
  }, [query.data, filters])

  const stats = useMemo(() => {
    if (!query.data) return {
      total: 0,
      success: 0,
      failed: 0,
      running: 0,
      pending: 0,
      successRate: 0,
      avgDuration: 0,
      avgCoverage: 0,
      totalTests: 0
    }

    const success = query.data.filter(b => b.status === 'success').length
    const failed = query.data.filter(b => b.status === 'failed').length
    const running = query.data.filter(b => b.status === 'running').length
    const pending = query.data.filter(b => b.status === 'pending').length
    const completed = success + failed
    const successRate = completed > 0 ? (success / completed) * 100 : 0

    const completedBuilds = query.data.filter(b => b.duration_seconds > 0)
    const avgDuration = completedBuilds.length > 0
      ? completedBuilds.reduce((sum, b) => sum + b.duration_seconds, 0) / completedBuilds.length
      : 0

    const buildsWithCoverage = query.data.filter(b => Number(b.coverage_percentage) > 0)
    const avgCoverage = buildsWithCoverage.length > 0
      ? buildsWithCoverage.reduce((sum, b) => sum + Number(b.coverage_percentage), 0) / buildsWithCoverage.length
      : 0

    const totalTests = query.data.reduce((sum, b) => sum + b.tests_total, 0)

    return {
      total: query.data.length,
      success,
      failed,
      running,
      pending,
      successRate: Math.round(successRate * 10) / 10,
      avgDuration: Math.round(avgDuration),
      avgCoverage: Math.round(avgCoverage * 10) / 10,
      totalTests
    }
  }, [query.data])

  return {
    ...query,
    builds: filteredBuilds,
    stats
  }
}

export function useBuildArtifacts(buildId?: string) {
  return useSupabaseQuery<BuildArtifact>({
    table: 'build_artifacts',
    select: '*',
    filters: buildId ? [{ column: 'build_id', operator: 'eq', value: buildId }] : [],
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!buildId
  })
}

export function useBuildPipelineMutations() {
  const createPipeline = useSupabaseMutation<BuildPipeline>({
    table: 'build_pipelines',
    operation: 'insert',
    invalidateQueries: ['build_pipelines']
  })

  const updatePipeline = useSupabaseMutation<BuildPipeline>({
    table: 'build_pipelines',
    operation: 'update',
    invalidateQueries: ['build_pipelines']
  })

  const deletePipeline = useSupabaseMutation<BuildPipeline>({
    table: 'build_pipelines',
    operation: 'update',
    invalidateQueries: ['build_pipelines']
  })

  return {
    createPipeline: createPipeline.mutate,
    updatePipeline: updatePipeline.mutate,
    deletePipeline: (id: string) => deletePipeline.mutate({ id, deleted_at: new Date().toISOString() }),
    isCreating: createPipeline.isLoading,
    isUpdating: updatePipeline.isLoading,
    isDeleting: deletePipeline.isLoading
  }
}

export function useBuildMutations() {
  const triggerBuild = useSupabaseMutation<Build>({
    table: 'builds',
    operation: 'insert',
    invalidateQueries: ['builds']
  })

  const updateBuild = useSupabaseMutation<Build>({
    table: 'builds',
    operation: 'update',
    invalidateQueries: ['builds']
  })

  const cancelBuild = useSupabaseMutation<Build>({
    table: 'builds',
    operation: 'update',
    invalidateQueries: ['builds']
  })

  const retryBuild = useSupabaseMutation<Build>({
    table: 'builds',
    operation: 'insert',
    invalidateQueries: ['builds']
  })

  return {
    triggerBuild: triggerBuild.mutate,
    updateBuild: updateBuild.mutate,
    cancelBuild: (id: string) => cancelBuild.mutate({ id, status: 'cancelled', completed_at: new Date().toISOString() }),
    retryBuild: (build: Partial<Build>) => retryBuild.mutate({
      ...build,
      id: undefined,
      status: 'pending',
      started_at: null,
      completed_at: null,
      duration_seconds: 0,
      tests_passed: 0,
      tests_failed: 0,
      coverage_percentage: 0,
      artifacts_count: 0
    }),
    isTriggering: triggerBuild.isLoading,
    isUpdating: updateBuild.isLoading,
    isCancelling: cancelBuild.isLoading,
    isRetrying: retryBuild.isLoading
  }
}

export function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Running...'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}
