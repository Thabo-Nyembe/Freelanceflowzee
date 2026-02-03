'use client'

/**
 * Extended Debug Hooks - Covers all Debug/Debugging tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDebugSession(sessionId?: string) {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('debug_sessions').select('*').eq('id', sessionId).single()
      setSession(data)
    } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { loadData() }, [loadData])
  return { session, isLoading, refresh: loadData }
}

export function useDebugSessions(options?: { sessionType?: string; status?: string; userId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('debug_sessions').select('*')
      if (options?.sessionType) query = query.eq('session_type', options.sessionType)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.userId) query = query.eq('user_id', options.userId)
      const { data: result } = await query.order('started_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.sessionType, options?.status, options?.userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDebugLogs(sessionId?: string, level?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('debug_logs').select('*').eq('session_id', sessionId)
      if (level) query = query.eq('level', level)
      const { data: result } = await query.order('timestamp', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [sessionId, level])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useBreakpoints(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('debug_breakpoints').select('*').eq('session_id', sessionId).order('file_path', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDebugSnapshots(sessionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!sessionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('debug_snapshots').select('*').eq('session_id', sessionId).order('captured_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [sessionId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
