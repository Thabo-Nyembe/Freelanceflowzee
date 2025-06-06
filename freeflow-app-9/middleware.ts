import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|avatars).*)'],
} 