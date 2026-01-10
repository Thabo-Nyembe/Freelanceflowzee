'use client'

/**
 * Extended Script Hooks - Covers all Script-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useScript(scriptId?: string) {
  const [script, setScript] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scriptId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('scripts').select('*').eq('id', scriptId).single()
      setScript(data)
    } finally { setIsLoading(false) }
  }, [scriptId])
  useEffect(() => { fetch() }, [fetch])
  return { script, isLoading, refresh: fetch }
}

export function useScripts(options?: { scriptType?: string; language?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scripts').select('*')
      if (options?.scriptType) query = query.eq('script_type', options.scriptType)
      if (options?.language) query = query.eq('language', options.language)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.scriptType, options?.language, options?.isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useScriptExecutions(scriptId?: string, limit = 50) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scriptId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('script_executions').select('*').eq('script_id', scriptId).order('executed_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [scriptId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useActiveScripts(scriptType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('scripts').select('*').eq('is_active', true)
      if (scriptType) query = query.eq('script_type', scriptType)
      const { data: result } = await query.order('execution_count', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [scriptType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useScriptStats(scriptId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scriptId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: executions } = await supabase.from('script_executions').select('status, duration_ms').eq('script_id', scriptId)
      const total = executions?.length || 0
      const successful = executions?.filter(e => e.status === 'success').length || 0
      const avgDuration = total > 0 ? executions!.reduce((acc, e) => acc + (e.duration_ms || 0), 0) / total : 0
      setStats({ total, successful, failed: total - successful, successRate: total > 0 ? (successful / total) * 100 : 0, avgDuration })
    } finally { setIsLoading(false) }
  }, [scriptId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
