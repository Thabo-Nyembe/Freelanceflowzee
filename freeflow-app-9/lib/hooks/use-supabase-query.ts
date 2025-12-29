// Base hook for Supabase queries with real-time subscriptions
// Created: December 14, 2024

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UseSupabaseQueryOptions<T> {
  table: string
  select?: string
  filters?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  realtime?: boolean
  softDelete?: boolean // Set to false for tables without deleted_at column
}

export function useSupabaseQuery<T>({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  realtime = true,
  softDelete = true
}: UseSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        let query = supabase.from(table).select(select)

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== 'all') {
            query = query.eq(key, value)
          }
        })

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit)
        }

        // Filter out soft deletes (only for tables with deleted_at column)
        if (softDelete) {
          query = query.is('deleted_at', null)
        }

        const { data: result, error: queryError } = await query

        if (queryError) throw queryError
        setData((result as T[]) || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription
    if (realtime) {
      const channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData(prev => [payload.new as T, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map(item =>
                (item as any).id === payload.new.id ? payload.new as T : item
              ))
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(item => (item as any).id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [table, JSON.stringify(filters), orderBy?.column, orderBy?.ascending, limit, realtime])

  const refetch = async () => {
    try {
      setLoading(true)
      let query = supabase.from(table).select(select)

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') {
          query = query.eq(key, value)
        }
      })

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
      }

      if (limit) {
        query = query.limit(limit)
      }

      // Filter out soft deletes (only for tables with deleted_at column)
      if (softDelete) {
        query = query.is('deleted_at', null)
      }

      const { data: result, error: queryError } = await query

      if (queryError) throw queryError
      setData((result as T[]) || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

// Mutation hook for create/update/delete operations
interface UseSupabaseMutationOptions {
  table: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useSupabaseMutation<T = unknown>({
  table,
  onSuccess,
  onError
}: UseSupabaseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  const mutate = async (data: Partial<T>, id?: string): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let result
      if (id) {
        // Update existing record
        const { data: updateResult, error: updateError } = await supabase
          .from(table)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) throw new Error(updateError.message)
        result = updateResult
      } else {
        // Create new record
        const { data: insertResult, error: insertError } = await supabase
          .from(table)
          .insert({ ...data, user_id: user.id })
          .select()
          .single()

        if (insertError) throw new Error(insertError.message)
        result = insertResult
      }

      onSuccess?.()
      return result as T
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Soft delete
      const { error: deleteError } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw new Error(deleteError.message)

      onSuccess?.()
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { mutate, remove, loading, error }
}
