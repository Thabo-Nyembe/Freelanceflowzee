/**
 * Demo Authentication Utility (Server-Side)
 *
 * Allows unauthenticated users to view demo data for investor presentations.
 * Demo data is isolated to a specific demo user ID and doesn't affect other users.
 *
 * Usage in API routes:
 * ```ts
 * import { getEffectiveUserId } from '@/lib/demo-auth'
 *
 * export async function GET(request: NextRequest) {
 *   const { userId, isDemoMode, error } = await getEffectiveUserId(request)
 *   if (!userId) {
 *     return NextResponse.json({ error }, { status: 401 })
 *   }
 *   // userId is now either the authenticated user or demo user
 * }
 * ```
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Demo user ID - all demo data is seeded with this user ID
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEMO_USER_EMAIL = 'alex@freeflow.io'

/**
 * Check if the request is in demo mode
 * Demo mode is enabled via:
 * - Query parameter: ?demo=true
 * - Cookie: demo_mode=true
 * - Header: X-Demo-Mode: true
 */
export function isDemoMode(request: NextRequest): boolean {
  // Check query parameter
  const url = new URL(request.url)
  if (url.searchParams.get('demo') === 'true') {
    return true
  }

  // Check cookie
  const demoCookie = request.cookies.get('demo_mode')
  if (demoCookie?.value === 'true') {
    return true
  }

  // Check header
  if (request.headers.get('X-Demo-Mode') === 'true') {
    return true
  }

  return false
}

/**
 * Get the user ID for API operations
 * Returns demo user ID if in demo mode, otherwise returns authenticated user ID
 * Returns null if not authenticated and not in demo mode
 */
export async function getEffectiveUserId(request: NextRequest): Promise<{
  userId: string | null
  isDemoMode: boolean
  error?: string
}> {
  const demoMode = isDemoMode(request)

  if (demoMode) {
    return {
      userId: DEMO_USER_ID,
      isDemoMode: true
    }
  }

  // Try to get authenticated user
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        userId: null,
        isDemoMode: false,
        error: 'Unauthorized'
      }
    }

    return {
      userId: user.id,
      isDemoMode: false
    }
  } catch {
    return {
      userId: null,
      isDemoMode: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Check if the user can modify data
 * Demo mode is read-only - modifications are blocked
 * Authenticated users can modify their own data
 */
export async function canModifyData(request: NextRequest): Promise<{
  canModify: boolean
  userId: string | null
  isDemoMode: boolean
  error?: string
}> {
  const result = await getEffectiveUserId(request)

  // Demo mode is read-only
  if (result.isDemoMode) {
    return {
      canModify: false,
      ...result
    }
  }

  return {
    canModify: result.userId !== null,
    ...result
  }
}

/**
 * Helper to create a read-only response for demo mode write attempts
 */
export function demoModeReadOnlyResponse() {
  return {
    success: false,
    error: 'Demo mode is read-only. Sign up for a free account to create your own data.',
    isDemoMode: true
  }
}
