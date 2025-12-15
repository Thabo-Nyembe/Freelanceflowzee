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
}

export function useSupabaseQuery<T>({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  realtime = true
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

        // Filter out soft deletes
        query = query.is('deleted_at', null)

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

      query = query.is('deleted_at', null)

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
