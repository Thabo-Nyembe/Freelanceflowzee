// Base hook for Supabase queries with real-time subscriptions
// Created: December 14, 2024

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { DEMO_USER_ID, isDemoModeEnabled } from '@/lib/hooks/use-demo-fetch'

// Module-level singleton for stable Supabase client reference
let supabaseClientSingleton: SupabaseClient | null = null
function getSupabaseClient(): SupabaseClient {
  if (!supabaseClientSingleton) {
    supabaseClientSingleton = createClient()
  }
  return supabaseClientSingleton
}

// Get user ID - returns demo user ID in demo mode
function getDemoAwareUserId(): string | null {
  if (isDemoModeEnabled()) {
    return DEMO_USER_ID
  }
  return null
}

// TanStack Query-style interface for custom query functions
interface UseSupabaseQueryWithFnOptions<T> {
  initialData?: T
  enabled?: boolean
}

type QueryFn<T> = (supabase: SupabaseClient) => Promise<T>

// Object-style options interface
interface UseSupabaseQueryOptionsObject<T> {
  table: string
  select?: string
  filters?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  realtime?: boolean
  softDelete?: boolean
}

// Overload for TanStack Query-style usage (queryKey, queryFn, options)
export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: QueryFn<T>,
  options?: UseSupabaseQueryWithFnOptions<T>
): { data: T | null; isLoading: boolean; error: Error | null; refetch: () => Promise<void> }

// Overload for object-style usage ({ table, select, ... })
export function useSupabaseQuery<T>(
  options: UseSupabaseQueryOptionsObject<T>
): { data: T[]; loading: boolean; error: Error | null; refetch: () => Promise<void> }

// Implementation that handles both overloads
export function useSupabaseQuery<T>(
  queryKeyOrOptions: string[] | UseSupabaseQueryOptionsObject<T>,
  queryFn?: QueryFn<T>,
  fnOptions?: UseSupabaseQueryWithFnOptions<T>
): { data: T | T[] | null; isLoading?: boolean; loading?: boolean; error: Error | null; refetch: () => Promise<void> } {
  // If first argument is an array, use TanStack Query-style
  if (Array.isArray(queryKeyOrOptions)) {
    return useSupabaseQueryWithFn<T>(queryKeyOrOptions, queryFn!, fnOptions)
  }
  // Otherwise use object-style
  return useSupabaseQueryWithOptions<T>(queryKeyOrOptions)
}

// TanStack Query-style implementation
function useSupabaseQueryWithFn<T>(
  queryKey: string[],
  queryFn: QueryFn<T>,
  options?: UseSupabaseQueryWithFnOptions<T>
): { data: T | null; isLoading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(options?.initialData ?? null)
  const [isLoading, setIsLoading] = useState(options?.enabled !== false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseClient()

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return

    setIsLoading(true)
    setError(null)

    try {
      // In demo mode, queries will use demo user ID through the API routes
      const result = await queryFn(supabase)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [queryFn, options?.enabled]) // supabase is stable singleton

  useEffect(() => {
    fetchData()
  }, [JSON.stringify(queryKey)])

  return { data, isLoading, error, refetch: fetchData }
}

// Object-style implementation (original behavior)
function useSupabaseQueryWithOptions<T>({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  realtime = true,
  softDelete = false // Default to false since most tables don't have deleted_at column
}: UseSupabaseQueryOptionsObject<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseClient()

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
                (item as { id?: string }).id === payload.new.id ? payload.new as T : item
              ))
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(item => (item as { id?: string }).id !== payload.old.id))
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

// Object-style options interface for mutations
interface UseSupabaseMutationOptionsObject {
  table: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

// Function-style options interface for mutations
interface UseSupabaseMutationWithFnOptions {
  invalidateKeys?: string[][]
  onSuccess?: () => void
  onError?: (error: Error) => void
}

type MutationFn<TInput, TOutput> = (supabase: SupabaseClient, data: TInput) => Promise<TOutput>

// Overload for function-style usage (mutationFn, options)
export function useSupabaseMutation<TInput, TOutput>(
  mutationFn: MutationFn<TInput, TOutput>,
  options?: UseSupabaseMutationWithFnOptions
): { mutate: (data: TInput) => Promise<TOutput | null>; isPending: boolean; error: Error | null }

// Overload for object-style usage ({ table, ... })
export function useSupabaseMutation<T = unknown>(
  options: UseSupabaseMutationOptionsObject
): { mutate: (data: Partial<T>, id?: string) => Promise<T | null>; remove: (id: string) => Promise<boolean>; loading: boolean; error: Error | null }

// Implementation that handles both overloads
export function useSupabaseMutation<TInput = unknown, TOutput = unknown>(
  mutationFnOrOptions: MutationFn<TInput, TOutput> | UseSupabaseMutationOptionsObject,
  fnOptions?: UseSupabaseMutationWithFnOptions
): {
  mutate: ((data: TInput) => Promise<TOutput | null>) | ((data: Partial<TInput>, id?: string) => Promise<TInput | null>)
  remove?: (id: string) => Promise<boolean>
  isPending?: boolean
  loading?: boolean
  error: Error | null
} {
  // If first argument is a function, use function-style
  if (typeof mutationFnOrOptions === 'function') {
    return useSupabaseMutationWithFn<TInput, TOutput>(mutationFnOrOptions, fnOptions)
  }
  // Otherwise use object-style
  return useSupabaseMutationWithOptions<TInput>(mutationFnOrOptions)
}

// Function-style mutation implementation
function useSupabaseMutationWithFn<TInput, TOutput>(
  mutationFn: MutationFn<TInput, TOutput>,
  options?: UseSupabaseMutationWithFnOptions
): { mutate: (data: TInput) => Promise<TOutput | null>; isPending: boolean; error: Error | null } {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseClient()

  const mutate = useCallback(async (data: TInput): Promise<TOutput | null> => {
    setIsPending(true)
    setError(null)

    try {
      const result = await mutationFn(supabase, data)
      options?.onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options?.onError?.(error)
      return null
    } finally {
      setIsPending(false)
    }
  }, [mutationFn, options]) // supabase is stable singleton

  return { mutate, isPending, error }
}

// Object-style mutation implementation (original behavior)
function useSupabaseMutationWithOptions<T>({
  table,
  onSuccess,
  onError
}: UseSupabaseMutationOptionsObject): {
  mutate: (data: Partial<T>, id?: string) => Promise<T | null>
  remove: (id: string) => Promise<boolean>
  loading: boolean
  error: Error | null
} {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = getSupabaseClient()

  const mutate = useCallback(async (data: Partial<T>, id?: string): Promise<T | null> => {
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
  }, [table, onSuccess, onError]) // supabase is stable singleton

  const remove = useCallback(async (id: string): Promise<boolean> => {
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
  }, [table, onSuccess, onError]) // supabase is stable singleton

  return { mutate, remove, loading, error }
}
