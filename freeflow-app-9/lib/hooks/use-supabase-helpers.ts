'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Generic query hook for fetching data from Supabase
export interface UseSupabaseQueryOptions<T> {
  table: string
  select?: string
  filters?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  enabled?: boolean
  initialData?: T[]
}

export interface UseSupabaseQueryResult<T> {
  data: T[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useSupabaseQuery<T = unknown>(
  options: UseSupabaseQueryOptions<T>
): UseSupabaseQueryResult<T> {
  const {
    table,
    select = '*',
    filters = {},
    orderBy,
    limit,
    enabled = true,
    initialData = []
  } = options

  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      let query = supabase.from(table).select(select)

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
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

      // Filter out deleted items
      query = query.is('deleted_at', null)

      const { data: result, error: queryError } = await query

      if (queryError) {
        throw new Error(queryError.message)
      }

      setData((result as T[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [supabase, table, select, filters, orderBy, limit, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  }
}

// Generic mutation hook for creating, updating, or deleting data in Supabase
export interface UseSupabaseMutationOptions {
  table: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface UseSupabaseMutationResult<T> {
  mutate: (data: Partial<T>, id?: string) => Promise<T | null>
  remove: (id: string) => Promise<boolean>
  isLoading: boolean
  error: Error | null
}

export function useSupabaseMutation<T = unknown>(
  options: UseSupabaseMutationOptions
): UseSupabaseMutationResult<T> {
  const { table, onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const mutate = useCallback(async (data: Partial<T>, id?: string): Promise<T | null> => {
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }, [supabase, table, onSuccess, onError])

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
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
      setIsLoading(false)
    }
  }, [supabase, table, onSuccess, onError])

  return {
    mutate,
    remove,
    isLoading,
    error
  }
}

// Real-time subscription hook
export interface UseRealtimeOptions {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onUpdate?: (payload: unknown) => void
  enabled?: boolean
}

export function useRealtimeSubscription(options: UseRealtimeOptions): void {
  const { table, event = '*', filter, onUpdate, enabled = true } = options

  const supabase = createClient()

  useEffect(() => {
    if (!enabled || !onUpdate) return

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          onUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, table, event, filter, onUpdate, enabled])
}

// Pagination hook
export interface UsePaginationOptions {
  initialPage?: number
  pageSize?: number
}

export interface UsePaginationResult {
  page: number
  pageSize: number
  offset: number
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const { initialPage = 1, pageSize = 10 } = options
  const [page, setPage] = useState(initialPage)

  const offset = (page - 1) * pageSize

  const nextPage = useCallback(() => setPage(p => p + 1), [])
  const prevPage = useCallback(() => setPage(p => Math.max(1, p - 1)), [])
  const goToPage = useCallback((newPage: number) => setPage(Math.max(1, newPage)), [])

  return {
    page,
    pageSize,
    offset,
    setPage,
    nextPage,
    prevPage,
    goToPage
  }
}
