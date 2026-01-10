'use client'

/**
 * Extended Bulk Hooks - Covers all Bulk operation tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBulkOperation(operationId?: string) {
  const [operation, setOperation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!operationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('bulk_operations').select('*').eq('id', operationId).single()
      setOperation(data)
    } finally { setIsLoading(false) }
  }, [operationId])
  useEffect(() => { fetch() }, [fetch])
  return { operation, isLoading, refresh: fetch }
}

export function useBulkOperations(options?: { operationType?: string; entityType?: string; status?: string; userId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('bulk_operations').select('*')
      if (options?.operationType) query = query.eq('operation_type', options.operationType)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.userId) query = query.eq('user_id', options.userId)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.operationType, options?.entityType, options?.status, options?.userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBulkOperationLogs(operationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!operationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('bulk_operation_logs').select('*').eq('operation_id', operationId).order('processed_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [operationId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBulkOperationProgress(operationId?: string) {
  const [progress, setProgress] = useState<{ total: number; success: number; failure: number; percentage: number }>({ total: 0, success: 0, failure: 0, percentage: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!operationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('bulk_operations').select('total_count, success_count, failure_count').eq('id', operationId).single()
      if (data) {
        const processed = data.success_count + data.failure_count
        const percentage = data.total_count > 0 ? Math.round((processed / data.total_count) * 100) : 0
        setProgress({ total: data.total_count, success: data.success_count, failure: data.failure_count, percentage })
      }
    } finally { setIsLoading(false) }
  }, [operationId])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}
