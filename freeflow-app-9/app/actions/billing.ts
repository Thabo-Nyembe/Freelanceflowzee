/**
 * Server Actions for Billing Management
 *
 * Provides type-safe CRUD operations for billing transactions with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Comprehensive logging
 */

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
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

const logger = createFeatureLogger('billing-actions')

// Refund schema
const refundSchema = z.object({
  refundAmount: currencySchema,
  refundReason: z.string().max(500).optional(),
  refundMethod: z.string().max(100).optional()
})

type RefundData = z.infer<typeof refundSchema>

/**
 * Create a new billing transaction
 */
export async function createBillingTransaction(
  data: CreateTransaction
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

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

    // Permission check - billing requires special permission
    const canManageBilling = await hasPermission('manage_billing')
    if (!canManageBilling) {
      return actionError('Permission denied: billing access required', 'FORBIDDEN')
    }

    const transactionData = validation.data

    // Insert billing transaction
    const { data: transaction, error } = await supabase
      .from('billing')
      .insert({
        ...transactionData,
        user_id: user.id,
        status: transactionData.status || 'pending'
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to create billing transaction', {
        error: error.message,
        userId: user.id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Billing transaction created', {
      transactionId: transaction.id,
      userId: user.id,
      amount: transactionData.amount
    })
    revalidatePath('/dashboard/billing-v2')

    return actionSuccess({ id: transaction.id }, 'Billing transaction created successfully')
  } catch (error) {
    logger.error('Unexpected error creating billing transaction', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing billing transaction
 */
export async function updateBillingTransaction(
  id: string,
  data: UpdateTransaction
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

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
    const canAccess = await canAccessResource('billing', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot modify this transaction', 'FORBIDDEN')
    }

    // Update billing transaction
    const { data: transaction, error } = await supabase
      .from('billing')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to update billing transaction', {
        error: error.message,
        transactionId: id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Billing transaction updated', { transactionId: id, userId: user.id })
    revalidatePath('/dashboard/billing-v2')

    return actionSuccess({ id: transaction.id }, 'Billing transaction updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating billing transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a billing transaction (soft delete)
 */
export async function deleteBillingTransaction(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = createServerActionClient({ cookies })

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
    const canAccess = await canAccessResource('billing', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot delete this transaction', 'FORBIDDEN')
    }

    // Soft delete
    const { error } = await supabase
      .from('billing')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete billing transaction', {
        error: error.message,
        transactionId: id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Billing transaction deleted', { transactionId: id, userId: user.id })
    revalidatePath('/dashboard/billing-v2')

    return actionSuccess({ deleted: true }, 'Billing transaction deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting billing transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Refund a billing transaction
 */
export async function refundTransaction(
  id: string,
  refundData: RefundData
): Promise<ActionResult<{ status: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid transaction ID', 'VALIDATION_ERROR')
    }

    // Validate refund data
    const validation = refundSchema.safeParse(refundData)
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
    const canAccess = await canAccessResource('billing', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot refund this transaction', 'FORBIDDEN')
    }

    const refund = validation.data

    // Update transaction with refund
    const { data: transaction, error } = await supabase
      .from('billing')
      .update({
        status: 'refunded',
        refunded_date: new Date().toISOString(),
        refund_amount: refund.refundAmount,
        refund_reason: refund.refundReason,
        refund_method: refund.refundMethod,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to refund transaction', {
        error: error.message,
        transactionId: id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction refunded', {
      transactionId: id,
      userId: user.id,
      refundAmount: refund.refundAmount
    })
    revalidatePath('/dashboard/billing-v2')

    return actionSuccess({ status: transaction.status }, 'Transaction refunded successfully')
  } catch (error) {
    logger.error('Unexpected error refunding transaction', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark transaction as completed
 */
export async function completeTransaction(
  id: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = createServerActionClient({ cookies })

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
    const canAccess = await canAccessResource('billing', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot complete this transaction', 'FORBIDDEN')
    }

    // Update transaction status
    const { data: transaction, error } = await supabase
      .from('billing')
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
      logger.error('Failed to complete transaction', {
        error: error.message,
        transactionId: id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Transaction completed', { transactionId: id, userId: user.id })
    revalidatePath('/dashboard/billing-v2')

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
  const supabase = createServerActionClient({ cookies })

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
    const canAccess = await canAccessResource('billing', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot fail this transaction', 'FORBIDDEN')
    }

    // Update transaction status
    const { data: transaction, error } = await supabase
      .from('billing')
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
    revalidatePath('/dashboard/billing-v2')

    return actionSuccess({ status: transaction.status }, 'Transaction marked as failed')
  } catch (error) {
    logger.error('Unexpected error marking transaction as failed', { error, transactionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
