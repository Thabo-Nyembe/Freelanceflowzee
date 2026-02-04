import { NextResponse } from 'next/server'
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

const logger = createSimpleLogger('analytics-vitals')

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  delta: number
  navigationType: string
  timestamp: number
  url: string
  userAgent: string
}

export async function POST(request: Request) {
  try {
    const metric: WebVitalMetric = await request.json()

    // Log metrics for monitoring
    logger.info('Web Vitals metric received', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      timestamp: new Date(metric.timestamp).toISOString(),
    })

    // In production, you could:
    // 1. Store in database for analysis
    // 2. Send to external analytics service (Google Analytics, Datadog, etc.)
    // 3. Aggregate and alert on performance degradation

    // Example: Store in Supabase (uncomment when ready)
    // const supabase = createServerClient()
    // await supabase.from('web_vitals').insert({
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   rating: metric.rating,
    //   metric_id: metric.id,
    //   delta: metric.delta,
    //   navigation_type: metric.navigationType,
    //   page_url: metric.url,
    //   user_agent: metric.userAgent,
    //   recorded_at: new Date(metric.timestamp).toISOString(),
    // })

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Error processing Web Vitals metric', { error })
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 400 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
