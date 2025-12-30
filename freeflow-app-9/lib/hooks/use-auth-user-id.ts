'use client'

import { useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from 'next-auth/react'

/**
 * Hook to get the auth.users compatible ID for Supabase FK constraints
 *
 * Background: The app uses NextAuth for authentication against public.users table,
 * but many Supabase tables have FK constraints to auth.users table.
 * This hook bridges that gap by:
 * 1. First trying Supabase auth (direct auth.users ID)
 * 2. Then using authId from NextAuth session (fetched from profiles table)
 * 3. Falling back to session user.id as last resort
 */
export function useAuthUserId() {
  const supabase = createClientComponentClient()
  const { data: session } = useSession()

  const getUserId = useCallback(async (): Promise<string | null> => {
    // First try Supabase auth (this gives us auth.users ID directly)
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      return user.id
    }

    // Try authId from NextAuth session (set by auth.config.ts from profiles table)
    // This is the auth.users-compatible ID for Supabase FK constraints
    const authId = (session?.user as any)?.authId
    if (authId) {
      return authId
    }

    // Fallback to session user.id (may fail FK constraints)
    if (session?.user?.id) {
      console.log('Warning: Using public.users ID, may fail FK constraints')
      return session.user.id
    }

    return null
  }, [supabase, session])

  return { getUserId, session }
}
