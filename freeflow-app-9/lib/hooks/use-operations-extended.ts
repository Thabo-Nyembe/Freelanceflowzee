'use client'

/**
 * Extended Operations Hooks
 * Tables: operations, operation_logs, operation_steps, operation_schedules, operation_metrics, operation_alerts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOperation(operationId?: string) {
  const [operation, setOperation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!operationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('operations').select('*, operation_logs(*), operation_steps(*), operation_metrics(*)').eq('id', operationId).single(); setOperation(data) } finally { setIsLoading(false) }
  }, [operationId])
  useEffect(() => { loadData() }, [loadData])
  return { operation, isLoading, refresh: loadData }
}

export function useOperations(options?: { organization_id?: string; owner_id?: string; type?: string; status?: string; limit?: number }) {
  const [operations, setOperations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('operations').select('*')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setOperations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.owner_id, options?.type, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { operations, isLoading, refresh: loadData }
}

export function useRunningOperations(organizationId?: string) {
  const [operations, setOperations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('operations').select('*, operation_steps(*)').eq('status', 'running')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('started_at', { ascending: false })
      setOperations(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { operations, isLoading, refresh: loadData }
}

export function useOperationLogs(operationId?: string, options?: { level?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!operationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('operation_logs').select('*').eq('operation_id', operationId)
      if (options?.level) query = query.eq('level', options.level)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [operationId, options?.level, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { logs, isLoading, refresh: loadData }
}

export function useOperationSteps(operationId?: string) {
  const [steps, setSteps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!operationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('operation_steps').select('*').eq('operation_id', operationId).order('order', { ascending: true }); setSteps(data || []) } finally { setIsLoading(false) }
  }, [operationId])
  useEffect(() => { loadData() }, [loadData])
  return { steps, isLoading, refresh: loadData }
}

export function useOperationSchedules(organizationId?: string) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('operation_schedules').select('*, operations(*)')
      if (organizationId) query = query.eq('operations.organization_id', organizationId)
      const { data } = await query.eq('is_active', true).order('next_run_at', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { schedules, isLoading, refresh: loadData }
}

export function useOperationMetrics(operationId?: string) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!operationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('operation_metrics').select('*').eq('operation_id', operationId).order('recorded_at', { ascending: false }); setMetrics(data || []) } finally { setIsLoading(false) }
  }, [operationId])
  useEffect(() => { loadData() }, [loadData])
  return { metrics, isLoading, refresh: loadData }
}

export function useOperationAlerts(operationId?: string, options?: { status?: string }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!operationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('operation_alerts').select('*').eq('operation_id', operationId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [operationId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { alerts, isLoading, refresh: loadData }
}

export function useRecentOperations(organizationId?: string, options?: { limit?: number }) {
  const [operations, setOperations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('operations').select('*')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 10)
      setOperations(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { operations, isLoading, refresh: loadData }
}

export function useOperationStats(organizationId?: string) {
  const [stats, setStats] = useState<{ total: number; running: number; completed: number; failed: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('operations').select('status')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query
      const total = data?.length || 0
      const running = data?.filter(o => o.status === 'running').length || 0
      const completed = data?.filter(o => o.status === 'completed').length || 0
      const failed = data?.filter(o => o.status === 'failed').length || 0
      setStats({ total, running, completed, failed })
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
