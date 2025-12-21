'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, Session } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Initial session fetch
  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        setSession(session)
        setUser(session?.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get session')
      } finally {
        setLoading(false)
      }
    }

    getSession()
  }, [supabase])

  // Realtime auth state changes subscription
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          setSession(session)
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user ?? null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Realtime subscription for user profile changes
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('auth-profile-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        async () => {
          // Refresh user data when profile changes
          const { data: { user: updatedUser } } = await supabase.auth.getUser()
          if (updatedUser) {
            setUser(updatedUser)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user?.id])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      setSession(session)
      setUser(session?.user ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh session')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    user,
    session,
    loading,
    error,
    signOut,
    refreshSession
  }
}
