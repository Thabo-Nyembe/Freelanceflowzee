'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('qa-actions')

export interface CreateTestCaseInput {
  test_name: string
  description?: string
  test_type?: string
  priority?: string
  assignee_name?: string
  assignee_email?: string
  is_automated?: boolean
  environment?: string
  preconditions?: string
  test_steps?: unknown[]
  expected_result?: string
}

export interface UpdateTestCaseInput extends Partial<CreateTestCaseInput> {
  id: string
  status?: string
  last_run_at?: string
  duration_seconds?: number
  execution_count?: number
  pass_rate?: number
  actual_result?: string
  build_version?: string
}

export async function createTestCase(input: CreateTestCaseInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Generate test code
    const { data: lastTest } = await supabase
      .from('qa_test_cases')
      .select('test_code')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastNumber = lastTest?.test_code
      ? parseInt(lastTest.test_code.replace('TC-', ''))
      : 0
    const testCode = `TC-${(lastNumber + 1).toString().padStart(4, '0')}`

    const { data, error } = await supabase
      .from('qa_test_cases')
      .insert({
        ...input,
        user_id: user.id,
        test_code: testCode
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create test case', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/qa-v2')
    logger.info('Test case created successfully', { testCaseId: data.id, testCode })
    return actionSuccess(data, 'Test case created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating test case', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTestCase(input: UpdateTestCaseInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    const { data, error } = await supabase
      .from('qa_test_cases')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update test case', { error, testCaseId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/qa-v2')
    logger.info('Test case updated successfully', { testCaseId: id })
    return actionSuccess(data, 'Test case updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating test case', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteTestCase(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('qa_test_cases')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete test case', { error, testCaseId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/qa-v2')
    logger.info('Test case deleted successfully', { testCaseId: id })
    return actionSuccess({ success: true }, 'Test case deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting test case', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function executeTest(testCaseId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('qa_test_executions')
      .insert({
        user_id: user.id,
        test_case_id: testCaseId,
        execution_status: 'running',
        executed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (execError) {
      logger.error('Failed to create test execution', { error: execError, testCaseId })
      return actionError(execError.message, 'DATABASE_ERROR')
    }

    // Update test case last run
    await supabase
      .from('qa_test_cases')
      .update({
        last_run_at: new Date().toISOString(),
        execution_count: supabase.rpc('increment', { row_count: 1 })
      })
      .eq('id', testCaseId)
      .eq('user_id', user.id)

    revalidatePath('/dashboard/qa-v2')
    logger.info('Test execution started successfully', { testCaseId, executionId: execution.id })
    return actionSuccess(execution, 'Test execution started successfully')
  } catch (error: any) {
    logger.error('Unexpected error executing test', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createTestExecution(input: {
  test_case_id: string
  execution_status: string
  executed_by?: string
  duration_seconds?: number
  environment?: string
  build_version?: string
  result?: string
  error_message?: string
  logs?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('qa_test_executions')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create test execution', { error, testCaseId: input.test_case_id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update test case statistics
    if (input.result === 'passed' || input.result === 'failed') {
      const { data: executions } = await supabase
        .from('qa_test_executions')
        .select('result')
        .eq('test_case_id', input.test_case_id)

      if (executions) {
        const passed = executions.filter(e => e.result === 'passed').length
        const passRate = (passed / executions.length) * 100

        await supabase
          .from('qa_test_cases')
          .update({
            status: input.result,
            pass_rate: passRate,
            last_run_at: new Date().toISOString()
          })
          .eq('id', input.test_case_id)
          .eq('user_id', user.id)
      }
    }

    revalidatePath('/dashboard/qa-v2')
    logger.info('Test execution created successfully', { executionId: data.id, testCaseId: input.test_case_id })
    return actionSuccess(data, 'Test execution created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating test execution', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getQAStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: testCases, error } = await supabase
      .from('qa_test_cases')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch QA stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const total = testCases.length
    const passed = testCases.filter(t => t.status === 'passed').length
    const failed = testCases.filter(t => t.status === 'failed').length
    const avgPassRate = testCases.length > 0
      ? testCases.reduce((sum, t) => sum + Number(t.pass_rate), 0) / testCases.length
      : 0

    const stats = {
      total,
      passed,
      failed,
      passRate: Math.round(avgPassRate * 10) / 10,
      automated: testCases.filter(t => t.is_automated).length
    }

    logger.info('QA stats fetched successfully', { total })
    return actionSuccess(stats, 'QA statistics retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching QA stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
