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

const logger = createFeatureLogger('API-ErrorReport')

interface ErrorReport {
  error: string
  stack?: string
  digest?: string
  componentStack?: string
  level?: 'page' | 'component' | 'feature'
  name?: string
  errorId?: string
  url: string
  userAgent?: string
  timestamp: string
  type?: 'boundary' | 'programmatic'
}

export async function POST(request: NextRequest) {
  try {
    const errorReport: ErrorReport = await request.json()

    // Log error for monitoring (replace with your monitoring service)
    logger.error('Error report received from client', {
      errorId: errorReport.errorId,
      error: errorReport.error,
      digest: errorReport.digest,
      level: errorReport.level,
      name: errorReport.name,
      type: errorReport.type,
      url: errorReport.url,
      timestamp: errorReport.timestamp,
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, Bugsnag, or other monitoring service
      // await sendToMonitoringService(errorReport)
    }

    // Store error in database if needed
    // await storeErrorReport(errorReport)

    return NextResponse.json({
      success: true,
      message: 'Error report received',
      errorId: errorReport.errorId
    })

  } catch (error) {
    logger.error('Failed to process error report', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process error report'
      },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint for error statistics (admin only)
export async function GET(request: NextRequest) {
  // Basic error statistics
  const stats = {
    totalErrors: 0,
    recentErrors: [],
    errorsByType: {
      boundary: 0,
      programmatic: 0
    },
    errorsByLevel: {
      page: 0,
      component: 0,
      feature: 0
    }
  }

  return NextResponse.json(stats)
}