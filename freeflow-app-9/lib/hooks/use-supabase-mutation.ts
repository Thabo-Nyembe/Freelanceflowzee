// Base hook for Supabase mutations (Create, Update, Delete)
// Created: December 14, 2024

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

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
  const supabase = createClientComponentClient()

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
            id: (payload.new as any)?.id || (payload.old as any)?.id,
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
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
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
