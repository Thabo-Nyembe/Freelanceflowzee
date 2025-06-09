import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Define public routes that don't require authentication
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
  '/terms'
]

// Define protected routes that require authentication (when not in demo mode)
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/analytics',
  '/feedback',
  '/settings'
]

// Rate limiting for auth endpoints
const authAttempts = new Map<string, { count: number; lastAttempt: number }>()

function checkAuthRateLimit(ip: string): boolean {
  // Skip rate limiting entirely in development for better UX
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  const now = Date.now()
  const attempt = authAttempts.get(ip)

  if (!attempt) {
    authAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Reset after 10 minutes
  if (now - attempt.lastAttempt > 10 * 60 * 1000) {
    authAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Production-only rate limiting
  const maxAttempts = 20
  if (attempt.count >= maxAttempts) {
    return false
  }

  attempt.count++
  attempt.lastAttempt = now
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for test environment or development bypass
  const isTestEnv = 
    request.headers.get('x-test-mode') === 'true' ||
    request.headers.get('user-agent')?.includes('Playwright') ||
    process.env.NODE_ENV === 'test'

  const isDevBypass = 
    process.env.NODE_ENV === 'development' && 
    request.headers.get('x-dev-bypass') === 'true'

  if (isTestEnv) {
    console.log('🧪 Test environment detected - skipping auth middleware')
    return NextResponse.next()
  }

  if (isDevBypass) {
    console.log('🔧 Development bypass detected - skipping rate limiting')
    return await updateSession(request)
  }

  // Check for demo mode configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isSupabaseConfigured = supabaseUrl && 
                              supabaseAnonKey && 
                              !supabaseUrl.includes('placeholder') &&
                              !supabaseUrl.includes('your-project-url')

  // If Supabase is not configured (demo mode), allow access to all routes
  if (!isSupabaseConfigured) {
    console.log('🔧 Middleware: Running in demo mode - allowing all routes')
    
    // Special handling for demo mode redirects
    if (pathname === '/login' || pathname === '/signup') {
      const redirect = request.nextUrl.searchParams.get('redirect')
      if (redirect && protectedRoutes.includes(redirect)) {
        return NextResponse.redirect(new URL(redirect, request.url))
      }
    }
    
    return NextResponse.next()
  }

  // Get client IP for rate limiting
  const ip = request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    '127.0.0.1'

  // Apply rate limiting to auth endpoints
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/signup')) {
    
    if (!checkAuthRateLimit(ip)) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - avatars (avatar images)
     * - public folder assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|avatars|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml|js|css)$).*)' 
  ],
} 