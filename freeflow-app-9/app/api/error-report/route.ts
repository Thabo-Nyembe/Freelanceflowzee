import { NextRequest, NextResponse } from 'next/server'

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
    console.error('Error Report Received:', {
      ...errorReport,
      ip: request.ip || 'unknown',
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer')
      }
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
    console.error('Failed to process error report:', error)

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