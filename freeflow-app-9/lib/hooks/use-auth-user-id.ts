'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEMO_USER_ID, isDemoModeEnabled } from '@/lib/hooks/use-demo-fetch'

/**
 * Hook to get the auth.users compatible ID for Supabase FK constraints
 *
 * Background: The app uses NextAuth for authentication against public.users table,
 * but many Supabase tables have FK constraints to auth.users table.
 * This hook bridges that gap by:
 * 1. First checking for demo mode (returns demo user ID)
 * 2. Then trying Supabase auth (direct auth.users ID)
 * 3. Then using authId from NextAuth session (fetched from profiles table)
 * 4. Falling back to session user.id as last resort
 */
export function useAuthUserId() {
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const isDemo = useMemo(() => isDemoModeEnabled(), [])

  useEffect(() => {
    // In demo mode, create a mock session
    if (isDemo) {
      setSession({
        user: {
          id: DEMO_USER_ID,
          authId: DEMO_USER_ID,
          email: 'alex@freeflow.io',
          name: 'Alexandra Chen'
        }
      })
      return
    }

    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => setSession({}))
  }, [isDemo])

  const getUserId = useCallback(async (): Promise<string | null> => {
    // In demo mode, always return demo user ID
    if (isDemo) {
      return DEMO_USER_ID
    }

    // First try authId from NextAuth session (auth.users-compatible ID for Supabase FK constraints)
    const authId = (session?.user as { authId?: string })?.authId
    if (authId) {
      return authId
    }

    // Then try Supabase auth (this gives us auth.users ID directly)
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      return user.id
    }

    // Fallback to session user.id (may fail FK constraints)
    if (session?.user?.id) {
      console.log('Warning: Using public.users ID, may fail FK constraints')
      return session.user.id
    }

    return null
  }, [supabase, session, isDemo])

  const isSessionLoaded = session !== null || isDemo
  return { getUserId, session, isSessionLoaded, isDemo }
}
