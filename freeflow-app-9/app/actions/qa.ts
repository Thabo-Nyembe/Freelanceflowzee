'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createTestCase(input: CreateTestCaseInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/qa-v2')
  return { data }
}

export async function updateTestCase(input: UpdateTestCaseInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('qa_test_cases')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/qa-v2')
  return { data }
}

export async function deleteTestCase(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('qa_test_cases')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/qa-v2')
  return { success: true }
}

export async function executeTest(testCaseId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

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
    return { error: execError.message }
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
  return { data: execution }
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
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('qa_test_executions')
    .insert({
      ...input,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
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
  return { data }
}

export async function getQAStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: testCases, error } = await supabase
    .from('qa_test_cases')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) {
    return { error: error.message }
  }

  const total = testCases.length
  const passed = testCases.filter(t => t.status === 'passed').length
  const failed = testCases.filter(t => t.status === 'failed').length
  const avgPassRate = testCases.length > 0
    ? testCases.reduce((sum, t) => sum + Number(t.pass_rate), 0) / testCases.length
    : 0

  return {
    data: {
      total,
      passed,
      failed,
      passRate: Math.round(avgPassRate * 10) / 10,
      automated: testCases.filter(t => t.is_automated).length
    }
  }
}
