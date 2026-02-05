import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import type { NextRequest } from 'next/server'

// ============================================================================
// DEMO USER CONFIGURATION - For legitimate alex@freeflow.io account only
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

// SECURITY: Demo mode bypass removed - users must authenticate properly
// Only returns demo ID if user is actually logged in as demo account
function getDemoUserId(session: any): string | null {
  if (!session?.user) {
    return null  // CHANGED: No bypass - require proper authentication
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

/**
 * NextAuth.js API Route Handler
 *
 * This route handles all authentication requests including:
 * - Sign in (credentials, OAuth)
 * - Sign out
 * - Session management
 * - Callback handling
 * - CSRF token generation
 *
 * Route: /api/auth/[...nextauth]
 * Methods: GET, POST
 *
 * Available endpoints:
 * - GET/POST /api/auth/signin - Sign in page
 * - POST /api/auth/callback/:provider - OAuth callbacks
 * - GET/POST /api/auth/signout - Sign out
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - List available providers
 */

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
