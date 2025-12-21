// Server Actions for Subscription Management
// Created: December 15, 2024 - A+++ Standard with structured error handling

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'
import { z } from 'zod'

const logger = createFeatureLogger('subscription-actions')

// ============================================
// TYPES & ENUMS
// ============================================

type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'paused' | 'expired' | 'trialing'
type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'custom'
type CancellationReason = 'user_requested' | 'payment_failed' | 'expired' | 'upgraded' | 'downgraded' | 'other'

interface Subscription {
  id: string
  user_id: string
  product_id?: string
  plan_name: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  amount: number
  currency: string
  trial_ends_at?: string
  current_period_start: string
  current_period_end: string
  cancelled_at?: string
  cancellation_reason?: CancellationReason
  cancellation_note?: string
  paused_at?: string
  resumed_at?: string
  billing_email?: string
  payment_method?: string
  metadata?: Record<string, unknown>
  deleted_at?: string
  created_at: string
  updated_at: string
}

interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  trialingSubscriptions: number
  pausedSubscriptions: number
  cancelledSubscriptions: number
  monthlyRevenue: number
  yearlyRevenue: number
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const subscriptionStatusSchema = z.enum(['active', 'past_due', 'cancelled', 'paused', 'expired', 'trialing'])
const billingCycleSchema = z.enum(['monthly', 'quarterly', 'yearly', 'custom'])
const cancellationReasonSchema = z.enum(['user_requested', 'payment_failed', 'expired', 'upgraded', 'downgraded', 'other'])

const createSubscriptionSchema = z.object({
  product_id: uuidSchema.optional(),
  plan_name: z.string().min(1, 'Plan name is required').max(255),
  billing_cycle: billingCycleSchema,
  amount: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  trial_ends_at: z.string().optional(),
  current_period_start: z.string(),
  current_period_end: z.string(),
  billing_email: z.string().email().max(255).optional(),
  payment_method: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).optional()
})

const updateSubscriptionSchema = z.object({
  plan_name: z.string().min(1).max(255).optional(),
  status: subscriptionStatusSchema.optional(),
  billing_cycle: billingCycleSchema.optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  trial_ends_at: z.string().optional(),
  current_period_start: z.string().optional(),
  current_period_end: z.string().optional(),
  billing_email: z.string().email().max(255).optional(),
  payment_method: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).optional()
}).partial()

