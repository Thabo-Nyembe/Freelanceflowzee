import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: Request) {
  try {
    const { amount, currency, projectId } = await request.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        projectId,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err: any) {
    console.error('Payment intent creation error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
} 