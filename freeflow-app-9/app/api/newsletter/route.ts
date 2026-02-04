import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

const logger = createFeatureLogger('API-Newsletter')

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

    const { email, source = 'website', metadata = {} } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('id, email, status')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      logger.error('Error checking existing subscription', {
        error: checkError.message,
        email
      })
      return NextResponse.json(
        { success: false, error: 'Failed to check subscription status' },
        { status: 500 }
      )
    }

    // If already subscribed
    if (existing) {
      if (existing.status === 'active') {
        logger.info('Email already subscribed', { email })
        return NextResponse.json({
          success: true,
          alreadySubscribed: true,
          message: 'You are already subscribed to our newsletter!',
          email
        })
      }

      // If previously unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({
            status: 'active',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          })
          .eq('id', existing.id)

        if (updateError) {
          logger.error('Error reactivating subscription', {
            error: updateError.message,
            email
          })
          return NextResponse.json(
            { success: false, error: 'Failed to reactivate subscription' },
            { status: 500 }
          )
        }

        logger.info('Subscription reactivated', { email })
        return NextResponse.json({
          success: true,
          reactivated: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          email
        })
      }
    }

    // Create new subscription
    const { data: subscription, error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email,
        status: 'active',
        source,
        metadata: {
          ...metadata,
          userAgent: request.headers.get('user-agent') || 'unknown',
          subscribedAt: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error creating subscription', {
        error: insertError.message,
        email
      })
      return NextResponse.json(
        { success: false, error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    logger.info('New newsletter subscription created', {
      email,
      subscriptionId: subscription.id,
      source
    })

    // In production, integrate with:
    // - SendGrid / Mailchimp / ConvertKit for email marketing
    // - Send confirmation email with subscription token
    // - Add to email marketing automation sequences
    // - Trigger welcome email series

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
      email,
      nextSteps: [
        'Check your email for a confirmation message',
        'Add newsletter@kazi.com to your contacts',
        'Look for our weekly insights every Monday',
        'You can unsubscribe anytime from any email'
      ]
    })
  } catch (error) {
    logger.error('Newsletter subscription error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: 'Failed to process newsletter subscription' },
      { status: 500 }
    )
  }
}

// Unsubscribe endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email && !token) {
      return NextResponse.json(
        { success: false, error: 'Email or unsubscribe token is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Build query based on provided parameter
    let query = supabase
      .from('newsletter_subscriptions')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })

    if (token) {
      query = query.eq('subscription_token', token)
    } else if (email) {
      query = query.eq('email', email)
    }

    const { error: updateError } = await query

    if (updateError) {
      logger.error('Error unsubscribing', {
        error: updateError.message,
        email,
        token: token ? 'provided' : 'not provided'
      })
      return NextResponse.json(
        { success: false, error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    logger.info('Newsletter unsubscribed', { email, token: token ? 'used' : 'not used' })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from the newsletter',
      email
    })
  } catch (error) {
    logger.error('Newsletter unsubscribe error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { success: false, error: 'Failed to process unsubscribe request' },
      { status: 500 }
    )
  }
}
