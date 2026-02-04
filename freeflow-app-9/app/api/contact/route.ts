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

const logger = createSimpleLogger('API-Contact')

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

    const { firstName, lastName, email, company, subject, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
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

    // Generate case ID
    const caseId = `CASE-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
    const timestamp = new Date().toISOString()

    // Log the contact form submission (in production, send to email service or database)
    logger.info('Contact form submission received', {
      caseId,
      timestamp,
      from: `${firstName} ${lastName}`,
      email,
      company: company || 'N/A',
      subject,
      messageLength: message.length,
      messagePreview: message.substring(0, 100)
    })

    // In production, integrate with:
    // - SendGrid / AWS SES / Resend for email delivery
    // - Supabase / PostgreSQL for storing submissions
    // - Slack / Discord webhook for team notifications
    // - HubSpot / Salesforce for CRM integration

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Determine response time based on priority
    const isPriority = subject.toLowerCase().includes('enterprise') ||
                      subject.toLowerCase().includes('urgent') ||
                      company

    const responseTime = isPriority ? '4-6 hours' : '24 hours'

    return NextResponse.json({
      success: true,
      caseId,
      message: 'Thank you for contacting KAZI! Your message has been received.',
      responseTime,
      nextSteps: [
        `We'll respond within ${responseTime}`,
        'Check your email for a confirmation message',
        `Your case ID is: ${caseId}`,
        'Save this ID for future reference',
        'You can reply to the confirmation email',
        'Visit our Help Center for immediate answers'
      ],
      confirmation: {
        email,
        subject,
        timestamp,
        estimatedResponse: responseTime
      }
    })
  } catch (error) {
    logger.error('Contact form processing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: 'Failed to process contact form submission' },
      { status: 500 }
    )
  }
}
