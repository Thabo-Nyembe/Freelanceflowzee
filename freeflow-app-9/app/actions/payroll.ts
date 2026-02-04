'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('payroll-actions')

export interface CreatePayrollRunInput {
  period: string
  pay_date: string
  department?: string
  total_employees?: number
  total_amount?: number
  currency?: string
  notes?: string
}

export interface UpdatePayrollRunInput {
  period?: string
  pay_date?: string
  status?: string
  total_employees?: number
  total_amount?: number
  processed_count?: number
  pending_count?: number
  failed_count?: number
  department?: string
  approved_by?: string
  approved_date?: string
  notes?: string
}

export async function createPayrollRun(input: CreatePayrollRunInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const runCode = `PAY-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('payroll_runs')
      .insert({
        user_id: user.id,
        run_code: runCode,
        period: input.period,
        pay_date: input.pay_date,
        status: 'draft',
        department: input.department,
        total_employees: input.total_employees || 0,
        total_amount: input.total_amount || 0,
        currency: input.currency || 'USD',
        notes: input.notes
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create payroll run', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payroll-v2')
    return actionSuccess(data, 'Payroll run created successfully')
  } catch (error) {
    logger.error('Unexpected error creating payroll run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePayrollRun(id: string, input: UpdatePayrollRunInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('payroll_runs')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update payroll run', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payroll-v2')
    return actionSuccess(data, 'Payroll run updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating payroll run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function processPayrollRun(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('payroll_runs')
      .update({ status: 'processing' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to process payroll run', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payroll-v2')
    return actionSuccess(data, 'Payroll run processing started')
  } catch (error) {
    logger.error('Unexpected error processing payroll run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function approvePayrollRun(id: string, approverName: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('payroll_runs')
      .update({
        status: 'completed',
        approved_by: approverName,
        approved_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to approve payroll run', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payroll-v2')
    return actionSuccess(data, 'Payroll run approved successfully')
  } catch (error) {
    logger.error('Unexpected error approving payroll run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deletePayrollRun(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('payroll_runs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete payroll run', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payroll-v2')
    return actionSuccess({ success: true }, 'Payroll run deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting payroll run', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addEmployeePayroll(runId: string, input: {
  employee_name: string
  department?: string
  role?: string
  base_salary: number
  bonuses?: number
  deductions?: number
  taxes?: number
  payment_method?: string
  tax_rate?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const employeeCode = `EMP-${Date.now().toString(36).toUpperCase()}`
    const netPay = input.base_salary + (input.bonuses || 0) - (input.deductions || 0) - (input.taxes || 0)

    const { data, error } = await supabase
      .from('employee_payroll')
      .insert({
        user_id: user.id,
        run_id: runId,
        employee_code: employeeCode,
        employee_name: input.employee_name,
        department: input.department,
        role: input.role,
        base_salary: input.base_salary,
        bonuses: input.bonuses || 0,
        deductions: input.deductions || 0,
        taxes: input.taxes || 0,
        net_pay: netPay,
        payment_method: input.payment_method || 'direct-deposit',
        tax_rate: input.tax_rate || 0,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add employee payroll', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payroll-v2')
    return actionSuccess(data, 'Employee payroll added successfully')
  } catch (error) {
    logger.error('Unexpected error adding employee payroll', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getPayrollRuns(filters?: {
  status?: string
  department?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('payroll_runs')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('pay_date', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.department) {
      query = query.eq('department', filters.department)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      logger.error('Failed to get payroll runs', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Payroll runs retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting payroll runs', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
