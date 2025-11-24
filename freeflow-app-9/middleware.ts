/**
 * KAZI – Ultra-light Middleware
 * Executes ONLY when strictly necessary to minimise Vercel Edge Function
 * invocations and associated costs.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicRoutes = [
  '/',
  '/landing', '/login', '/signup', '/features', '/how-it-works', '/docs', '/tutorials',
  '/community', '/api-docs', '/demo', '/support', '/contact', '/payment', '/blog',
  '/newsletter', '/privacy', '/terms', '/pricing', '/careers', '/cookies',
  '/book-appointment', '/community-showcase', '/enhanced-collaboration-demo'
];

// Allow all dashboard routes
const isDashboardRoute = (pathname: string) => pathname.startsWith('/dashboard');

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ----------------------------------------------------------
  // 1. Bypass middleware for static assets and most API routes
  // ----------------------------------------------------------
  if (
    pathname.startsWith('/_next') ||          // Next.js internals
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.match(/^\/favicon\.(?:ico|png|svg)$/) ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/health')) // allow /api/health
  ) {
    return NextResponse.next();
  }

  // ----------------------------------------------------------
  // 2. Allow public pages and all dashboard routes through with zero processing
  // ----------------------------------------------------------
  if (publicRoutes.includes(pathname) || isDashboardRoute(pathname)) {
    return NextResponse.next();
  }

  // ----------------------------------------------------------
  // 3. Apply ultra-light security headers (single execution)
  // ----------------------------------------------------------
  const res = NextResponse.next();

  // Basic security headers – add only once per matching request
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  // Only add a strict CSP in production to avoid local-dev issues
  if (process.env.NODE_ENV === 'production') {
    res.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: blob:; object-src 'none'; frame-ancestors 'none';"
    );
  }

  return res;
}

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
