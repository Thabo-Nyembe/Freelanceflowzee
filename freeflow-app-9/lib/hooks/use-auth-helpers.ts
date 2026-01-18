'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to get the current authenticated user's ID
 */
export function useAuthUserId() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id || null)
      } catch (error) {
        console.error('Error fetching user ID:', error)
        setUserId(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserId()
  }, [])

  return { userId, isLoading }
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { userId, isLoading } = useAuthUserId()
  return { isAuthenticated: !!userId, isLoading }
}
