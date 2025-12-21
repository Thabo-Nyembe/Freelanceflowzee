'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('testing-actions')

export interface CreateTestRunInput {
  run_name: string
  description?: string
  suite_type?: string
  triggered_by?: string
  branch_name?: string
  commit_hash?: string
  environment?: string
  ci_platform?: string
  build_url?: string
}

export interface UpdateTestRunInput extends Partial<CreateTestRunInput> {
  id: string
  status?: string
  end_time?: string
  duration_seconds?: number
  passed_count?: number
  failed_count?: number
  skipped_count?: number
  total_count?: number
  coverage_percent?: number
  report_url?: string
  logs?: string
}

export async function createTestRun(input: CreateTestRunInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Generate run code
    const { data: lastRun } = await supabase
      .from('test_runs')
      .select('run_code')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastNumber = lastRun?.run_code
      ? parseInt(lastRun.run_code.replace('RUN-', ''))
      : 0
    const runCode = `RUN-${(lastNumber + 1).toString().padStart(4, '0')}`

    const { data, error } = await supabase
      .from('test_runs')
      .insert({
        ...input,
        user_id: user.id,
        run_code: runCode,
        status: 'running',
        start_time: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create test run', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Test run created successfully', { runCode })
    revalidatePath('/dashboard/testing-v2')
    return actionSuccess(data, 'Test run created successfully')
  } catch (error) {
    logger.error('Unexpected error creating test run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTestRun(input: UpdateTestRunInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    // If status is being set to completed, calculate duration
    if (updateData.status === 'completed' && !updateData.end_time) {
      updateData.end_time = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('test_runs')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update test run', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Test run updated successfully', { id })
    revalidatePath('/dashboard/testing-v2')
    return actionSuccess(data, 'Test run updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating test run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function cancelTestRun(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('test_runs')
      .update({
        status: 'cancelled',
        end_time: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to cancel test run', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Test run cancelled successfully', { id })
    revalidatePath('/dashboard/testing-v2')
    return actionSuccess(data, 'Test run cancelled successfully')
  } catch (error) {
    logger.error('Unexpected error cancelling test run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addTestResult(input: {
  test_run_id: string
  test_name: string
  test_file?: string
  suite_name?: string
  status: string
  duration_ms?: number
  error_message?: string
  stack_trace?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('test_run_results')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add test result', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update test run counts
    const { data: results } = await supabase
      .from('test_run_results')
      .select('status')
      .eq('test_run_id', input.test_run_id)

    if (results) {
      const passed = results.filter(r => r.status === 'passed').length
      const failed = results.filter(r => r.status === 'failed').length
      const skipped = results.filter(r => r.status === 'skipped').length

      await supabase
        .from('test_runs')
        .update({
          passed_count: passed,
          failed_count: failed,
          skipped_count: skipped,
          total_count: results.length
        })
        .eq('id', input.test_run_id)
        .eq('user_id', user.id)
    }

    logger.info('Test result added successfully', { testName: input.test_name })
    revalidatePath('/dashboard/testing-v2')
    return actionSuccess(data, 'Test result added successfully')
  } catch (error) {
    logger.error('Unexpected error adding test result', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeTestRun(id: string, results: {
  passed_count: number
  failed_count: number
  skipped_count: number
  total_count: number
  coverage_percent?: number
  report_url?: string
  logs?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get start time to calculate duration
    const { data: run } = await supabase
      .from('test_runs')
      .select('start_time')
      .eq('id', id)
      .single()

    const endTime = new Date()
    const startTime = run?.start_time ? new Date(run.start_time) : endTime
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    const status = results.failed_count > 0 ? 'failed' : 'completed'

    const { data, error } = await supabase
      .from('test_runs')
      .update({
        ...results,
        status,
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete test run', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Test run completed successfully', { id, status })
    revalidatePath('/dashboard/testing-v2')
    return actionSuccess(data, 'Test run completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing test run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getTestRunStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: runs, error } = await supabase
      .from('test_runs')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(100)

    if (error) {
      logger.error('Failed to get test run stats', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const completedRuns = runs.filter(r => r.status === 'completed')
    const total = runs.length
    const totalPassed = runs.reduce((sum, r) => sum + r.passed_count, 0)
    const totalFailed = runs.reduce((sum, r) => sum + r.failed_count, 0)
    const avgDuration = completedRuns.length > 0
      ? completedRuns.reduce((sum, r) => sum + r.duration_seconds, 0) / completedRuns.length
      : 0
    const successRate = runs.length > 0
      ? (completedRuns.filter(r => r.failed_count === 0).length / runs.length) * 100
      : 0

    const stats = {
      total,
      running: runs.filter(r => r.status === 'running').length,
      completed: completedRuns.length,
      totalPassed,
      totalFailed,
      avgDuration: Math.round(avgDuration),
      successRate: Math.round(successRate * 10) / 10
    }

    logger.info('Test run stats retrieved successfully')
    return actionSuccess(stats, 'Test run stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting test run stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
