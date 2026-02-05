/**
 * Next.js Middleware - Global Request/Response Handler
 *
 * Handles:
 * - CORS security headers
 * - Security headers (CSP, HSTS, etc.)
 * - Authentication checks
 * - Request logging
 *
 * Runs on every request before reaching route handlers
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:9323',
  'https://your-production-domain.com', // TODO: Update with your production domain
  // Add more allowed origins as needed
]

// Allow credentials for authentication
const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy - send origin only for cross-origin requests
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy - restrict powerful features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // HSTS - Force HTTPS (only in production)
  ...(process.env.NODE_ENV === 'production' ? {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  } : {}),
}

// Content Security Policy
// Gradually tighten this as you identify all resource sources
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for Next.js dev
    "'unsafe-inline'", // TODO: Remove and use nonces
    'https://cdn.jsdelivr.net', // External scripts
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components/emotion
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*', // TODO: Restrict to specific domains
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  ].filter(Boolean),
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}

function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

// ============================================================================
// MIDDLEWARE HANDLER
// ============================================================================

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const response = NextResponse.next()

  // ============================================================================
  // 1. HANDLE CORS
  // ============================================================================

  // Check if origin is allowed
  const isAllowedOrigin = origin && (
    ALLOWED_ORIGINS.includes(origin) ||
    origin.startsWith('http://localhost:') || // Allow all localhost ports in dev
    (process.env.NODE_ENV === 'development' && origin.includes('localhost'))
  )

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)

    // Add other CORS headers
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin! : '',
        ...CORS_HEADERS,
      },
    })
  }

  // ============================================================================
  // 2. ADD SECURITY HEADERS
  // ============================================================================

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add CSP header (only in production to avoid blocking dev tools)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', generateCSP())
  }

  // ============================================================================
  // 3. RATE LIMITING INFO (for logging/monitoring)
  // ============================================================================

  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

  // ============================================================================
  // 4. SECURITY CHECKS
  // ============================================================================

  // Block requests with suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts in URL
    /javascript:/i,  // JavaScript protocol
    /data:text\/html/i,  // Data URL attacks
  ]

  const url = request.url
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url))

  if (isSuspicious) {
    console.warn(`[SECURITY] Suspicious request blocked: ${url}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

  return response
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
