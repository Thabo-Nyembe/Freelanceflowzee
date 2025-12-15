'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createPipeline(data: {
  pipeline_name: string
  description?: string
  pipeline_type: string
  config: any
  trigger_type?: string
  deployment_target?: string
  deployment_environment?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: pipeline, error } = await supabase
    .from('ci_cd')
    .insert([{ ...data, user_id: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
  return pipeline
}

export async function updatePipeline(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: pipeline, error } = await supabase
    .from('ci_cd')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
  return pipeline
}

export async function deletePipeline(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('ci_cd')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
}

export async function runPipeline(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
  return pipeline
}

export async function completePipeline(id: string, success: boolean, duration: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('ci_cd')
    .select('run_count, success_count, failure_count, total_duration_seconds')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Pipeline not found')

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

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
  return pipeline
}

export async function updateTestResults(id: string, results: {
  total_tests: number
  passed_tests: number
  failed_tests: number
  test_coverage?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
  return pipeline
}

export async function updateQualityGates(id: string, qualityScore: number, passed: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
  return pipeline
}

export async function pausePipeline(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: pipeline, error } = await supabase
    .from('ci_cd')
    .update({ status: 'paused' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
  return pipeline
}

export async function resumePipeline(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: pipeline, error } = await supabase
    .from('ci_cd')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/ci-cd-v2')
  return pipeline
}
