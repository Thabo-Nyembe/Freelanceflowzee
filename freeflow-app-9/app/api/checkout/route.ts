import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('API-Checkout')

// Plan configurations with pricing IDs (in production, these would be real Stripe price IDs)
const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    priceId: 'price_starter_free', // Would be actual Stripe price ID
    features: ['5 AI-powered projects', 'Basic collaboration tools', 'Community support'],
    trial: false
  },
  professional: {
    name: 'Professional',
    price: 2900, // $29.00 in cents
    priceId: 'price_professional_monthly', // Would be actual Stripe price ID
    features: ['Unlimited AI projects', 'Advanced collaboration', 'Priority support'],
    trial: true,
    trialDays: 14
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Custom pricing
    priceId: 'price_enterprise_custom',
    features: ['Everything in Professional', 'Dedicated account manager', 'Custom AI training'],
    trial: false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body with error handling
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { plan, action } = body

    // Validate plan
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS]

    // Handle different actions
    switch (action) {
      case 'start_free':
        // Starter plan - immediate activation
        return NextResponse.json({
          success: true,
          action: 'redirect',
          redirectUrl: '/dashboard',
          message: 'Welcome to KAZI Starter!',
          plan: {
            name: selectedPlan.name,
            price: selectedPlan.price,
            activated: true
          },
          nextSteps: [
            'Your Starter account is now active!',
            'Explore the dashboard to get started',
            'Create your first AI-powered project',
            'Join our community for tips and support',
            'Upgrade anytime to unlock more features'
          ]
        })

      case 'start_trial':
        // Professional plan - 14-day trial
        // In production: Create Stripe checkout session with trial
        const trialCheckoutUrl = await createStripeCheckoutSession(selectedPlan, true)

        return NextResponse.json({
          success: true,
          action: 'checkout',
          checkoutUrl: trialCheckoutUrl,
          message: 'Starting your 14-day free trial',
          plan: {
            name: selectedPlan.name,
            price: selectedPlan.price,
            trial: true,
            trialDays: selectedPlan.trialDays
          },
          nextSteps: [
            '14-day free trial starts now',
            'No credit card required during trial',
            'Full access to all Professional features',
            'Cancel anytime before trial ends',
            'Automatic upgrade to paid plan after trial',
            'You\'ll receive email reminders before billing'
          ]
        })

      case 'subscribe':
        // Direct subscription without trial
        const checkoutUrl = await createStripeCheckoutSession(selectedPlan, false)

        return NextResponse.json({
          success: true,
          action: 'checkout',
          checkoutUrl,
          message: 'Proceeding to checkout',
          plan: {
            name: selectedPlan.name,
            price: selectedPlan.price,
            trial: false
          },
          nextSteps: [
            'Complete payment to activate your plan',
            'Secure checkout powered by Stripe',
            'Access all features immediately after payment',
            'Manage subscription in your dashboard',
            'Cancel or change plan anytime',
            'Billing receipts sent automatically'
          ]
        })

      case 'contact_sales':
        // Enterprise plan - redirect to contact
        return NextResponse.json({
          success: true,
          action: 'redirect',
          redirectUrl: '/contact',
          message: 'Let\'s discuss your enterprise needs',
          plan: {
            name: selectedPlan.name,
            price: 'Custom',
            enterprise: true
          },
          nextSteps: [
            'Our sales team will contact you within 4-6 hours',
            'Schedule a personalized demo',
            'Discuss custom pricing and features',
            'Review security and compliance requirements',
            'Get dedicated onboarding support',
            'Plan your team rollout strategy'
          ]
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Checkout error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}

// Simulate Stripe checkout session creation
// In production, this would use the Stripe SDK
async function createStripeCheckoutSession(
  plan: typeof PLANS[keyof typeof PLANS],
  isTrial: boolean
): Promise<string> {
  // Check for Stripe API key
  const stripeKey = process.env.STRIPE_SECRET_KEY

  if (!stripeKey || stripeKey.includes('sk_test_')) {
    // Demo mode - return mock checkout URL
    logger.info('Stripe checkout in demo mode', {
      mode: 'demo',
      plan: plan.name,
      price: plan.price,
      isTrial,
      trialDays: plan.trialDays,
      stripeConfigured: false
    })

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Return demo checkout URL (would redirect to dashboard)
    return `/dashboard?checkout=demo&plan=${plan.name.toLowerCase()}&trial=${isTrial}`
  }

  // Production: Create actual Stripe checkout session
  // Uncomment when Stripe is configured
  /*
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
    ...(isTrial && {
      subscription_data: {
        trial_period_days: plan.trialDays,
      },
    }),
  })

  return session.url
  */

  return `/dashboard?checkout=demo&plan=${plan.name.toLowerCase()}&trial=${isTrial}`
}

// GET endpoint for plan information
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const plan = searchParams.get('plan')

  if (plan && PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({
      success: true,
      plan: PLANS[plan as keyof typeof PLANS]
    })
  }

  return NextResponse.json({
    success: true,
    plans: PLANS
  })
}
