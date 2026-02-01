import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { createFeatureLogger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const logger = createFeatureLogger('PaymentAPI')

// Initialize Stripe with API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

// Check if Stripe is properly configured
const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')

// ============================================================================
// TYPES
// ============================================================================

interface PaymentRequest {
  itemId: string
  itemType: 'image' | 'video' | 'audio' | 'document' | 'collection'
  tierId: string
  amount: number
  currency: string
  creatorId: string
  paymentMethodId?: string
  paymentMethod?: {
    type: 'card' | 'wallet'
    cardLast4?: string
  }
  metadata?: Record<string, any>
}

interface PaymentResponse {
  success: boolean
  transactionId: string
  paymentIntentId?: string
  status: 'succeeded' | 'pending' | 'failed' | 'requires_action'
  clientSecret?: string
  amount: number
  currency: string
  receiptUrl?: string
  downloadUrl?: string
  accessToken?: string
  expiresAt?: string
}

// ============================================================================
// STRIPE PAYMENT PROCESSING
// ============================================================================

async function processStripePayment(
  request: PaymentRequest,
  userId: string
): Promise<PaymentResponse> {
  if (!isStripeConfigured) {
    logger.warn('Stripe not configured, using mock payment processing')
    return processMockPayment(request)
  }

  try {
    // Create or retrieve Stripe customer
    let customerId: string | undefined

    // Check if user has a Stripe customer ID stored (would come from database)
    // For now, create a new customer for each payment
    // In production, store customer ID in your database

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100), // Stripe uses cents
      currency: request.currency.toLowerCase(),
      payment_method: request.paymentMethodId,
      confirm: !!request.paymentMethodId,
      automatic_payment_methods: request.paymentMethodId ? undefined : {
        enabled: true,
      },
      metadata: {
        itemId: request.itemId,
        itemType: request.itemType,
        tierId: request.tierId,
        creatorId: request.creatorId,
        userId,
        ...request.metadata,
      },
      // For connected accounts (marketplace)
      // transfer_data: {
      //   destination: creatorStripeAccountId,
      //   amount: Math.round(request.amount * 0.85 * 100), // 85% to creator
      // },
    })

    logger.info('Payment Intent created', {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: request.amount,
    })

    // Generate access token for download
    const accessToken = `access_${crypto.randomUUID()}`

    // Map Stripe status to our status
    const statusMap: Record<string, PaymentResponse['status']> = {
      succeeded: 'succeeded',
      processing: 'pending',
      requires_payment_method: 'failed',
      requires_confirmation: 'requires_action',
      requires_action: 'requires_action',
      canceled: 'failed',
    }

    return {
      success: paymentIntent.status === 'succeeded',
      transactionId: `txn_${paymentIntent.id}`,
      paymentIntentId: paymentIntent.id,
      status: statusMap[paymentIntent.status] || 'pending',
      clientSecret: paymentIntent.client_secret || undefined,
      amount: request.amount,
      currency: request.currency,
      receiptUrl: paymentIntent.latest_charge
        ? `https://dashboard.stripe.com/payments/${paymentIntent.id}`
        : undefined,
      downloadUrl: paymentIntent.status === 'succeeded'
        ? `/api/downloads/${request.itemId}?token=${accessToken}`
        : undefined,
      accessToken: paymentIntent.status === 'succeeded' ? accessToken : undefined,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  } catch (error) {
    logger.error('Stripe payment failed', {
      error: error.message,
      code: error.code,
      type: error.type,
    })

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      throw new Error(`Payment declined: ${error.message}`)
    }

    throw new Error('Payment processing failed. Please try again.')
  }
}

// Mock payment for development when Stripe is not configured
async function processMockPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const transactionId = `txn_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const accessToken = `access_${Date.now()}_${Math.random().toString(36).substring(7)}`

  return {
    success: true,
    transactionId,
    status: 'succeeded',
    amount: request.amount,
    currency: request.currency,
    receiptUrl: `https://app.kazi.com/receipts/${transactionId}`,
    downloadUrl: `/api/downloads/${request.itemId}?token=${accessToken}`,
    accessToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

