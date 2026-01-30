/**
 * Demo Session Helper
 *
 * Provides session data for demo mode, preventing CLIENT_FETCH_ERROR
 * when NextAuth session endpoint is called without authentication.
 */

// Demo session data matching NextAuth session structure
export const DEMO_SESSION = {
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'alex@freeflow.io',
    name: 'Alexandra Chen',
    image: '/images/avatars/alex.jpg',
    role: 'admin',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Check if we're in demo mode
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('demo') === 'true' || document.cookie.includes('demo_mode=true')
}

/**
 * Get session - returns demo session if in demo mode,
 * otherwise fetches from NextAuth API
 */
export async function getClientSession(): Promise<typeof DEMO_SESSION | null> {
  // In demo mode, return mock session immediately
  if (isDemoMode()) {
    return DEMO_SESSION
  }

  try {
    const response = await fetch('/api/auth/session')

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      // Not authenticated - return null silently
      return null
    }

    const data = await response.json()

    // NextAuth returns empty object for unauthenticated users
    if (!data || !data.user) {
      return null
    }

    return data
  } catch {
    // Silently handle errors - user is not authenticated
    return null
  }
}
