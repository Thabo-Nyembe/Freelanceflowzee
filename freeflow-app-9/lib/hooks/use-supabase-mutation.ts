// Base hook for Supabase mutations (Create, Update, Delete)
// Created: December 14, 2024

'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Demo mode detection
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
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

interface UseSupabaseMutationOptions {
  table: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  enableRealtime?: boolean // Optional: enable realtime notifications for this table
  onRealtimeUpdate?: (payload: any) => void // Callback when realtime update occurs
}

export function useSupabaseMutation({
  table,
  onSuccess,
  onError,
  enableRealtime = false,
  onRealtimeUpdate
}: UseSupabaseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [lastMutation, setLastMutation] = useState<{ type: string; id?: string; timestamp: number } | null>(null)
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)
  const isDemo = useMemo(() => isDemoModeEnabled(), [])

  useEffect(() => {
    // In demo mode, create mock session
    if (isDemo) {
      setSession({ user: { id: DEMO_USER_ID, authId: DEMO_USER_ID } })
      return
    }
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => setSession({}))
  }, [isDemo])

  // Get user ID from NextAuth session or Supabase auth
  // IMPORTANT: financial_transactions has FK to auth.users, not public.users
  // So we need to get the auth.users ID from the session's authId field
  const getUserId = async (): Promise<string | null> => {
    // Demo mode - return demo user ID
    if (isDemo) return DEMO_USER_ID

    // First try Supabase auth (this gives us auth.users ID directly)
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      return user.id
    }

    // Try authId from NextAuth session (set by auth.config.ts from profiles table)
    // This is the auth.users-compatible ID for Supabase FK constraints
    const authId = (session?.user as { authId?: string })?.authId
    if (authId) {
      return authId
    }

    // Fallback: try NextAuth session user.id if it's a valid UUID
    // Note: This may fail FK constraints if the ID is from public.users
    if (session?.user?.id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(session.user.id)) {
        console.log('Warning: Using public.users ID, may fail FK constraints')
        return session.user.id
      }
    }

    return null
  }

  // Realtime subscription for mutation confirmations
  useEffect(() => {
    if (!enableRealtime) return

    const channel = supabase
      .channel(`mutation-${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          // Track realtime updates
          setLastMutation({
            type: payload.eventType,
            id: (payload.new as Record<string, unknown>)?.id || (payload.old as Record<string, unknown>)?.id,
            timestamp: Date.now()
          })

          // Call the callback if provided
          if (onRealtimeUpdate) {
            onRealtimeUpdate(payload)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, table, enableRealtime, onRealtimeUpdate])

  const create = async <T extends Record<string, any>>(data: T) => {
    try {
      setLoading(true)

      // Get user ID and add to data if not already present
      const dataWithUser = { ...data }
      if (!dataWithUser.user_id) {
        const userId = await getUserId()
        if (!userId) {
          throw new Error('User not authenticated')
        }
        dataWithUser.user_id = userId
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert(dataWithUser)
        .select()
        .single()

      if (error) throw error

      toast.success('Created successfully')
      onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const update = async <T extends Record<string, any>>(id: string, data: T) => {
    try {
      setLoading(true)
      const { data: result, error } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast.success('Updated successfully')
      onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string, hardDelete = false) => {
    try {
      setLoading(true)

      if (hardDelete) {
        // Permanent deletion
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)

        if (error) throw error
      } else {
        // Soft delete
        const { error } = await supabase
          .from(table)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error
      }

      toast.success('Deleted successfully')
      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { create, update, remove, loading, lastMutation }
}
