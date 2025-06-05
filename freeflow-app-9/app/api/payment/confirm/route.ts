import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, paymentMethodId } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      )
    }

    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
    })

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      // Generate access token for the project
      const accessToken = `access_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const projectId = paymentIntent.metadata?.projectId

      // In a real app, you'd store this in your database
      // For now, we'll just return the access token
      
      return NextResponse.json({
        status: 'succeeded',
        paymentIntentId: paymentIntent.id,
        accessToken,
        unlockUrl: projectId ? `/projects/${projectId}/unlocked` : '/projects',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
    } else if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret,
        requiresAction: true,
      })
    } else {
      return NextResponse.json(
        { error: 'Payment failed', status: paymentIntent.status },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Payment confirmation failed:', error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { 
          error: error.message || 'Your card was declined',
          code: error.code,
          decline_code: error.decline_code 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Payment confirmation failed' },
      { status: 500 }
    )
  }
} 