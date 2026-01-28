/**
 * KAZI – Production Middleware with NextAuth Integration
 * Handles authentication, authorization, rate limiting, and security headers
 */
import { withAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// ============================================================================
// INLINE RATE LIMITER (avoids module import issues in Edge Runtime)
// ============================================================================
const rateLimitStore = new Map<string, { count: number; reset: number }>()

interface RateLimitConfig {
  requests: number
  windowMs: number
}

// Endpoint-specific rate limits
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // AI endpoints (resource intensive)
  '/api/ai/': { requests: 50, windowMs: 3600000 },
  // Auth endpoints (security critical)
  '/api/auth/': { requests: 20, windowMs: 900000 },
  // Payment endpoints
  '/api/payments/': { requests: 100, windowMs: 3600000 },
  // Admin endpoints
  '/api/admin/': { requests: 100, windowMs: 3600000 },
  // Default for all other API routes
  '/api/': { requests: 200, windowMs: 60000 }
}

function getRateLimitConfig(pathname: string): RateLimitConfig {
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) {
      return config
    }
  }
  return { requests: 200, windowMs: 60000 }
}

function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; reset: number; retryAfter?: number } {
  const now = Date.now()
  const windowKey = Math.floor(now / config.windowMs)
  const key = `${identifier}:${windowKey}`

  const current = rateLimitStore.get(key) || { count: 0, reset: (windowKey + 1) * config.windowMs }

  if (current.count >= config.requests) {
    return {
      success: false,
      remaining: 0,
      reset: current.reset,
      retryAfter: Math.ceil((current.reset - now) / 1000)
    }
  }

  current.count++
  rateLimitStore.set(key, current)

  // Cleanup old entries periodically
  if (rateLimitStore.size > 5000) {
    const cutoff = windowKey - 5
    for (const [k] of rateLimitStore) {
      const kWindow = parseInt(k.split(':').pop() || '0')
      if (kWindow < cutoff) {
        rateLimitStore.delete(k)
      }
    }
  }

  return {
    success: true,
    remaining: config.requests - current.count,
    reset: current.reset
  }
}

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

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

