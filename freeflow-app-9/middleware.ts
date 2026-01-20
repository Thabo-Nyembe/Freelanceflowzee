/**
 * KAZI – Production Middleware with NextAuth Integration
 * Handles authentication, authorization, and security headers
 */
import { withAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/landing',
  '/login',
  '/signup',
  '/features',
  '/how-it-works',
  '/docs',
  '/tutorials',
  '/community',
  '/api-docs',
  '/demo',
  '/support',
  '/contact',
  '/payment',
  '/blog',
  '/newsletter',
  '/privacy',
  '/terms',
  '/pricing',
  '/careers',
  '/cookies',
  '/book-appointment',
  '/community-showcase',
  '/enhanced-collaboration-demo',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  // Dashboard routes for showcase/demo mode
  '/dashboard',
  '/about'
]

// API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth',
  '/api/health',
  '/api/contact'
]

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
}

// Check if API route is public
function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some(route => pathname.startsWith(route))
}

// Protected routes that require authentication
// Note: /dashboard is now in publicRoutes for showcase mode
const isProtectedRoute = (pathname: string) =>
  pathname.startsWith('/app') ||
  pathname.startsWith('/projects') ||
  pathname.startsWith('/analytics')

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // ----------------------------------------------------------
    // 1. Bypass middleware for static assets
    // ----------------------------------------------------------
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/images') ||
      pathname.match(/^\/favicon\.(?:ico|png|svg)$/)
    ) {
      return NextResponse.next()
    }

    // ----------------------------------------------------------
    // 2. Update Supabase session (refresh tokens, manage cookies)
    // ----------------------------------------------------------
    const supabaseResponse = await updateSession(req)

    // If Supabase middleware returned a redirect (e.g., to login), use it
    if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
      return supabaseResponse
    }

    // ----------------------------------------------------------
    // 3. Apply security headers
    // ----------------------------------------------------------
    const res = supabaseResponse

    // Basic security headers
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-XSS-Protection', '1; mode=block')

    // Strict CSP in production
    if (process.env.NODE_ENV === 'production') {
      res.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
      )
    }

    return res
  },
  {
    callbacks: {
      // Only check authentication for protected routes
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl

        // Allow public routes
        if (isPublicRoute(pathname)) {
          return true
        }

        // Allow public API routes
        if (isPublicApiRoute(pathname)) {
          return true
        }

        // Require authentication for protected routes
        if (isProtectedRoute(pathname)) {
          return !!token
        }

        // Allow everything else (will be caught by security headers)
        return true
      }
    },
    pages: {
      signIn: '/login',
      error: '/login'
    }
  }
)

// ----------------------------------------------------------
// 4. Path matcher – ensures the middleware is only invoked on
//    relevant routes, further reducing unnecessary executions.
// ----------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - /_next/ (Next.js internals)
     *  - /static/ , /images/, favicon files
     *  - /api/*   except /api/health (used for SLA pings)
     */
    '/((?!_next/|static/|images/|favicon.ico|api/(?!health)).*)',
  ],
};
