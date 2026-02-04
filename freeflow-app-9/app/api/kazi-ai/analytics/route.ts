/**
 * INVESTOR ANALYTICS API
 * Provides investment-grade metrics and reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { investorAnalytics } from '@/lib/ai/investor-analytics'
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

const logger = createFeatureLogger('InvestorAnalytics-API')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const report = searchParams.get('report') || 'health'

    logger.info('Analytics request', { report })

    switch (report) {
      case 'health':
        const health = await investorAnalytics.getPlatformHealth()
        return NextResponse.json({ success: true, data: health })

      case 'board-deck':
        const boardDeck = await investorAnalytics.generateBoardDeck()
        return NextResponse.json({ success: true, data: boardDeck })

      default:
        return NextResponse.json(
          { error: 'Invalid report type. Available: health, board-deck' },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Analytics error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to generate analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, userId, eventData } = body

    if (!eventType || !userId) {
      return NextResponse.json(
        { error: 'eventType and userId are required' },
        { status: 400 }
      )
    }

    // Track event
    investorAnalytics.trackEvent({
      userId,
      eventType,
      eventData: eventData || {},
      timestamp: new Date()
    })

    logger.info('Event tracked', { userId, eventType })

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    })

  } catch (error) {
    logger.error('Event tracking error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        error: 'Failed to track event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