// Check if demo mode is enabled
function isDemoMode(req: NextRequest): boolean {
  return (
    req.nextUrl.searchParams.get('demo') === 'true' ||
    req.cookies.get('demo_mode')?.value === 'true' ||
    req.headers.get('X-Demo-Mode') === 'true'
  )
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
    // 1.5. Version route redirects (v1, v2 → main v2 dashboards)
    // ----------------------------------------------------------

    // v1 dashboard routes → main dashboard v2
    if (pathname.startsWith('/v1/dashboard/')) {
      const slug = pathname.replace('/v1/dashboard/', '').replace(/\/$/, '')
      const newUrl = new URL(`/dashboard/${slug}-v2`, req.url)
      return NextResponse.redirect(newUrl)
    }

    // v2 dashboard routes → main dashboard v2
    if (pathname.startsWith('/v2/dashboard/')) {
      const slug = pathname.replace('/v2/dashboard/', '').replace(/\/$/, '')
      const newUrl = new URL(`/dashboard/${slug}-v2`, req.url)
      return NextResponse.redirect(newUrl)
    }

    // Main dashboard routes without -v2 suffix → v2 versions
    // Special aliases for pages with different v2 names
    const V2_ALIASES: Record<string, string> = {
      'projects': 'projects-hub-v2',
      'files': 'files-hub-v2',
      'team': 'team-hub-v2',
      'goals': 'goals-v2'
    }

    // Complete list of all dashboard pages that have v2 versions
    const V2_PAGES = new Set([
      '3d-modeling', 'access-logs', 'accounting', 'activity-logs', 'add-ons', 'admin',
      'ai-agents', 'ai-assistant', 'ai-code-builder', 'ai-create', 'ai-design', 'ai-settings',
      'ai-video', 'ai-voice', 'alerts', 'allocation', 'analytics', 'announcements', 'api',
      'api-keys', 'app-store', 'assets', 'audio-studio', 'audit', 'audit-logs', 'automation',
      'automation-recipes', 'automations', 'backups', 'badges', 'billing', 'bookings',
      'broadcasts', 'budgets', 'bugs', 'builds', 'business-intelligence', 'calendar',
      'campaigns', 'canvas', 'capacity', 'certifications', 'changelog', 'chat', 'ci-cd',
      'clients', 'cloud-storage', 'collaboration', 'community', 'compliance', 'component-library',
      'connectors', 'content', 'content-studio', 'contracts', 'courses', 'crm', 'customer-success',
      'customer-support', 'customers', 'data-export', 'dependencies', 'deployments', 'desktop-app',
      'directory-sync', 'docs', 'documentation', 'documents', 'email-marketing', 'employees',
      'escrow', 'events', 'expenses', 'extensions', 'faq', 'features', 'feedback', 'files-hub',
      'financial', 'forms', 'gallery', 'growth-hub', 'health-score', 'help-center', 'help-docs',
      'integrations', 'integrations-marketplace', 'inventory', 'investor-metrics', 'invoices',
      'invoicing', 'kazi-automations', 'kazi-workflows', 'knowledge-articles', 'knowledge-base',
      'lead-generation', 'leads', 'learning', 'logistics', 'logs', 'maintenance', 'marketing',
      'marketplace', 'media-library', 'meeting-summaries', 'messages', 'messaging', 'milestones',
      'mobile-app', 'monitoring', 'motion-graphics', 'my-day', 'notifications', 'onboarding',
      'orders', 'overview', 'payroll', 'performance', 'performance-analytics', 'permissions',
      'plugins', 'polls', 'pricing', 'products', 'profile', 'projects-hub', 'qa', 'recruitment',
      'registrations', 'release-notes', 'releases', 'renewals', 'reporting', 'reports',
      'resources', 'roadmap', 'roles', 'sales', 'screen-recording', 'security', 'security-audit',
      'security-monitoring', 'seo', 'settings', 'shipping', 'social-media', 'sprints', 'stock',
      'subscriptions', 'support', 'support-tickets', 'surveys', 'system-insights', 'tasks',
      'tax-intelligence', 'team-hub', 'team-management', 'templates', 'testing',
      'theme-store', 'third-party-integrations', 'tickets', 'time-tracking', 'training',
      'transactions', 'tutorials', 'user-management', 'vendors', 'video-review', 'video-studio',
      'voice-ai', 'vulnerability-scan', 'warehouse', 'webhooks', 'webinars', 'white-label',
      'widget-library', 'workflow-builder', 'workflows'
    ])

    if (pathname.startsWith('/dashboard/') && !pathname.includes('-v2')) {
      const slug = pathname.replace('/dashboard/', '').replace(/\/$/, '').split('/')[0]

      // Check for special aliases first
      if (V2_ALIASES[slug]) {
        const newUrl = new URL(pathname.replace(`/dashboard/${slug}`, `/dashboard/${V2_ALIASES[slug]}`), req.url)
        return NextResponse.redirect(newUrl)
      }

      // Standard v2 redirect
      if (V2_PAGES.has(slug)) {
        const newUrl = new URL(pathname.replace(`/dashboard/${slug}`, `/dashboard/${slug}-v2`), req.url)
        return NextResponse.redirect(newUrl)
      }
    }

    // ----------------------------------------------------------
    // 1.6. Demo mode handling - set cookie and allow access
    // ----------------------------------------------------------
    if (isDemoMode(req)) {
      // If demo=true query param, set cookie for session persistence
      if (req.nextUrl.searchParams.get('demo') === 'true') {
        const response = NextResponse.next()
        response.cookies.set('demo_mode', 'true', {
          path: '/',
          maxAge: 60 * 60 * 24, // 24 hours
          sameSite: 'lax'
        })
        // Apply security headers
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-XSS-Protection', '1; mode=block')
        return response
      }
    }

    // ----------------------------------------------------------
    // 2. Rate limiting for API routes
    // ----------------------------------------------------------
    if (pathname.startsWith('/api/')) {
      // Skip rate limiting for webhooks (they have their own auth)
      const skipRateLimit =
        pathname.includes('/webhooks') ||
        pathname === '/api/health' ||
        pathname.startsWith('/api/auth/callback')

      if (!skipRateLimit) {
        // Get identifier (prefer user IP, fallback to a hash)
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   req.headers.get('x-real-ip') ||
                   'anonymous'

        const identifier = `${ip}:${pathname}`
        const config = getRateLimitConfig(pathname)
        const rateLimitResult = checkRateLimit(identifier, config)

        if (!rateLimitResult.success) {
          return NextResponse.json(
            {
              error: 'Too Many Requests',
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: rateLimitResult.retryAfter
            },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': config.requests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
              }
            }
          )
        }
      }
    }

    // ----------------------------------------------------------
    // 3. Update Supabase session (refresh tokens, manage cookies)
    // ----------------------------------------------------------
    const supabaseResponse = await updateSession(req)

    // If Supabase middleware returned a redirect (e.g., to login), use it
    if (supabaseResponse.status === 307 || supabaseResponse.status === 308) {
      return supabaseResponse
    }

    // ----------------------------------------------------------
    // 4. Apply security headers
    // ----------------------------------------------------------
    const res = supabaseResponse

    // Basic security headers
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-XSS-Protection', '1; mode=block')

    // Add rate limit headers for API routes
    if (pathname.startsWith('/api/')) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                 req.headers.get('x-real-ip') ||
                 'anonymous'
      const config = getRateLimitConfig(pathname)
      const identifier = `${ip}:${pathname}`
      const windowKey = Math.floor(Date.now() / config.windowMs)
      const key = `${identifier}:${windowKey}`
      const current = rateLimitStore.get(key)

      res.headers.set('X-RateLimit-Limit', config.requests.toString())
      res.headers.set('X-RateLimit-Remaining', current ? (config.requests - current.count).toString() : config.requests.toString())
      res.headers.set('X-RateLimit-Reset', current ? current.reset.toString() : (Date.now() + config.windowMs).toString())
    }

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

        // Allow demo mode for all routes
        if (isDemoMode(req)) {
          return true
        }

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
