'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Time-off types
export type TimeOffType = 'vacation' | 'sick' | 'personal' | 'holiday' | 'remote'
export type TimeOffStatus = 'approved' | 'pending' | 'rejected'

export interface TimeOff {
  id: string
  user_id: string
  resource_id: string
  resource_name: string
  resource_avatar: string | null
  type: TimeOffType
  start_date: string
  end_date: string
  hours: number
  status: TimeOffStatus
  notes: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TimeOffFilters {
  status?: TimeOffStatus
  type?: TimeOffType
  resourceId?: string
  startDate?: string
  endDate?: string
}

export interface TimeOffStats {
  total: number
  approved: number
  pending: number
  rejected: number
  totalHours: number
  vacationHours: number
  sickHours: number
  personalHours: number
}

export function useTimeOff(initialTimeOff: TimeOff[] = [], filters: TimeOffFilters = {}) {
  const [timeOff, setTimeOff] = useState<TimeOff[]>(initialTimeOff)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchTimeOff = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Note: The time_off table may not exist yet. This hook is designed to work
      // gracefully when the table doesn't exist, returning an empty array.
      let query = supabase
        .from('time_off')
        .select('*')
        .is('deleted_at', null)
        .order('start_date', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.resourceId) {
        query = query.eq('resource_id', filters.resourceId)
      }
      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate)
      }

      const { data, error: queryError } = await query.limit(200)

      if (queryError) {
        // If table doesn't exist, return empty array gracefully
        if (queryError.code === '42P01' || queryError.message.includes('does not exist')) {
          console.warn('time_off table does not exist yet. Using empty data.')
          setTimeOff([])
          return
        }
        throw queryError
      }

      setTimeOff(data || [])
    } catch (err) {
      // Gracefully handle missing table
      if ((err as any)?.code === '42P01') {
        console.warn('time_off table does not exist yet. Using empty data.')
        setTimeOff([])
        setError(null)
      } else {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, filters])

  useEffect(() => {
    fetchTimeOff()

    // Set up real-time subscription (will fail gracefully if table doesn't exist)
    const channel = supabase
      .channel('time_off_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_off' },
        () => fetchTimeOff()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchTimeOff])

  const stats: TimeOffStats = useMemo(() => {
    const list = timeOff || []

    return {
      total: list.length,
      approved: list.filter(t => t.status === 'approved').length,
      pending: list.filter(t => t.status === 'pending').length,
      rejected: list.filter(t => t.status === 'rejected').length,
      totalHours: list.reduce((sum, t) => sum + (t.hours || 0), 0),
      vacationHours: list.filter(t => t.type === 'vacation').reduce((sum, t) => sum + (t.hours || 0), 0),
      sickHours: list.filter(t => t.type === 'sick').reduce((sum, t) => sum + (t.hours || 0), 0),
      personalHours: list.filter(t => t.type === 'personal').reduce((sum, t) => sum + (t.hours || 0), 0)
    }
  }, [timeOff])

  return { timeOff: timeOff || [], stats, isLoading, error, refetch: fetchTimeOff }
}

export function useTimeOffMutations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const createTimeOff = useCallback(async (data: Partial<TimeOff>) => {
    setIsCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('time_off')
        .insert({
          ...data,
          user_id: user.id,
          status: data.status || 'pending'
        })
        .select()
        .single()

      if (error) {
        if (error.code === '42P01') {
          throw new Error('Time-off table is not yet available. Please contact admin.')
        }
        throw error
      }
      return result
    } finally {
      setIsCreating(false)
    }
  }, [supabase])

  const updateTimeOff = useCallback(async (id: string, updates: Partial<TimeOff>) => {
    setIsUpdating(true)
    try {
      const { data, error } = await supabase
        .from('time_off')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } finally {
      setIsUpdating(false)
    }
  }, [supabase])

  const deleteTimeOff = useCallback(async (id: string) => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('time_off')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    } finally {
      setIsDeleting(false)
    }
  }, [supabase])

  const approveTimeOff = useCallback(async (id: string, approvedBy: string) => {
    setIsUpdating(true)
    try {
      const { data, error } = await supabase
        .from('time_off')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } finally {
      setIsUpdating(false)
    }
  }, [supabase])

  const rejectTimeOff = useCallback(async (id: string) => {
    setIsUpdating(true)
    try {
      const { data, error } = await supabase
        .from('time_off')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } finally {
      setIsUpdating(false)
    }
  }, [supabase])

  return {
    createTimeOff,
    updateTimeOff,
    deleteTimeOff,
    approveTimeOff,
    rejectTimeOff,
    isCreating,
    isUpdating,
    isDeleting
  }
}

// Helper functions for time-off display
export function getTimeOffTypeColor(type: TimeOffType): string {
  switch (type) {
    case 'vacation': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'sick': return 'bg-red-100 text-red-800 border-red-200'
    case 'personal': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'holiday': return 'bg-green-100 text-green-800 border-green-200'
    case 'remote': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getTimeOffStatusColor(status: TimeOffStatus): string {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function calculateTimeOffHours(startDate: string, endDate: string, hoursPerDay = 8): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Include both start and end days
  return diffDays * hoursPerDay
}
