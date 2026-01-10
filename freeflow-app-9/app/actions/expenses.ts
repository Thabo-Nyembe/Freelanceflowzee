'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('expenses')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Expense {
  id: string
  user_id: string
  expense_title: string
  amount: number
  total_amount: number
  expense_category: string
  description?: string
  expense_date?: string
  merchant_name?: string
  status: string
  submitted_by: string
  submitted_by_id: string
  submitted_at: string
  approved_by?: string
  approved_by_id?: string
  approved_at?: string
  approval_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  reimbursed?: boolean
  reimbursed_at?: string
  reimbursed_amount?: number
  reimbursement_method?: string
  payment_status?: string
  has_receipt?: boolean
  receipt_url?: string
  receipt_urls?: string[]
  attachment_count?: number
  distance_miles?: number
  mileage_rate?: number
  is_billable?: boolean
  client_id?: string
  client_name?: string
  is_policy_compliant?: boolean
  policy_violations?: string[]
  requires_justification?: boolean
  created_at: string
  updated_at: string
}

interface CreateExpenseInput {
  expense_title: string
  amount: number
  expense_category: string
  description?: string
  expense_date?: string
  merchant_name?: string
}

// ============================================
// EXPENSE CRUD OPERATIONS
// ============================================

export async function createExpense(
  data: CreateExpenseInput
): Promise<ActionResult<Expense>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized expense creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const totalAmount = data.amount

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        ...data,
        total_amount: totalAmount,
        submitted_by: user.email || 'Unknown',
        submitted_by_id: user.id,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create expense', { error, userId: user.id })
      return actionError('Failed to create expense', 'DATABASE_ERROR')
    }

    logger.info('Expense created successfully', {
      expenseId: expense.id,
      userId: user.id,
      amount: totalAmount
    })

    revalidatePath('/dashboard/expenses-v2')
    return actionSuccess(expense, 'Expense created successfully')
  } catch (error) {
    logger.error('Unexpected error creating expense', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function approveExpense(
  id: string,
  approvalNotes?: string
): Promise<ActionResult<Expense>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid expense ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized expense approval attempt', { expenseId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        status: 'approved',
        approved_by: user.email || 'Unknown',
        approved_by_id: user.id,
        approved_at: new Date().toISOString(),
        approval_notes: approvalNotes
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to approve expense', { error, expenseId: id, userId: user.id })
      return actionError('Failed to approve expense', 'DATABASE_ERROR')
    }

    logger.info('Expense approved successfully', {
      expenseId: id,
      userId: user.id,
      approvedBy: user.email
    })

    revalidatePath('/dashboard/expenses-v2')
    return actionSuccess(expense, 'Expense approved successfully')
  } catch (error) {
    logger.error('Unexpected error approving expense', { error, expenseId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rejectExpense(
  id: string,
  rejectionReason: string
): Promise<ActionResult<Expense>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid expense ID format', 'VALIDATION_ERROR')
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return actionError('Rejection reason is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized expense rejection attempt', { expenseId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        status: 'rejected',
        reviewed_by: user.email || 'Unknown',
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to reject expense', { error, expenseId: id, userId: user.id })
      return actionError('Failed to reject expense', 'DATABASE_ERROR')
    }

    logger.info('Expense rejected successfully', {
      expenseId: id,
      userId: user.id,
      reviewedBy: user.email
    })

    revalidatePath('/dashboard/expenses-v2')
    return actionSuccess(expense, 'Expense rejected successfully')
  } catch (error) {
    logger.error('Unexpected error rejecting expense', { error, expenseId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function reimburseExpense(
  id: string,
  reimbursementMethod: string
): Promise<ActionResult<Expense>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid expense ID format', 'VALIDATION_ERROR')
    }

    if (!reimbursementMethod || reimbursementMethod.trim().length === 0) {
      return actionError('Reimbursement method is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized expense reimbursement attempt', { expenseId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('expenses')
      .select('total_amount')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.warn('Expense not found for reimbursement', { expenseId: id, userId: user.id })
      return actionError('Expense not found', 'NOT_FOUND')
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        status: 'reimbursed',
        reimbursed: true,
        reimbursed_at: new Date().toISOString(),
        reimbursed_amount: current.total_amount || 0,
        reimbursement_method: reimbursementMethod,
        payment_status: 'paid'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to reimburse expense', { error, expenseId: id, userId: user.id })
      return actionError('Failed to reimburse expense', 'DATABASE_ERROR')
    }

    logger.info('Expense reimbursed successfully', {
      expenseId: id,
      userId: user.id,
      amount: current.total_amount,
      method: reimbursementMethod
    })

    revalidatePath('/dashboard/expenses-v2')
    return actionSuccess(expense, 'Expense reimbursed successfully')
  } catch (error) {
    logger.error('Unexpected error reimbursing expense', { error, expenseId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function attachReceipt(
  id: string,
  receiptUrl: string
): Promise<ActionResult<Expense>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid expense ID format', 'VALIDATION_ERROR')
    }

    if (!receiptUrl || receiptUrl.trim().length === 0) {
      return actionError('Receipt URL is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized receipt attachment attempt', { expenseId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('expenses')
      .select('receipt_urls, attachment_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) {
      logger.warn('Expense not found for receipt attachment', { expenseId: id, userId: user.id })
      return actionError('Expense not found', 'NOT_FOUND')
    }

    const receiptUrls = [...(current.receipt_urls || []), receiptUrl]

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        has_receipt: true,
        receipt_url: receiptUrl,
        receipt_urls: receiptUrls,
        attachment_count: receiptUrls.length
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to attach receipt', { error, expenseId: id, userId: user.id })
      return actionError('Failed to attach receipt', 'DATABASE_ERROR')
    }

    logger.info('Receipt attached successfully', {
      expenseId: id,
      userId: user.id,
      receiptCount: receiptUrls.length
    })

    revalidatePath('/dashboard/expenses-v2')
    return actionSuccess(expense, 'Receipt attached successfully')
  } catch (error) {
    logger.error('Unexpected error attaching receipt', { error, expenseId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function calculateMileageExpense(
  id: string,
  distanceMiles: number,
  ratePerMile: number
): Promise<ActionResult<Expense>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid expense ID format', 'VALIDATION_ERROR')
    }

    if (distanceMiles <= 0) {
      return actionError('Distance must be greater than 0', 'VALIDATION_ERROR')
    }

    if (ratePerMile <= 0) {
      return actionError('Rate per mile must be greater than 0', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized mileage calculation attempt', { expenseId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const mileageAmount = parseFloat((distanceMiles * ratePerMile).toFixed(2))

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        distance_miles: distanceMiles,
        mileage_rate: ratePerMile,
        amount: mileageAmount,
        total_amount: mileageAmount
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to calculate mileage expense', { error, expenseId: id, userId: user.id })
      return actionError('Failed to calculate mileage expense', 'DATABASE_ERROR')
    }

    logger.info('Mileage expense calculated successfully', {
      expenseId: id,
      userId: user.id,
      distanceMiles,
      ratePerMile,
      totalAmount: mileageAmount
    })

    revalidatePath('/dashboard/expenses-v2')
    return actionSuccess(expense, 'Mileage expense calculated successfully')
  } catch (error) {
    logger.error('Unexpected error calculating mileage expense', { error, expenseId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markAsBillable(
  id: string,
  clientId: string,
  clientName: string
): Promise<ActionResult<Expense>> {
  try {
    // Validate IDs
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid expense ID format', 'VALIDATION_ERROR')
    }

    const clientIdValidation = uuidSchema.safeParse(clientId)
    if (!clientIdValidation.success) {
      return actionError('Invalid client ID format', 'VALIDATION_ERROR')
    }

    if (!clientName || clientName.trim().length === 0) {
      return actionError('Client name is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized mark as billable attempt', { expenseId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        is_billable: true,
        client_id: clientId,
        client_name: clientName
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark expense as billable', { error, expenseId: id, userId: user.id })
      return actionError('Failed to mark expense as billable', 'DATABASE_ERROR')
    }

    logger.info('Expense marked as billable successfully', {
      expenseId: id,
      userId: user.id,
      clientId,
      clientName
    })

    revalidatePath('/dashboard/expenses-v2')
    return actionSuccess(expense, 'Expense marked as billable successfully')
  } catch (error) {
    logger.error('Unexpected error marking expense as billable', { error, expenseId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function flagPolicyViolation(
  id: string,
  violations: string[]
): Promise<ActionResult<Expense>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid expense ID format', 'VALIDATION_ERROR')
    }

    if (!violations || violations.length === 0) {
      return actionError('At least one policy violation is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized policy violation flagging attempt', { expenseId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .update({
        is_policy_compliant: false,
        policy_violations: violations,
        requires_justification: true
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to flag policy violation', { error, expenseId: id, userId: user.id })
      return actionError('Failed to flag policy violation', 'DATABASE_ERROR')
    }

    logger.info('Policy violation flagged successfully', {
      expenseId: id,
      userId: user.id,
      violations
    })

    revalidatePath('/dashboard/expenses-v2')
    return actionSuccess(expense, 'Policy violation flagged successfully')
  } catch (error) {
    logger.error('Unexpected error flagging policy violation', { error, expenseId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
