import { NextResponse } from 'next/server';

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
 * Health check API endpoint
 * Provides minimal server status information without external calls
 * Optimized for free tier usage with minimal resource consumption
 * 
 * @returns {NextResponse} JSON response with server status
 */
export async function GET() {
  const startTime = performance.now();
  
  // Basic server information
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    serverTime: Date.now(),
    // Edge Runtime does not expose `process`, so omit `uptime` & env vars
  };

  // Add response time
  const endTime = performance.now();
  status.responseTime = Math.round(endTime - startTime);
  
  // Return response with appropriate headers
  return NextResponse.json(status, {
    status: 200,
    headers: {
      // Set cache headers to avoid excessive calls
      'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache for 60 seconds
      'X-Response-Time': `${status.responseTime}ms`,
      // Ensure content type is set
      'Content-Type': 'application/json',
    },
  });
}

/**
 * HEAD method for even more lightweight health checks
 * Perfect for SLA monitoring with minimal resource usage
 * 
 * @returns {NextResponse} Empty response with 200 status
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      // Set cache headers to avoid excessive calls
      'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache for 60 seconds
      // Add server identification
      'X-Server-Status': 'healthy',
    },
  });
}

// Configure this route to use the Edge Runtime for maximum performance
export const runtime = 'edge';

// Revalidate every minute to ensure fresh data
export const revalidate = 60;
