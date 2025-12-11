import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth.config'

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
