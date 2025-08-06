import { NextResponse } from 'next/server';

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
