// Server Actions for Payment Management
// Created: December 15, 2024 - A+++ Standard with structured error handling

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { hasPermission } from '@/lib/auth/permissions'
import { uuidSchema } from '@/lib/validations'
import { z } from 'zod'

const logger = createSimpleLogger('payment-actions')

// ============================================
// TYPES & ENUMS
// ============================================

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'crypto' | 'cash' | 'other'
type PaymentType = 'one_time' | 'recurring' | 'subscription' | 'refund' | 'chargeback'

interface Payment {
  id: string
  user_id: string
  order_id?: string
  subscription_id?: string
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: PaymentMethod
  payment_type: PaymentType
  transaction_id?: string
  gateway_response?: Record<string, unknown>
  description?: string
  metadata?: Record<string, unknown>
  refunded_amount?: number
  refund_reason?: string
  failure_reason?: string
  processed_at?: string
  refunded_at?: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  completedPayments: number
  pendingPayments: number
  failedPayments: number
  refundedPayments: number
  totalRefunded: number
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const paymentStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'])
const paymentMethodSchema = z.enum(['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'crypto', 'cash', 'other'])
const paymentTypeSchema = z.enum(['one_time', 'recurring', 'subscription', 'refund', 'chargeback'])

const createPaymentSchema = z.object({
  order_id: uuidSchema.optional(),
  subscription_id: uuidSchema.optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().length(3).default('USD'),
  payment_method: paymentMethodSchema,
  payment_type: paymentTypeSchema.default('one_time'),
  transaction_id: z.string().max(255).optional(),
  gateway_response: z.record(z.unknown()).optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional()
})

const updatePaymentSchema = z.object({
  status: paymentStatusSchema.optional(),
  transaction_id: z.string().max(255).optional(),
  gateway_response: z.record(z.unknown()).optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
  processed_at: z.string().optional(),
  failure_reason: z.string().max(1000).optional()
}).partial()

const refundPaymentSchema = z.object({
  amount: z.number().min(0.01).optional(),
  reason: z.string().max(1000).optional()
})

// ============================================
// SERVER ACTIONS - PAYMENTS
// ============================================

/**
 * Create Payment
 */
export async function createPayment(
  data: z.infer<typeof createPaymentSchema>
): Promise<ActionResult<Payment>> {
  try {
    // Validate input
    const validatedData = createPaymentSchema.parse(data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized payment creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Permission check - manage_billing required for payment operations
    if (!(await hasPermission(user.id, 'manage_billing'))) {
      logger.warn('Permission denied for payment creation', { userId: user.id })
      return actionError('Insufficient permissions to manage payments', 'FORBIDDEN')
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        ...validatedData,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create payment', { error, userId: user.id })
      return actionError('Failed to create payment', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payments-v2')
    logger.info('Payment created successfully', { paymentId: payment.id, amount: payment.amount, userId: user.id })
    return actionSuccess(payment as Payment, 'Payment created successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Payment validation failed', { error: error.errors })
      return actionError('Invalid payment data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error creating payment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Payment
 */
export async function updatePayment(
  paymentId: string,
  data: z.infer<typeof updatePaymentSchema>
): Promise<ActionResult<Payment>> {
  try {
    // Validate inputs
    uuidSchema.parse(paymentId)
    const validatedData = updatePaymentSchema.parse(data)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized payment update attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update(validatedData)
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update payment', { error, paymentId, userId: user.id })
      return actionError('Failed to update payment', 'DATABASE_ERROR')
    }

    if (!payment) {
      logger.warn('Payment not found or unauthorized', { paymentId, userId: user.id })
      return actionError('Payment not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/payments-v2')
    logger.info('Payment updated successfully', { paymentId, userId: user.id })
    return actionSuccess(payment as Payment, 'Payment updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Payment update validation failed', { error: error.errors })
      return actionError('Invalid payment data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error updating payment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Payment Status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus
): Promise<ActionResult<Payment>> {
  try {
    // Validate inputs
    uuidSchema.parse(paymentId)
    paymentStatusSchema.parse(status)

    const updateData: Record<string, unknown> = { status }

    // Auto-set processed_at when status is completed
    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString()
    }

    return updatePayment(paymentId, updateData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Payment status validation failed', { error: error.errors })
      return actionError('Invalid payment status', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error updating payment status', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Process Payment
 */
export async function processPayment(
  paymentId: string,
  gatewayResponse?: Record<string, unknown>
): Promise<ActionResult<Payment>> {
  try {
    // Validate ID
    uuidSchema.parse(paymentId)

    return updatePayment(paymentId, {
      status: 'completed',
      processed_at: new Date().toISOString(),
      gateway_response: gatewayResponse
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Payment ID validation failed', { error: error.errors })
      return actionError('Invalid payment ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error processing payment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Fail Payment
 */
export async function failPayment(
  paymentId: string,
  failureReason: string
): Promise<ActionResult<Payment>> {
  try {
    // Validate inputs
    uuidSchema.parse(paymentId)
    z.string().min(1).max(1000).parse(failureReason)

    return updatePayment(paymentId, {
      status: 'failed',
      failure_reason: failureReason
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Payment failure validation failed', { error: error.errors })
      return actionError('Invalid payment failure data', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error failing payment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Refund Payment
 */
export async function refundPayment(
  paymentId: string,
  data?: z.infer<typeof refundPaymentSchema>
): Promise<ActionResult<Payment>> {
  try {
    // Validate inputs
    uuidSchema.parse(paymentId)
    const validatedData = data ? refundPaymentSchema.parse(data) : {}

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized payment refund attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Get current payment
    const { data: currentPayment, error: fetchError } = await supabase
      .from('payments')
      .select('amount, refunded_amount, status')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentPayment) {
      logger.error('Failed to fetch payment for refund', { error: fetchError, paymentId })
      return actionError('Payment not found', 'NOT_FOUND')
    }

    if (currentPayment.status !== 'completed') {
      logger.warn('Cannot refund non-completed payment', { paymentId, status: currentPayment.status })
      return actionError('Cannot refund payment that is not completed', 'BUSINESS_RULE_VIOLATION')
    }

    const refundAmount = validatedData.amount || currentPayment.amount
    const totalRefunded = (currentPayment.refunded_amount || 0) + refundAmount

    if (totalRefunded > currentPayment.amount) {
      logger.warn('Refund amount exceeds payment amount', { paymentId, refundAmount, totalRefunded })
      return actionError('Refund amount exceeds payment amount', 'BUSINESS_RULE_VIOLATION')
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_amount: totalRefunded,
        refund_reason: validatedData.reason,
        refunded_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to refund payment', { error, paymentId, userId: user.id })
      return actionError('Failed to refund payment', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payments-v2')
    logger.info('Payment refunded successfully', { paymentId, refundAmount, userId: user.id })
    return actionSuccess(payment as Payment, 'Payment refunded successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Refund validation failed', { error: error.errors })
      return actionError('Invalid refund data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error refunding payment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Cancel Payment
 */
export async function cancelPayment(paymentId: string): Promise<ActionResult<Payment>> {
  try {
    // Validate ID
    uuidSchema.parse(paymentId)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized payment cancellation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Check if payment can be cancelled
    const { data: currentPayment, error: fetchError } = await supabase
      .from('payments')
      .select('status')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentPayment) {
      logger.error('Failed to fetch payment for cancellation', { error: fetchError, paymentId })
      return actionError('Payment not found', 'NOT_FOUND')
    }

    if (currentPayment.status === 'completed' || currentPayment.status === 'refunded') {
      logger.warn('Cannot cancel completed or refunded payment', { paymentId, status: currentPayment.status })
      return actionError('Cannot cancel completed or refunded payment', 'BUSINESS_RULE_VIOLATION')
    }

    return updatePayment(paymentId, { status: 'cancelled' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Payment ID validation failed', { error: error.errors })
      return actionError('Invalid payment ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error cancelling payment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete Payment (soft delete)
 */
export async function deletePayment(paymentId: string): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    uuidSchema.parse(paymentId)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized payment deletion attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('payments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', paymentId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete payment', { error, paymentId, userId: user.id })
      return actionError('Failed to delete payment', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/payments-v2')
    logger.info('Payment deleted successfully', { paymentId, userId: user.id })
    return actionSuccess({ success: true }, 'Payment deleted successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Payment ID validation failed', { error: error.errors })
      return actionError('Invalid payment ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error deleting payment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// SERVER ACTIONS - QUERIES
// ============================================

/**
 * Get Payment Stats
 */
export async function getPaymentStats(): Promise<ActionResult<PaymentStats>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized payment stats request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('status, amount, refunded_amount')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch payment stats', { error, userId: user.id })
      return actionError('Failed to fetch payment statistics', 'DATABASE_ERROR')
    }

    const stats: PaymentStats = {
      totalPayments: payments?.length || 0,
      totalAmount: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
      completedPayments: payments?.filter(p => p.status === 'completed').length || 0,
      pendingPayments: payments?.filter(p => p.status === 'pending').length || 0,
      failedPayments: payments?.filter(p => p.status === 'failed').length || 0,
      refundedPayments: payments?.filter(p => p.status === 'refunded').length || 0,
      totalRefunded: payments?.reduce((sum, p) => sum + (p.refunded_amount || 0), 0) || 0
    }

    logger.info('Payment stats retrieved successfully', { userId: user.id, totalPayments: stats.totalPayments })
    return actionSuccess(stats, 'Statistics retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching payment stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get Payments by Order
 */
export async function getPaymentsByOrder(orderId: string): Promise<ActionResult<Payment[]>> {
  try {
    // Validate ID
    uuidSchema.parse(orderId)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized payments by order request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('order_id', orderId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch payments by order', { error, orderId, userId: user.id })
      return actionError('Failed to fetch payments', 'DATABASE_ERROR')
    }

    logger.info('Payments by order retrieved successfully', { orderId, count: payments?.length || 0, userId: user.id })
    return actionSuccess(payments as Payment[], 'Payments retrieved successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Order ID validation failed', { error: error.errors })
      return actionError('Invalid order ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error fetching payments by order', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get Payments by Subscription
 */
export async function getPaymentsBySubscription(subscriptionId: string): Promise<ActionResult<Payment[]>> {
  try {
    // Validate ID
    uuidSchema.parse(subscriptionId)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized payments by subscription request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('subscription_id', subscriptionId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch payments by subscription', { error, subscriptionId, userId: user.id })
      return actionError('Failed to fetch payments', 'DATABASE_ERROR')
    }

    logger.info('Payments by subscription retrieved successfully', { subscriptionId, count: payments?.length || 0, userId: user.id })
    return actionSuccess(payments as Payment[], 'Payments retrieved successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Subscription ID validation failed', { error: error.errors })
      return actionError('Invalid subscription ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error fetching payments by subscription', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
