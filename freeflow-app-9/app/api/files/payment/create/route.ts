/**
 * File Payment Creation API
 *
 * POST /api/files/payment/create
 *
 * Creates a Stripe Checkout session for file access payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFilePayment } from '@/lib/payments/file-payment'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('files-payment')

export interface CreatePaymentRequest {
  deliveryId: string
  buyerEmail: string
  buyerName?: string
  successUrl?: string
  cancelUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json()

    const { deliveryId, buyerEmail, buyerName, successUrl, cancelUrl } = body

    // Validate required fields
    if (!deliveryId || !buyerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delivery ID and buyer email are required'
        },
        { status: 400 }
      )
    }

    // Create payment
    const result = await createFilePayment({
      deliveryId,
      buyerEmail,
      buyerName,
      successUrl,
      cancelUrl
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      paymentIntentId: result.paymentIntentId,
      escrowDepositId: result.escrowDepositId
    })
  } catch (error) {
    logger.error('Payment creation error', { error })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment'
      },
      { status: 500 }
    )
  }
}