async function handleWebhook(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    logger.warn('Webhook missing signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.warn('Webhook secret not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    logger.info('Webhook received', { type: event.type, id: event.id })

    // Handle different webhook events
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        logger.info('Payment succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          metadata: paymentIntent.metadata,
        })

        await handlePaymentSucceeded(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        logger.error('Payment failed', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        })

        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        logger.info('Charge refunded', {
          chargeId: charge.id,
          amount: charge.amount_refunded / 100,
        })

        await handleChargeRefunded(charge)
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        logger.warn('Dispute created', {
          disputeId: dispute.id,
          amount: dispute.amount / 100,
          reason: dispute.reason,
        })

        await handleDisputeCreated(dispute)
        break
      }

      default:
        logger.info('Unhandled webhook event', { type: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Webhook verification failed', { error: error.message })
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
}

// ============================================================================
// WEBHOOK EVENT HANDLERS
// ============================================================================

/**
 * Handle successful payment intent
 * - Updates payment record status
 * - Grants user access to purchased content
 * - Creates user notification
 * - Logs analytics event
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const supabase = createAdminClient()
  const { itemId, itemType, tierId, userId, creatorId } = paymentIntent.metadata || {}

  if (!userId) {
    logger.warn('Payment succeeded but no userId in metadata', { paymentIntentId: paymentIntent.id })
    return
  }

  try {
    // Update payment record status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (paymentError) {
      logger.error('Failed to update payment record', { error: paymentError.message, paymentIntentId: paymentIntent.id })
    }

    // Grant user access to the purchased content
    if (itemId && itemType) {
      const accessToken = `access_${crypto.randomUUID()}`
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year

      const { error: accessError } = await supabase
        .from('user_content_access')
        .upsert({
          user_id: userId,
          item_id: itemId,
          item_type: itemType,
          tier_id: tierId || null,
          access_token: accessToken,
          transaction_id: `txn_${paymentIntent.id}`,
          granted_at: new Date().toISOString(),
          expires_at: expiresAt,
          downloads_count: 0,
          downloads_limit: null, // unlimited
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,item_id',
        })

      if (accessError) {
        logger.error('Failed to grant content access', { error: accessError.message, userId, itemId })
      } else {
        logger.info('Content access granted', { userId, itemId, itemType })
      }
    }

    // Create user notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment of ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()} has been processed successfully.`,
      metadata: {
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        item_id: itemId,
        item_type: itemType,
      },
      read: false,
      created_at: new Date().toISOString(),
    })

    // Track analytics
    await supabase.from('payment_analytics').insert({
      payment_id: paymentIntent.id,
      user_id: userId,
      event_type: 'payment_succeeded',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      item_id: itemId,
      item_type: itemType,
      creator_id: creatorId,
      timestamp: new Date().toISOString(),
    })

    logger.info('Payment success handling completed', { paymentIntentId: paymentIntent.id, userId })
  } catch (error) {
    logger.error('Error handling payment success', { error: error.message, paymentIntentId: paymentIntent.id })
  }
}

/**
 * Handle failed payment intent
 * - Updates payment record status with error details
 * - Creates user notification about the failure
 * - Logs analytics event for monitoring
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const supabase = createAdminClient()
  const { userId, itemId, itemType } = paymentIntent.metadata || {}
  const errorMessage = paymentIntent.last_payment_error?.message || 'Payment could not be processed'
  const errorCode = paymentIntent.last_payment_error?.code || 'unknown'

  try {
    // Update payment record with failure details
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        error_message: errorMessage,
        error_code: errorCode,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (paymentError) {
      logger.error('Failed to update payment record', { error: paymentError.message, paymentIntentId: paymentIntent.id })
    }

    // Notify user about the failure
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: `Your payment could not be processed. ${errorMessage}`,
        metadata: {
          payment_intent_id: paymentIntent.id,
          error_code: errorCode,
          error_message: errorMessage,
          item_id: itemId,
          item_type: itemType,
        },
        read: false,
        priority: 'high',
        created_at: new Date().toISOString(),
      })

      // Track failure analytics
      await supabase.from('payment_analytics').insert({
        payment_id: paymentIntent.id,
        user_id: userId,
        event_type: 'payment_failed',
        error_code: errorCode,
        error_message: errorMessage,
        item_id: itemId,
        item_type: itemType,
        timestamp: new Date().toISOString(),
      })
    }

    logger.info('Payment failure handling completed', { paymentIntentId: paymentIntent.id, userId, errorCode })
  } catch (error) {
    logger.error('Error handling payment failure', { error: error.message, paymentIntentId: paymentIntent.id })
  }
}

/**
 * Handle charge refund
 * - Revokes user access to the content
 * - Updates payment record status
 * - Notifies user about the refund
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const supabase = createAdminClient()
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  try {
    // Get payment record to find user and item details
    const { data: payment } = await supabase
      .from('payments')
      .select('user_id, metadata')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    const userId = payment?.user_id
    const itemId = payment?.metadata?.itemId

    // Update payment status to refunded
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_amount: charge.amount_refunded / 100,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntentId)

    if (paymentError) {
      logger.error('Failed to update payment record for refund', { error: paymentError.message, chargeId: charge.id })
    }

    // Revoke user access to the content
    if (itemId && userId) {
      const { error: accessError } = await supabase
        .from('user_content_access')
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_reason: 'refund',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('item_id', itemId)

      if (accessError) {
        logger.error('Failed to revoke content access', { error: accessError.message, userId, itemId })
      } else {
        logger.info('Content access revoked due to refund', { userId, itemId })
      }
    }

    // Notify user about the refund
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `Your refund of ${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()} has been processed. Access to the purchased content has been revoked.`,
        metadata: {
          charge_id: charge.id,
          payment_intent_id: paymentIntentId,
          amount_refunded: charge.amount_refunded / 100,
          currency: charge.currency,
          item_id: itemId,
        },
        read: false,
        created_at: new Date().toISOString(),
      })

      // Track refund analytics
      await supabase.from('payment_analytics').insert({
        payment_id: paymentIntentId,
        user_id: userId,
        event_type: 'charge_refunded',
        amount: charge.amount_refunded,
        currency: charge.currency,
        item_id: itemId,
        timestamp: new Date().toISOString(),
      })
    }

    logger.info('Refund handling completed', { chargeId: charge.id, paymentIntentId, userId })
  } catch (error) {
    logger.error('Error handling refund', { error: error.message, chargeId: charge.id })
  }
}

/**
 * Handle dispute creation
 * - Creates dispute record in database
 * - Updates payment status to disputed
 * - Notifies admins about the dispute
 * - Notifies the user involved
 */
async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  const supabase = createAdminClient()
  const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id
  const paymentIntentId = typeof dispute.payment_intent === 'string'
    ? dispute.payment_intent
    : dispute.payment_intent?.id

  try {
    // Create dispute record
    const { error: disputeError } = await supabase
      .from('payment_disputes')
      .insert({
        stripe_dispute_id: dispute.id,
        stripe_charge_id: chargeId,
        stripe_payment_intent_id: paymentIntentId,
        amount: dispute.amount / 100,
        currency: dispute.currency,
        reason: dispute.reason,
        status: 'opened',
        evidence_due_by: dispute.evidence_details?.due_by
          ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
          : null,
        opened_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (disputeError) {
      logger.error('Failed to create dispute record', { error: disputeError.message, disputeId: dispute.id })
    }

    // Update payment status to disputed
    if (paymentIntentId) {
      await supabase
        .from('payments')
        .update({
          status: 'disputed',
          disputed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntentId)
    }

    // Get user details from payment
    const { data: payment } = await supabase
      .from('payments')
      .select('user_id, metadata')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()

    const userId = payment?.user_id

    // Notify the user about the dispute
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'dispute_opened',
        title: 'Payment Disputed',
        message: `A dispute has been opened for your payment of ${(dispute.amount / 100).toFixed(2)} ${dispute.currency.toUpperCase()}. Reason: ${dispute.reason || 'Not specified'}`,
        metadata: {
          dispute_id: dispute.id,
          payment_intent_id: paymentIntentId,
          amount: dispute.amount / 100,
          currency: dispute.currency,
          reason: dispute.reason,
        },
        read: false,
        priority: 'high',
        created_at: new Date().toISOString(),
      })
    }

    // Notify all admin users about the dispute
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'admin_dispute_alert',
        title: 'New Payment Dispute',
        message: `A new dispute has been opened. Amount: ${(dispute.amount / 100).toFixed(2)} ${dispute.currency.toUpperCase()}. Reason: ${dispute.reason || 'Not specified'}. Evidence due by: ${dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toLocaleDateString() : 'N/A'}`,
        metadata: {
          dispute_id: dispute.id,
          payment_intent_id: paymentIntentId,
          charge_id: chargeId,
          amount: dispute.amount / 100,
          currency: dispute.currency,
          reason: dispute.reason,
          evidence_due_by: dispute.evidence_details?.due_by,
          user_id: userId,
        },
        read: false,
        priority: 'urgent',
        created_at: new Date().toISOString(),
      }))

      await supabase.from('notifications').insert(adminNotifications)
    }

    // Track dispute analytics
    await supabase.from('payment_analytics').insert({
      payment_id: paymentIntentId,
      user_id: userId,
      event_type: 'dispute_created',
      amount: dispute.amount,
      currency: dispute.currency,
      metadata: {
        reason: dispute.reason,
        dispute_id: dispute.id,
      },
      timestamp: new Date().toISOString(),
    })

    logger.info('Dispute handling completed', { disputeId: dispute.id, paymentIntentId, reason: dispute.reason })
  } catch (error) {
    logger.error('Error handling dispute', { error: error.message, disputeId: dispute.id })
  }
}

