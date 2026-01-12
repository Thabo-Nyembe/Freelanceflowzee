'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ci-cd-actions')

interface Pipeline {
  id: string
  pipeline_name: string
  description?: string
  pipeline_type: string
  config: any
  trigger_type?: string
  deployment_target?: string
  deployment_environment?: string
  user_id: string
}

export async function createPipeline(data: {
  pipeline_name: string
  description?: string
  pipeline_type: string
  config: any
  trigger_type?: string
  deployment_target?: string
  deployment_environment?: string
}): Promise<ActionResult<Pipeline>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: pipeline, error } = await supabase
      .from('ci_cd')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create pipeline', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Pipeline created successfully', { pipelineId: pipeline.id, userId: user.id })
    return actionSuccess(pipeline, 'Pipeline created successfully')
  } catch (error) {
    logger.error('Unexpected error creating pipeline', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePipeline(id: string, data: any): Promise<ActionResult<Pipeline>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: pipeline, error } = await supabase
      .from('ci_cd')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update pipeline', { error, pipelineId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Pipeline updated successfully', { pipelineId: id, userId: user.id })
    return actionSuccess(pipeline, 'Pipeline updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating pipeline', { error, pipelineId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deletePipeline(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('ci_cd')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete pipeline', { error, pipelineId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Pipeline deleted successfully', { pipelineId: id, userId: user.id })
    return actionSuccess(undefined, 'Pipeline deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting pipeline', { error, pipelineId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function runPipeline(id: string): Promise<ActionResult<Pipeline>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const startTime = new Date()

    const { data: pipeline, error } = await supabase
      .from('ci_cd')
      .update({
        is_running: true,
        last_run_at: startTime.toISOString(),
        last_status: 'running'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to run pipeline', { error, pipelineId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Pipeline started successfully', { pipelineId: id, userId: user.id })
    return actionSuccess(pipeline, 'Pipeline started successfully')
  } catch (error) {
    logger.error('Unexpected error running pipeline', { error, pipelineId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completePipeline(id: string, success: boolean, duration: number): Promise<ActionResult<Pipeline>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('ci_cd')
      .select('run_count, success_count, failure_count, total_duration_seconds')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch pipeline for completion', { error: fetchError, pipelineId: id, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Pipeline not found for completion', { pipelineId: id, userId: user.id })
      return actionError('Pipeline not found', 'NOT_FOUND')
    }

    const runCount = (current.run_count || 0) + 1
    const successCount = success ? (current.success_count || 0) + 1 : current.success_count || 0
    const failureCount = !success ? (current.failure_count || 0) + 1 : current.failure_count || 0
    const totalDuration = (current.total_duration_seconds || 0) + duration
    const avgDuration = Math.round(totalDuration / runCount)

    const { data: pipeline, error } = await supabase
      .from('ci_cd')
      .update({
        is_running: false,
        last_status: success ? 'success' : 'failure',
        run_count: runCount,
        success_count: successCount,
        failure_count: failureCount,
        total_duration_seconds: totalDuration,
        avg_duration_seconds: avgDuration
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete pipeline', { error, pipelineId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Pipeline completed', { pipelineId: id, success, duration, userId: user.id })
    return actionSuccess(pipeline, `Pipeline ${success ? 'completed successfully' : 'failed'}`)
  } catch (error) {
    logger.error('Unexpected error completing pipeline', { error, pipelineId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTestResults(id: string, results: {
  total_tests: number
  passed_tests: number
  failed_tests: number
  test_coverage?: number
}): Promise<ActionResult<Pipeline>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const passRate = results.total_tests > 0
      ? parseFloat(((results.passed_tests / results.total_tests) * 100).toFixed(2))
      : 0

    const { data: pipeline, error } = await supabase
      .from('ci_cd')
      .update({
        total_tests: results.total_tests,
        passed_tests: results.passed_tests,
        failed_tests: results.failed_tests,
        test_pass_rate: passRate,
        test_coverage: results.test_coverage
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update test results', { error, pipelineId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Test results updated', { pipelineId: id, results, userId: user.id })
    return actionSuccess(pipeline, 'Test results updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating test results', { error, pipelineId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateQualityGates(id: string, qualityScore: number, passed: boolean): Promise<ActionResult<Pipeline>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: pipeline, error } = await supabase
      .from('ci_cd')
      .update({
        quality_score: qualityScore,
        quality_passed: passed
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update quality gates', { error, pipelineId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Quality gates updated', { pipelineId: id, qualityScore, passed, userId: user.id })
    return actionSuccess(pipeline, 'Quality gates updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating quality gates', { error, pipelineId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function pausePipeline(id: string): Promise<ActionResult<Pipeline>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: pipeline, error } = await supabase
      .from('ci_cd')
      .update({ status: 'paused' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause pipeline', { error, pipelineId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Pipeline paused', { pipelineId: id, userId: user.id })
    return actionSuccess(pipeline, 'Pipeline paused successfully')
  } catch (error) {
    logger.error('Unexpected error pausing pipeline', { error, pipelineId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function resumePipeline(id: string): Promise<ActionResult<Pipeline>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: pipeline, error } = await supabase
      .from('ci_cd')
      .update({ status: 'active' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resume pipeline', { error, pipelineId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/ci-cd-v2')
    logger.info('Pipeline resumed', { pipelineId: id, userId: user.id })
    return actionSuccess(pipeline, 'Pipeline resumed successfully')
  } catch (error) {
    logger.error('Unexpected error resuming pipeline', { error, pipelineId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
