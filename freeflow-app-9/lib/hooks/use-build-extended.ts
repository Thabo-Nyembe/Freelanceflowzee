'use client'

/**
 * Extended Build Hooks - Covers all Build-related tables
 * Tables: builds, build_logs, build_artifacts, build_configs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBuild(buildId?: string) {
  const [build, setBuild] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!buildId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('builds').select('*, build_logs(*), build_artifacts(*)').eq('id', buildId).single()
      setBuild(data)
    } finally { setIsLoading(false) }
  }, [buildId])
  useEffect(() => { fetch() }, [fetch])
  return { build, isLoading, refresh: fetch }
}

export function useBuilds(projectId?: string, options?: { status?: string; branch?: string; environment?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('builds').select('*').eq('project_id', projectId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.branch) query = query.eq('branch', options.branch)
      if (options?.environment) query = query.eq('environment', options.environment)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.status, options?.branch, options?.environment, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLatestBuild(projectId?: string, options?: { branch?: string; environment?: string }) {
  const [build, setBuild] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('builds').select('*').eq('project_id', projectId)
      if (options?.branch) query = query.eq('branch', options.branch)
      if (options?.environment) query = query.eq('environment', options.environment)
      const { data } = await query.order('created_at', { ascending: false }).limit(1).single()
      setBuild(data)
    } finally { setIsLoading(false) }
  }, [projectId, options?.branch, options?.environment, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { build, isLoading, refresh: fetch }
}

export function useBuildLogs(buildId?: string, options?: { level?: string; step?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!buildId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('build_logs').select('*').eq('build_id', buildId)
      if (options?.level) query = query.eq('level', options.level)
      if (options?.step) query = query.eq('step', options.step)
      const { data: result } = await query.order('timestamp', { ascending: true }).limit(options?.limit || 1000)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [buildId, options?.level, options?.step, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBuildLogsRealtime(buildId?: string) {
  const [logs, setLogs] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!buildId) return
    supabase.from('build_logs').select('*').eq('build_id', buildId).order('timestamp', { ascending: true }).then(({ data }) => setLogs(data || []))
    const channel = supabase.channel(`build_logs_${buildId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'build_logs', filter: `build_id=eq.${buildId}` }, (payload) => setLogs(prev => [...prev, payload.new]))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [buildId])
  return { logs }
}

export function useBuildArtifacts(buildId?: string, options?: { type?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!buildId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('build_artifacts').select('*').eq('build_id', buildId)
      if (options?.type) query = query.eq('type', options.type)
      const { data: result } = await query.order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [buildId, options?.type, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBuildConfig(projectId?: string) {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('build_configs').select('*').eq('project_id', projectId).single()
      setConfig(data)
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { config, isLoading, refresh: fetch }
}

export function useBuildStats(projectId?: string, options?: { startDate?: string; endDate?: string }) {
  const [stats, setStats] = useState<{ total: number; success: number; failed: number; cancelled: number; avgDuration: number; successRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('builds').select('status, duration_ms, created_at').eq('project_id', projectId)
      if (options?.startDate) query = query.gte('created_at', options.startDate)
      if (options?.endDate) query = query.lte('created_at', options.endDate)
      const { data: builds } = await query
      if (!builds || builds.length === 0) { setStats(null); return }
      const total = builds.length
      const success = builds.filter(b => b.status === 'success').length
      const failed = builds.filter(b => b.status === 'failed').length
      const cancelled = builds.filter(b => b.status === 'cancelled').length
      const durations = builds.filter(b => b.duration_ms).map(b => b.duration_ms)
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
      const successRate = total > 0 ? (success / total) * 100 : 0
      setStats({ total, success, failed, cancelled, avgDuration, successRate })
    } finally { setIsLoading(false) }
  }, [projectId, options?.startDate, options?.endDate, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useBuildRealtime(buildId?: string) {
  const [build, setBuild] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!buildId) return
    supabase.from('builds').select('*').eq('id', buildId).single().then(({ data }) => setBuild(data))
    const channel = supabase.channel(`build_${buildId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'builds', filter: `id=eq.${buildId}` }, (payload) => setBuild(payload.new))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [buildId])
  return { build }
}

export function useRunningBuilds(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('builds').select('*').eq('project_id', projectId).in('status', ['pending', 'running']).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBuildsByBranch(projectId?: string) {
  const [branches, setBranches] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: builds } = await supabase.from('builds').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(100)
      const grouped = (builds || []).reduce((acc: Record<string, any[]>, build) => {
        const branch = build.branch || 'unknown'
        if (!acc[branch]) acc[branch] = []
        acc[branch].push(build)
        return acc
      }, {})
      setBranches(grouped)
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { branches, isLoading, refresh: fetch }
}
