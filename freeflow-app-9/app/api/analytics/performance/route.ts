import { NextRequest, NextResponse } from 'next/server'
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

const logger = createFeatureLogger('analytics-performance')

/**
 * Performance Analytics API
 * Tracks Core Web Vitals and performance metrics
 */

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()

    // Validate metric data
    if (!metric || !metric.name) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // Log performance metrics
    logger.info('Performance metric received', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      timestamp: new Date().toISOString()
    })

    // In production, you would save this to your database
    // Example with Supabase:
    /*
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    await supabase
      .from('performance_metrics')
      .insert({
        metric_name: metric.name,
        metric_value: metric.value,
        rating: metric.rating,
        navigation_type: metric.navigationType,
        user_agent: request.headers.get('user-agent'),
        created_at: new Date().toISOString()
      })
    */

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Performance tracking error', { error })
    return NextResponse.json(
      { error: 'Failed to track performance metric' },
      { status: 500 }
    )
  }
}
