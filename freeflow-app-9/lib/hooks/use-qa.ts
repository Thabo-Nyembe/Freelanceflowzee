'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { createTestCase, updateTestCase, deleteTestCase, executeTest, createTestExecution } from '@/app/actions/qa'

export interface QATestCase {
  id: string
  user_id: string
  test_code: string
  test_name: string
  description: string | null
  test_type: string
  status: string
  priority: string
  assignee_name: string | null
  assignee_email: string | null
  last_run_at: string | null
  duration_seconds: number
  execution_count: number
  pass_rate: number
  is_automated: boolean
  environment: string | null
  build_version: string | null
  preconditions: string | null
  test_steps: unknown[]
  expected_result: string | null
  actual_result: string | null
  attachments: unknown[]
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface QATestExecution {
  id: string
  user_id: string
  test_case_id: string
  execution_status: string
  executed_by: string | null
  executed_at: string
  duration_seconds: number
  environment: string | null
  build_version: string | null
  result: string | null
  error_message: string | null
  logs: string | null
  screenshots: unknown[]
  created_at: string
}

interface UseQAOptions {
  status?: string
  testType?: string
  priority?: string
}

export function useQATestCases(initialTestCases: QATestCase[] = [], options: UseQAOptions = {}) {
  const { data, isLoading, error, refetch } = useSupabaseQuery<QATestCase>(
    'qa_test_cases',
    {
      column: 'deleted_at',
      value: null,
      isNull: true
    },
    {
      orderBy: { column: 'updated_at', ascending: false },
      initialData: initialTestCases
    }
  )

  const testCases = data || initialTestCases

  // Apply filters
  const filteredTestCases = testCases.filter(test => {
    if (options.status && test.status !== options.status) return false
    if (options.testType && test.test_type !== options.testType) return false
    if (options.priority && test.priority !== options.priority) return false
    return true
  })

  // Calculate stats
  const stats = {
    total: testCases.length,
    passed: testCases.filter(t => t.status === 'passed').length,
    failed: testCases.filter(t => t.status === 'failed').length,
    pending: testCases.filter(t => t.status === 'pending').length,
    blocked: testCases.filter(t => t.status === 'blocked').length,
    automated: testCases.filter(t => t.is_automated).length,
    avgPassRate: testCases.length > 0
      ? testCases.reduce((sum, t) => sum + Number(t.pass_rate), 0) / testCases.length
      : 0,
    totalExecutions: testCases.reduce((sum, t) => sum + t.execution_count, 0)
  }

  return {
    testCases: filteredTestCases,
    allTestCases: testCases,
    stats,
    isLoading,
    error,
    refetch
  }
}

export function useQAMutations() {
  const createMutation = useSupabaseMutation(createTestCase)
  const updateMutation = useSupabaseMutation(updateTestCase)
  const deleteMutation = useSupabaseMutation(deleteTestCase)
  const executeMutation = useSupabaseMutation(executeTest)
  const createExecutionMutation = useSupabaseMutation(createTestExecution)

  return {
    createTestCase: createMutation.mutate,
    isCreating: createMutation.isLoading,
    updateTestCase: updateMutation.mutate,
    isUpdating: updateMutation.isLoading,
    deleteTestCase: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
    executeTest: executeMutation.mutate,
    isExecuting: executeMutation.isLoading,
    createExecution: createExecutionMutation.mutate,
    isCreatingExecution: createExecutionMutation.isLoading
  }
}
