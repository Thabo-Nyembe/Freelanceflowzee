import { NextRequest, NextResponse } from 'next/server'
import { CryptoPayment, CryptoPaymentIntent } from '@/lib/crypto-payment-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, supportedCryptos, metadata } = body

    // Validate request
    if (!amount || !currency) {
      return NextResponse.json(
        { error: 'Amount and currency are required' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent: CryptoPaymentIntent = {
      id: `pi_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      supportedCryptos: supportedCryptos || ['BTC', 'ETH', 'USDT', 'USDC'],
      expiresIn: 1800, // 30 minutes
      metadata
    }

    return NextResponse.json(paymentIntent, { status: 200 })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
