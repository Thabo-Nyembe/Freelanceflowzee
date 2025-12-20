'use client'

/**
 * Extended Trace Hooks - Covers all Trace/Tracing tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTrace(traceId?: string) {
  const [trace, setTrace] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!traceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('traces').select('*').eq('id', traceId).single()
      setTrace(data)
    } finally { setIsLoading(false) }
  }, [traceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { trace, isLoading, refresh: fetch }
}

export function useTraces(options?: { serviceName?: string; operationName?: string; status?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('traces').select('*')
      if (options?.serviceName) query = query.eq('service_name', options.serviceName)
      if (options?.operationName) query = query.eq('operation_name', options.operationName)
      if (options?.status) query = query.eq('status', options.status)
      const { data: result } = await query.order('started_at', { ascending: false }).limit(options?.limit || 100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.serviceName, options?.operationName, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTraceSpans(traceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!traceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('trace_spans').select('*').eq('trace_id', traceId).order('started_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [traceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useTraceTree(traceId?: string) {
  const [data, setData] = useState<{ trace: any; spans: any[] }>({ trace: null, spans: [] })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!traceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: trace } = await supabase.from('traces').select('*').eq('trace_id', traceId).single()
      const { data: spans } = await supabase.from('trace_spans').select('*').eq('trace_id', trace?.id).order('started_at', { ascending: true })
      setData({ trace, spans: spans || [] })
    } finally { setIsLoading(false) }
  }, [traceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { ...data, isLoading, refresh: fetch }
}
