/**
 * Demo Mode Utilities
 * Centralized demo mode logic with proper typing
 */

import { NextRequest } from 'next/server'
import { AuthSession } from '@/lib/types/api'

// Demo user constants
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEMO_USER_EMAIL = 'alex@freeflow.io'
export const DEMO_EMAILS = [DEMO_USER_EMAIL, 'demo@kazi.io', 'test@kazi.dev'] as const

/**
 * Check if request is in demo mode
 * @param request - Next.js request object
 * @returns true if demo mode is enabled
 */
export function isDemoMode(request: NextRequest | undefined): boolean {
  if (typeof request === 'undefined') return false

  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

/**
 * Check if email is a demo account
 * @param email - User email to check
 * @returns true if email is a demo account
 */
export function isDemoEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return DEMO_EMAILS.includes(email as any)
}

/**
 * Get user ID with demo mode support
 * @param session - NextAuth session
 * @param demoMode - Whether demo mode is enabled
 * @returns User ID or demo user ID
 */
export function getDemoUserId(
  session: AuthSession | null,
  demoMode: boolean = false
): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = isDemoEmail(userEmail)

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

/**
 * Get user ID from session (no demo mode support)
 * @param session - NextAuth session
 * @returns User ID or null
 */
export function getUserId(session: AuthSession | null): string | null {
  if (!session?.user) return null
  return session.user.id || session.user.authId || null
}
