'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

export interface ActivityLog {
  id: string
  user_id: string | null
  activity_code: string
  user_name: string | null
  user_email: string | null
  activity_type: string
  category: string
  status: string
  action: string
  resource_type: string | null
  resource_id: string | null
  resource_name: string | null
  changes: Array<{
    field: string
    oldValue: string
    newValue: string
  }>
  old_values: Record<string, JsonValue>
  new_values: Record<string, JsonValue>
  ip_address: string | null
  user_agent: string | null
  duration: number
  metadata: Record<string, JsonValue>
  created_at: string
}

interface ActivityLogFilters {
  status?: string
  activityType?: string
  category?: string
}

export function useActivityLogs(initialLogs: ActivityLog[] = [], filters: ActivityLogFilters = {}) {
  const supabase = createClient()
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.activityType) {
      query = query.eq('activity_type', filters.activityType)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error: fetchError } = await query.limit(200)
    if (fetchError) {
      setError(new Error(fetchError.message))
    } else if (data) {
      setLogs(data)
    }
    setIsLoading(false)
  }, [supabase, filters.status, filters.activityType, filters.category])

  useEffect(() => {
    if (initialLogs.length === 0) {
      fetchLogs()
    }
  }, [fetchLogs, initialLogs.length])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setLogs(prev => [payload.new as ActivityLog, ...prev].slice(0, 200))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Calculate stats
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    pending: logs.filter(l => l.status === 'pending').length,
    creates: logs.filter(l => l.activity_type === 'create').length,
    updates: logs.filter(l => l.activity_type === 'update').length,
    deletes: logs.filter(l => l.activity_type === 'delete').length,
    avgDuration: logs.length > 0 ? logs.reduce((sum, l) => sum + l.duration, 0) / logs.length : 0,
    successRate: logs.length > 0 ? (logs.filter(l => l.status === 'success').length / logs.length) * 100 : 0
  }

  return { logs, stats, isLoading, error, refetch: fetchLogs }
}

export function getActivityStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'failed': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function getActivityTypeColor(type: string): string {
  switch (type) {
    case 'create': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'update': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'delete': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    case 'view': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    case 'login': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
    case 'logout': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    case 'export': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    case 'import': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'user': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    case 'content': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    case 'settings': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    case 'file': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    case 'api': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
    case 'admin': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  }
}

export function formatActivityTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
