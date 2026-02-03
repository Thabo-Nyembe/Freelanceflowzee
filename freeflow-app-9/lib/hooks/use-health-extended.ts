'use client'

/**
 * Extended Health Hooks - Covers all Health check/status tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useHealthCheck(checkId?: string) {
  const [check, setCheck] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!checkId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('health_checks').select('*').eq('id', checkId).single()
      setCheck(data)
    } finally { setIsLoading(false) }
  }, [checkId])
  useEffect(() => { loadData() }, [loadData])
  return { check, isLoading, refresh: loadData }
}

export function useHealthChecks(options?: { serviceName?: string; checkType?: string; status?: string; isCritical?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('health_checks').select('*')
      if (options?.serviceName) query = query.eq('service_name', options.serviceName)
      if (options?.checkType) query = query.eq('check_type', options.checkType)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.isCritical !== undefined) query = query.eq('is_critical', options.isCritical)
      const { data: result } = await query.order('service_name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.serviceName, options?.checkType, options?.status, options?.isCritical])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useHealthCheckResults(checkId?: string, limit = 100) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!checkId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('health_check_results').select('*').eq('check_id', checkId).order('checked_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [checkId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSystemHealth(workspaceId?: string) {
  const [health, setHealth] = useState<{ status: string; summary: { healthy: number; unhealthy: number; degraded: number; unknown: number; total: number }; checks: any[] }>({ status: 'unknown', summary: { healthy: 0, unhealthy: 0, degraded: 0, unknown: 0, total: 0 }, checks: [] })
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('health_checks').select('*').eq('is_enabled', true)
      if (workspaceId) query = query.eq('workspace_id', workspaceId)
      const { data: checks } = await query
      const healthy = checks?.filter(c => c.status === 'healthy').length || 0
      const unhealthy = checks?.filter(c => c.status === 'unhealthy').length || 0
      const degraded = checks?.filter(c => c.status === 'degraded').length || 0
      const unknown = checks?.filter(c => c.status === 'unknown').length || 0
      const criticalUnhealthy = checks?.filter(c => c.is_critical && c.status === 'unhealthy').length || 0
      const overallStatus = criticalUnhealthy > 0 ? 'critical' : unhealthy > 0 ? 'unhealthy' : degraded > 0 ? 'degraded' : 'healthy'
      setHealth({ status: overallStatus, summary: { healthy, unhealthy, degraded, unknown, total: checks?.length || 0 }, checks: checks || [] })
    } finally { setIsLoading(false) }
  }, [workspaceId])
  useEffect(() => { loadData() }, [loadData])
  return { health, isLoading, refresh: loadData }
}

export function useServiceHealth(serviceName?: string) {
  const [health, setHealth] = useState<{ status: string; checks: any[] }>({ status: 'unknown', checks: [] })
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!serviceName) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: checks } = await supabase.from('health_checks').select('*').eq('service_name', serviceName).eq('is_enabled', true)
      const allHealthy = checks?.every(c => c.status === 'healthy')
      const anyUnhealthy = checks?.some(c => c.status === 'unhealthy')
      const status = anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded'
      setHealth({ status, checks: checks || [] })
    } finally { setIsLoading(false) }
  }, [serviceName])
  useEffect(() => { loadData() }, [loadData])
  return { health, isLoading, refresh: loadData }
}
