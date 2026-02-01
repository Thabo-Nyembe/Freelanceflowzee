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
