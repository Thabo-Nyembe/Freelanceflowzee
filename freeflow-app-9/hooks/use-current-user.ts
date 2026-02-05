'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role?: string
}

/**
 * Hook to get the current authenticated user
 * Checks NextAuth session first, then Supabase Auth
 * SECURITY: Demo mode bypass removed - users must authenticate properly
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1. Check NextAuth session first (for logged in users)
        if (status === 'authenticated' && session?.user) {
          setUser({
            id: session.user.id || '',
            email: session.user.email || '',
            name: session.user.name || session.user.email?.split('@')[0],
            avatar_url: session.user.image || undefined,
            role: (session.user as any).role || 'user'
          })

          // Check if this is the legitimate demo account
          const isDemoAccount = session.user.email === 'alex@freeflow.io' ||
                               session.user.email === 'demo@kazi.io'
          setIsDemo(isDemoAccount)
          setIsLoading(false)
          return
        }

        // 2. Fall back to Supabase Auth (REMOVED: demo mode bypass)
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          // Fetch additional user data from users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: userData?.name || authUser.email?.split('@')[0],
            avatar_url: userData?.avatar_url,
            role: userData?.role || 'user'
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch when NextAuth has finished loading
    if (status !== 'loading') {
      fetchUser()
    }
  }, [session, status])

  return {
    user,
    userId: user?.id || null,
    loading: isLoading || status === 'loading',
    isDemo
  }
}
