import { NextRequest, NextResponse } from 'next/server'

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
