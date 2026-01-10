/**
 * Server Actions for Transactions Management
 *
 * Provides type-safe CRUD operations for transactions with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Comprehensive logging
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { hasPermission, canAccessResource } from '@/lib/auth/permissions'
import {
  createTransactionSchema,
  updateTransactionSchema,
  uuidSchema,
  currencySchema,
  CreateTransaction,
  UpdateTransaction
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('transactions-actions')

// Refund schema
const refundSchema = z.object({
  refundAmount: currencySchema.optional(),
  refundReason: z.string().max(500).optional()
})

type RefundData = z.infer<typeof refundSchema>

// Reconciliation schema
const reconciliationSchema = z.object({
  notes: z.string().max(1000).optional()
})

type ReconciliationData = z.infer<typeof reconciliationSchema>

// Flag schema
const flagSchema = z.object({
  reason: z.string().min(1).max(500)
})

type FlagData = z.infer<typeof flagSchema>

/**
 * Create a new transaction
 */
export async function createTransaction(
  data: CreateTransaction
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createTransactionSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check - transactions require billing permission
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    const transactionData = validation.data

    // Insert transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        user_id: user.id,
        status: transactionData.status || 'pending'
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to create transaction', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction created', {
      transactionId: transaction.id,
      userId: user.id,
      amount: transactionData.amount,
      type: transactionData.type
    })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ id: transaction.id }, 'Transaction created successfully')
  } catch (error) {
    logger.error('Unexpected error creating transaction', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  data: UpdateTransaction
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateTransactionSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('transactions', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot modify this transaction', 'FORBIDDEN')
    }

    // Update transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to update transaction', { error: error.message, transactionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction updated', { transactionId: id, userId: user.id })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ id: transaction.id }, 'Transaction updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a transaction (soft delete)
 */
export async function deleteTransaction(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('transactions', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot delete this transaction', 'FORBIDDEN')
    }

    // Soft delete
    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete transaction', { error: error.message, transactionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction deleted', { transactionId: id, userId: user.id })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ deleted: true }, 'Transaction deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Refund a transaction
 */
export async function refundTransaction(
  id: string,
  refundData?: RefundData
): Promise<ActionResult<{ status: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Validate refund data if provided
    if (refundData) {
      const validation = refundSchema.safeParse(refundData)
      if (!validation.success) {
        return actionValidationError(validation.error.errors)
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('transactions', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot refund this transaction', 'FORBIDDEN')
    }

    // Update transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refundData?.refundAmount,
        refund_reason: refundData?.refundReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to refund transaction', { error: error.message, transactionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction refunded', {
      transactionId: id,
      userId: user.id,
      refundAmount: refundData?.refundAmount
    })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ status: transaction.status }, 'Transaction refunded successfully')
  } catch (error) {
    logger.error('Unexpected error refunding transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Reconcile a transaction
 */
export async function reconcileTransaction(
  id: string,
  reconciliationData?: ReconciliationData
): Promise<ActionResult<{ reconciled: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Validate reconciliation data if provided
    if (reconciliationData) {
      const validation = reconciliationSchema.safeParse(reconciliationData)
      if (!validation.success) {
        return actionValidationError(validation.error.errors)
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('transactions', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot reconcile this transaction', 'FORBIDDEN')
    }

    // Update transaction
    const { error } = await supabase
      .from('transactions')
      .update({
        is_reconciled: true,
        reconciled_at: new Date().toISOString(),
        reconciled_by: user.id,
        reconciliation_notes: reconciliationData?.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to reconcile transaction', { error: error.message, transactionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction reconciled', { transactionId: id, userId: user.id })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ reconciled: true }, 'Transaction reconciled successfully')
  } catch (error) {
    logger.error('Unexpected error reconciling transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Flag a transaction for review
 */
export async function flagTransaction(
  id: string,
  flagData: FlagData
): Promise<ActionResult<{ flagged: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Validate flag data
    const validation = flagSchema.safeParse(flagData)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('transactions', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot flag this transaction', 'FORBIDDEN')
    }

    const flag = validation.data

    // Update transaction
    const { error } = await supabase
      .from('transactions')
      .update({
        is_flagged: true,
        flagged_reason: flag.reason,
        flagged_at: new Date().toISOString(),
        flagged_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to flag transaction', { error: error.message, transactionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction flagged', {
      transactionId: id,
      userId: user.id,
      reason: flag.reason
    })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ flagged: true }, 'Transaction flagged successfully')
  } catch (error) {
    logger.error('Unexpected error flagging transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Unflag a transaction
 */
export async function unflagTransaction(
  id: string
): Promise<ActionResult<{ unflagged: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('transactions', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot unflag this transaction', 'FORBIDDEN')
    }

    // Update transaction
    const { error } = await supabase
      .from('transactions')
      .update({
        is_flagged: false,
        flagged_reason: null,
        flagged_at: null,
        flagged_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to unflag transaction', { error: error.message, transactionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction unflagged', { transactionId: id, userId: user.id })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ unflagged: true }, 'Transaction unflagged successfully')
  } catch (error) {
    logger.error('Unexpected error unflagging transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark transaction as completed
 */
export async function completeTransaction(
  id: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('transactions', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot complete this transaction', 'FORBIDDEN')
    }

    // Update transaction status
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to complete transaction', { error: error.message, transactionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction completed', { transactionId: id, userId: user.id })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ status: transaction.status }, 'Transaction completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark transaction as failed
 */
export async function failTransaction(
  id: string,
  failureReason?: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('transactions', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot fail this transaction', 'FORBIDDEN')
    }

    // Update transaction status
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        failure_reason: failureReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to mark transaction as failed', {
        error: error.message,
        transactionId: id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction marked as failed', {
      transactionId: id,
      userId: user.id,
      reason: failureReason
    })
    revalidatePath('/dashboard/transactions-v2')

    return actionSuccess({ status: transaction.status }, 'Transaction marked as failed')
  } catch (error) {
    logger.error('Unexpected error marking transaction as failed', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