const cancelSubscriptionSchema = z.object({
  reason: cancellationReasonSchema,
  note: z.string().max(1000).optional()
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate next billing period
 */
function calculateNextBillingPeriod(
  currentEnd: string,
  billingCycle: BillingCycle
): { start: string; end: string } {
  const start = new Date(currentEnd)
  const end = new Date(currentEnd)

  switch (billingCycle) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1)
      break
    case 'quarterly':
      end.setMonth(end.getMonth() + 3)
      break
    case 'yearly':
      end.setFullYear(end.getFullYear() + 1)
      break
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

// ============================================
// SERVER ACTIONS - SUBSCRIPTIONS
// ============================================

/**
 * Create Subscription
 */
export async function createSubscription(
  data: z.infer<typeof createSubscriptionSchema>
): Promise<ActionResult<Subscription>> {
  try {
    // Validate input
    const validatedData = createSubscriptionSchema.parse(data)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized subscription creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Determine initial status
    const status: SubscriptionStatus = validatedData.trial_ends_at ? 'trialing' : 'active'

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        ...validatedData,
        status
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create subscription', { error, userId: user.id })
      return actionError('Failed to create subscription', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/subscriptions-v2')
    logger.info('Subscription created successfully', { subscriptionId: subscription.id, userId: user.id })
    return actionSuccess(subscription as Subscription, 'Subscription created successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Subscription validation failed', { error: error.errors })
      return actionError('Invalid subscription data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error creating subscription', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  data: z.infer<typeof updateSubscriptionSchema>
): Promise<ActionResult<Subscription>> {
  try {
    // Validate inputs
    uuidSchema.parse(subscriptionId)
    const validatedData = updateSubscriptionSchema.parse(data)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized subscription update attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(validatedData)
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update subscription', { error, subscriptionId, userId: user.id })
      return actionError('Failed to update subscription', 'DATABASE_ERROR')
    }

    if (!subscription) {
      logger.warn('Subscription not found or unauthorized', { subscriptionId, userId: user.id })
      return actionError('Subscription not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/subscriptions-v2')
    logger.info('Subscription updated successfully', { subscriptionId, userId: user.id })
    return actionSuccess(subscription as Subscription, 'Subscription updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Subscription update validation failed', { error: error.errors })
      return actionError('Invalid subscription data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error updating subscription', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Subscription Status
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<ActionResult<Subscription>> {
  try {
    // Validate inputs
    uuidSchema.parse(subscriptionId)
    subscriptionStatusSchema.parse(status)

    return updateSubscription(subscriptionId, { status })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Subscription status validation failed', { error: error.errors })
      return actionError('Invalid subscription status', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error updating subscription status', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Cancel Subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  data?: z.infer<typeof cancelSubscriptionSchema>
): Promise<ActionResult<Subscription>> {
  try {
    // Validate inputs
    uuidSchema.parse(subscriptionId)
    const validatedData = data ? cancelSubscriptionSchema.parse(data) : { reason: 'user_requested' as CancellationReason }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized subscription cancellation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: validatedData.reason,
        cancellation_note: validatedData.note
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to cancel subscription', { error, subscriptionId, userId: user.id })
      return actionError('Failed to cancel subscription', 'DATABASE_ERROR')
    }

    if (!subscription) {
      logger.warn('Subscription not found or unauthorized', { subscriptionId, userId: user.id })
      return actionError('Subscription not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/subscriptions-v2')
    logger.info('Subscription cancelled successfully', { subscriptionId, reason: validatedData.reason, userId: user.id })
    return actionSuccess(subscription as Subscription, 'Subscription cancelled successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Cancellation validation failed', { error: error.errors })
      return actionError('Invalid cancellation data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error cancelling subscription', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Pause Subscription
 */
export async function pauseSubscription(subscriptionId: string): Promise<ActionResult<Subscription>> {
  try {
    // Validate ID
    uuidSchema.parse(subscriptionId)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized subscription pause attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Check if subscription is active
    const { data: currentSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentSubscription) {
      logger.error('Failed to fetch subscription for pause', { error: fetchError, subscriptionId })
      return actionError('Subscription not found', 'NOT_FOUND')
    }

    if (currentSubscription.status !== 'active') {
      logger.warn('Cannot pause non-active subscription', { subscriptionId, status: currentSubscription.status })
      return actionError('Can only pause active subscriptions', 'BUSINESS_RULE_VIOLATION')
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause subscription', { error, subscriptionId, userId: user.id })
      return actionError('Failed to pause subscription', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/subscriptions-v2')
    logger.info('Subscription paused successfully', { subscriptionId, userId: user.id })
    return actionSuccess(subscription as Subscription, 'Subscription paused successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Subscription ID validation failed', { error: error.errors })
      return actionError('Invalid subscription ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error pausing subscription', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Resume Subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<ActionResult<Subscription>> {
  try {
    // Validate ID
    uuidSchema.parse(subscriptionId)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized subscription resume attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Check if subscription is paused
    const { data: currentSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentSubscription) {
      logger.error('Failed to fetch subscription for resume', { error: fetchError, subscriptionId })
      return actionError('Subscription not found', 'NOT_FOUND')
    }

    if (currentSubscription.status !== 'paused') {
      logger.warn('Cannot resume non-paused subscription', { subscriptionId, status: currentSubscription.status })
      return actionError('Can only resume paused subscriptions', 'BUSINESS_RULE_VIOLATION')
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        resumed_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resume subscription', { error, subscriptionId, userId: user.id })
      return actionError('Failed to resume subscription', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/subscriptions-v2')
    logger.info('Subscription resumed successfully', { subscriptionId, userId: user.id })
    return actionSuccess(subscription as Subscription, 'Subscription resumed successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Subscription ID validation failed', { error: error.errors })
      return actionError('Invalid subscription ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error resuming subscription', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Renew Subscription
 */
export async function renewSubscription(subscriptionId: string): Promise<ActionResult<Subscription>> {
  try {
    // Validate ID
    uuidSchema.parse(subscriptionId)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized subscription renewal attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Get current subscription
    const { data: currentSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('billing_cycle, current_period_end')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !currentSubscription) {
      logger.error('Failed to fetch subscription for renewal', { error: fetchError, subscriptionId })
      return actionError('Subscription not found', 'NOT_FOUND')
    }

    // Calculate next billing period
    const nextPeriod = calculateNextBillingPeriod(
      currentSubscription.current_period_end,
      currentSubscription.billing_cycle as BillingCycle
    )

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        current_period_start: nextPeriod.start,
        current_period_end: nextPeriod.end,
        status: 'active'
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to renew subscription', { error, subscriptionId, userId: user.id })
      return actionError('Failed to renew subscription', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/subscriptions-v2')
    logger.info('Subscription renewed successfully', { subscriptionId, userId: user.id })
    return actionSuccess(subscription as Subscription, 'Subscription renewed successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Subscription ID validation failed', { error: error.errors })
      return actionError('Invalid subscription ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error renewing subscription', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete Subscription (soft delete)
 */
export async function deleteSubscription(subscriptionId: string): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    uuidSchema.parse(subscriptionId)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized subscription deletion attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete subscription', { error, subscriptionId, userId: user.id })
      return actionError('Failed to delete subscription', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/subscriptions-v2')
    logger.info('Subscription deleted successfully', { subscriptionId, userId: user.id })
    return actionSuccess({ success: true }, 'Subscription deleted successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Subscription ID validation failed', { error: error.errors })
      return actionError('Invalid subscription ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error deleting subscription', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// SERVER ACTIONS - QUERIES
// ============================================

/**
 * Get Subscription Stats
 */
export async function getSubscriptionStats(): Promise<ActionResult<SubscriptionStats>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized subscription stats request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('status, billing_cycle, amount')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch subscription stats', { error, userId: user.id })
      return actionError('Failed to fetch subscription statistics', 'DATABASE_ERROR')
    }

    const monthlyRevenue = subscriptions
      ?.filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0) || 0

    const yearlyRevenue = subscriptions
      ?.filter(s => s.status === 'active' && s.billing_cycle === 'yearly')
      .reduce((sum, s) => sum + s.amount, 0) || 0

    const stats: SubscriptionStats = {
      totalSubscriptions: subscriptions?.length || 0,
      activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
      trialingSubscriptions: subscriptions?.filter(s => s.status === 'trialing').length || 0,
      pausedSubscriptions: subscriptions?.filter(s => s.status === 'paused').length || 0,
      cancelledSubscriptions: subscriptions?.filter(s => s.status === 'cancelled').length || 0,
      monthlyRevenue,
      yearlyRevenue
    }

    logger.info('Subscription stats retrieved successfully', { userId: user.id, totalSubscriptions: stats.totalSubscriptions })
    return actionSuccess(stats, 'Statistics retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching subscription stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get Active Subscriptions
 */
export async function getActiveSubscriptions(): Promise<ActionResult<Subscription[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized active subscriptions request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch active subscriptions', { error, userId: user.id })
      return actionError('Failed to fetch active subscriptions', 'DATABASE_ERROR')
    }

    logger.info('Active subscriptions retrieved successfully', { count: subscriptions?.length || 0, userId: user.id })
    return actionSuccess(subscriptions as Subscription[], 'Active subscriptions retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching active subscriptions', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get Expiring Subscriptions
 */
export async function getExpiringSubscriptions(daysThreshold = 7): Promise<ActionResult<Subscription[]>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized expiring subscriptions request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .lte('current_period_end', thresholdDate.toISOString())
      .order('current_period_end', { ascending: true })

    if (error) {
      logger.error('Failed to fetch expiring subscriptions', { error, userId: user.id })
      return actionError('Failed to fetch expiring subscriptions', 'DATABASE_ERROR')
    }

    logger.info('Expiring subscriptions retrieved successfully', { count: subscriptions?.length || 0, daysThreshold, userId: user.id })
    return actionSuccess(subscriptions as Subscription[], 'Expiring subscriptions retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching expiring subscriptions', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
