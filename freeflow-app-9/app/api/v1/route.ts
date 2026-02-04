import { NextRequest, NextResponse } from 'next/server'

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

/**
 * Kazi API v1 - Public API Root
 * GET /api/v1 - Returns API information and available endpoints
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Kazi Platform API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      auth: '/api/v1/auth',
      projects: '/api/v1/projects',
      clients: '/api/v1/clients',
      invoices: '/api/v1/invoices',
      files: '/api/v1/files',
      analytics: '/api/v1/analytics',
      webhooks: '/api/v1/webhooks'
    },
    rateLimit: {
      free: '1,000 requests/hour',
      starter: '10,000 requests/hour',
      professional: '50,000 requests/hour',
      enterprise: 'Unlimited'
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  })
}
