'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { createTestRun, updateTestRun, cancelTestRun, addTestResult, getTestRunStats } from '@/app/actions/testing'

export interface TestRun {
  id: string
  user_id: string
  run_code: string
  run_name: string
  description: string | null
  suite_type: string
  status: string
  triggered_by: string | null
  start_time: string
  end_time: string | null
  duration_seconds: number
  passed_count: number
  failed_count: number
  skipped_count: number
  total_count: number
  coverage_percent: number
  branch_name: string | null
  commit_hash: string | null
  environment: string | null
  ci_platform: string | null
  build_url: string | null
  report_url: string | null
  logs: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface TestRunResult {
  id: string
  user_id: string
  test_run_id: string
  test_name: string
  test_file: string | null
  suite_name: string | null
  status: string
  duration_ms: number
  error_message: string | null
  stack_trace: string | null
  retry_count: number
  screenshots: unknown[]
  created_at: string
}

interface UseTestingOptions {
  status?: string
  suiteType?: string
}

export function useTestRuns(initialRuns: TestRun[] = [], options: UseTestingOptions = {}) {
  const { data, isLoading, error, refetch } = useSupabaseQuery<TestRun>(
    'test_runs',
    undefined,
    {
      orderBy: { column: 'start_time', ascending: false },
      initialData: initialRuns
    }
  )

  const runs = data || initialRuns

  // Apply filters
  const filteredRuns = runs.filter(run => {
    if (options.status && run.status !== options.status) return false
    if (options.suiteType && run.suite_type !== options.suiteType) return false
    return true
  })

  // Calculate stats
  const completedRuns = runs.filter(r => r.status === 'completed')
  const stats = {
    total: runs.length,
    running: runs.filter(r => r.status === 'running').length,
    completed: completedRuns.length,
    failed: runs.filter(r => r.status === 'failed').length,
    cancelled: runs.filter(r => r.status === 'cancelled').length,
    totalPassed: runs.reduce((sum, r) => sum + r.passed_count, 0),
    totalFailed: runs.reduce((sum, r) => sum + r.failed_count, 0),
    totalSkipped: runs.reduce((sum, r) => sum + r.skipped_count, 0),
    avgDuration: completedRuns.length > 0
      ? completedRuns.reduce((sum, r) => sum + r.duration_seconds, 0) / completedRuns.length
      : 0,
    avgCoverage: completedRuns.length > 0
      ? completedRuns.reduce((sum, r) => sum + Number(r.coverage_percent), 0) / completedRuns.length
      : 0,
    successRate: runs.length > 0
      ? (completedRuns.filter(r => r.failed_count === 0).length / runs.length) * 100
      : 0
  }

  return {
    runs: filteredRuns,
    allRuns: runs,
    stats,
    isLoading,
    error,
    refetch
  }
}

export function useTestingMutations() {
  const createMutation = useSupabaseMutation(createTestRun)
  const updateMutation = useSupabaseMutation(updateTestRun)
  const cancelMutation = useSupabaseMutation(cancelTestRun)
  const addResultMutation = useSupabaseMutation(addTestResult)

  return {
    createRun: createMutation.mutate,
    isCreating: createMutation.isLoading,
    updateRun: updateMutation.mutate,
    isUpdating: updateMutation.isLoading,
    cancelRun: cancelMutation.mutate,
    isCancelling: cancelMutation.isLoading,
    addResult: addResultMutation.mutate,
    isAddingResult: addResultMutation.isLoading
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function getPassRate(passed: number, total: number): string {
  if (total === 0) return '0'
  return ((passed / total) * 100).toFixed(1)
}