// ============================================================================
// REVENUE TRACKING
// ============================================================================

interface RevenueRecord {
  transactionId: string
  itemId: string
  itemType: string
  amount: number
  currency: string
  creatorId: string
  creatorPayout: number
  platformFee: number
  timestamp: string
  status: string
}

function trackRevenue(transaction: PaymentResponse, request: PaymentRequest): RevenueRecord {
  const creatorPayout = request.amount * 0.85
  const platformFee = request.amount * 0.15

  const record: RevenueRecord = {
    transactionId: transaction.transactionId,
    itemId: request.itemId,
    itemType: request.itemType,
    amount: request.amount,
    currency: request.currency,
    creatorId: request.creatorId,
    creatorPayout,
    platformFee,
    timestamp: new Date().toISOString(),
    status: transaction.status,
  }

  // In production, save to database
  logger.info('Revenue tracked', record)

  return record
}

// ============================================================================
// ACCESS MANAGEMENT
// ============================================================================

interface AccessGrant {
  userId: string
  itemId: string
  itemType: string
  tierId: string
  transactionId: string
  grantedAt: string
  expiresAt: string
  downloads: number
  downloadsLimit: number | 'unlimited'
}

function grantAccess(
  userId: string,
  request: PaymentRequest,
  transaction: PaymentResponse
): AccessGrant {
  const accessGrant: AccessGrant = {
    userId,
    itemId: request.itemId,
    itemType: request.itemType,
    tierId: request.tierId,
    transactionId: transaction.transactionId,
    grantedAt: new Date().toISOString(),
    expiresAt: transaction.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    downloads: 0,
    downloadsLimit: 'unlimited',
  }

  // In production, save to database
  logger.info('Access granted', accessGrant)

  return accessGrant
}

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check if this is a webhook
    if (request.headers.has('stripe-signature')) {
      return handleWebhook(request)
    }

    // Get authenticated user
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse payment request
    const paymentRequest: PaymentRequest = await request.json()

    logger.info('Payment request received', {
      itemId: paymentRequest.itemId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      tierId: paymentRequest.tierId,
      userId,
    })

    // Validation
    if (!paymentRequest.itemId || !paymentRequest.amount || !paymentRequest.tierId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: itemId, amount, tierId' },
        { status: 400 }
      )
    }

    if (paymentRequest.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Process payment
    const transaction = await processStripePayment(paymentRequest, userId)

    // Only track revenue and grant access if payment succeeded
    if (transaction.status === 'succeeded') {
      trackRevenue(transaction, paymentRequest)
      const accessGrant = grantAccess(userId, paymentRequest, transaction)

      logger.info('Payment completed successfully', {
        transactionId: transaction.transactionId,
        status: transaction.status,
        userId,
      })

      return NextResponse.json({
        success: true,
        ...transaction,
        accessGrant: {
          userId: accessGrant.userId,
          expiresAt: accessGrant.expiresAt,
          downloads: accessGrant.downloadsLimit,
        },
      })
    }

    // Payment requires further action (3D Secure, etc.)
    return NextResponse.json({
      success: false,
      requiresAction: transaction.status === 'requires_action',
      ...transaction,
    })
  } catch (error) {
    logger.error('Payment processing failed', {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Payment processing failed',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - Retrieve transaction details
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const transactionId = searchParams.get('transactionId')
    const paymentIntentId = searchParams.get('paymentIntentId')

    if (!transactionId && !paymentIntentId) {
      return NextResponse.json(
        { error: 'transactionId or paymentIntentId required' },
        { status: 400 }
      )
    }

    // If we have a payment intent ID and Stripe is configured, fetch from Stripe
    if (paymentIntentId && isStripeConfigured) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      return NextResponse.json({
        success: true,
        transaction: {
          transactionId: `txn_${paymentIntent.id}`,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          createdAt: new Date(paymentIntent.created * 1000).toISOString(),
          metadata: paymentIntent.metadata,
        },
      })
    }

    // Fallback: In production, fetch from database
    const transaction = {
      transactionId,
      status: 'succeeded',
      amount: 29.99,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      receiptUrl: `https://app.kazi.com/receipts/${transactionId}`,
    }

    logger.info('Transaction retrieved', { transactionId })

    return NextResponse.json({
      success: true,
      transaction,
    })
  } catch (error) {
    logger.error('Failed to retrieve transaction', { error: error.message })

    return NextResponse.json(
      { error: 'Failed to retrieve transaction' },
      { status: 500 }
    )
  }
}
