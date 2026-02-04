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

// Demo user constants
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'
const DEMO_USER_NAME = 'Alexandra Chen'

// Check if demo mode is enabled
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

/**
 * Hook to get the current authenticated user
 * Checks NextAuth session first, then Supabase Auth, then demo mode
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
          setIsLoading(false)
          return
        }

        // 2. Check for demo mode
        if (isDemoModeEnabled()) {
          setIsDemo(true)
          setUser({
            id: DEMO_USER_ID,
            email: DEMO_USER_EMAIL,
            name: DEMO_USER_NAME,
            avatar_url: '/images/avatars/alex.jpg',
            role: 'pro'
          })
          setIsLoading(false)
          return
        }

        // 3. Fall back to Supabase Auth
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
