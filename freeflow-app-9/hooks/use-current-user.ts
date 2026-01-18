'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role?: string
}

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
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

    fetchUser()
  }, [])

  return { user, isLoading }
}
