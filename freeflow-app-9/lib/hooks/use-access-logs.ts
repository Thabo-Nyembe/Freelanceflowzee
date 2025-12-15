'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface AccessLog {
  id: string
  user_id: string | null
  log_code: string
  user_name: string | null
  user_email: string | null
  access_type: string
  status: string
  resource: string | null
  method: string
  status_code: number
  ip_address: string | null
  location: string | null
  device_type: string
  browser: string | null
  user_agent: string | null
  duration: number
  is_suspicious: boolean
  threat_level: string
  blocked_reason: string | null
  metadata: Record<string, any>
  created_at: string
}

interface AccessLogFilters {
  status?: string
  accessType?: string
  isSuspicious?: boolean
}

export function useAccessLogs(initialLogs: AccessLog[] = [], filters: AccessLogFilters = {}) {
  const supabase = createClientComponentClient()
  const [logs, setLogs] = useState<AccessLog[]>(initialLogs)
  const [isLoading, setIsLoading] = useState(false)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    let query = supabase
      .from('access_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.accessType) {
      query = query.eq('access_type', filters.accessType)
    }
    if (filters.isSuspicious !== undefined) {
      query = query.eq('is_suspicious', filters.isSuspicious)
    }

    const { data, error } = await query.limit(200)
    if (!error && data) {
      setLogs(data)
    }
    setIsLoading(false)
  }, [supabase, filters.status, filters.accessType, filters.isSuspicious])

  useEffect(() => {
    if (initialLogs.length === 0) {
      fetchLogs()
    }
  }, [fetchLogs, initialLogs.length])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('access_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'access_logs' }, (payload) => {
        setLogs(prev => [payload.new as AccessLog, ...prev].slice(0, 200))
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
    blocked: logs.filter(l => l.status === 'blocked').length,
    suspicious: logs.filter(l => l.is_suspicious).length,
    avgDuration: logs.length > 0 ? logs.reduce((sum, l) => sum + l.duration, 0) / logs.length : 0,
    successRate: logs.length > 0 ? (logs.filter(l => l.status === 'success').length / logs.length) * 100 : 0
  }

  return { logs, stats, isLoading, refetch: fetchLogs }
}

export function getAccessStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'failed': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    case 'blocked': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    case 'suspicious': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function getAccessTypeColor(type: string): string {
  switch (type) {
    case 'login': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'api': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    case 'admin': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    case 'file-access': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'database': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    case 'system': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function formatAccessTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
