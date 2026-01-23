import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { createFeatureLogger } from '@/lib/logger'
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
    const accessToken = `access_${Date.now()}_${Math.random().toString(36).substring(7)}`

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
  } catch (error: any) {
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
        // TODO: Update database, grant access, notify user
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        logger.error('Payment failed', {
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
        })
        // TODO: Update database, notify user
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        logger.info('Charge refunded', {
          chargeId: charge.id,
          amount: charge.amount_refunded / 100,
        })
        // TODO: Revoke access, update database
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        logger.warn('Dispute created', {
          disputeId: dispute.id,
          amount: dispute.amount / 100,
          reason: dispute.reason,
        })
        // TODO: Handle dispute, notify admin
        break
      }

      default:
        logger.info('Unhandled webhook event', { type: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Webhook verification failed', { error: error.message })
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
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
  } catch (error: any) {
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
  } catch (error: any) {
    logger.error('Failed to retrieve transaction', { error: error.message })

    return NextResponse.json(
      { error: 'Failed to retrieve transaction' },
      { status: 500 }
    )
  }
}
