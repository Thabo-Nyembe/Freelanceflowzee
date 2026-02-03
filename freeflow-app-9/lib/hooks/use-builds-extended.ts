'use client'

/**
 * Extended Builds Hooks
 * Tables: builds, build_logs, build_artifacts, build_configs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBuild(buildId?: string) {
  const [build, setBuild] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!buildId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('builds').select('*, build_logs(*), build_artifacts(*)').eq('id', buildId).single(); setBuild(data) } finally { setIsLoading(false) }
  }, [buildId])
  useEffect(() => { loadData() }, [loadData])
  return { build, isLoading, refresh: loadData }
}

export function useBuilds(options?: { project_id?: string; status?: string; branch?: string; triggered_by?: string; limit?: number }) {
  const [builds, setBuilds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('builds').select('*')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.branch) query = query.eq('branch', options.branch)
      if (options?.triggered_by) query = query.eq('triggered_by', options.triggered_by)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setBuilds(data || [])
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.status, options?.branch, options?.triggered_by, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { builds, isLoading, refresh: loadData }
}

export function useBuildLogs(buildId?: string) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!buildId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('build_logs').select('*').eq('build_id', buildId).order('timestamp', { ascending: true }); setLogs(data || []) } finally { setIsLoading(false) }
  }, [buildId])
  useEffect(() => { loadData() }, [loadData])
  return { logs, isLoading, refresh: loadData }
}

export function useBuildArtifacts(buildId?: string) {
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!buildId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('build_artifacts').select('*').eq('build_id', buildId).order('created_at', { ascending: false }); setArtifacts(data || []) } finally { setIsLoading(false) }
  }, [buildId])
  useEffect(() => { loadData() }, [loadData])
  return { artifacts, isLoading, refresh: loadData }
}

export function useBuildConfigs(projectId?: string) {
  const [configs, setConfigs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('build_configs').select('*').eq('project_id', projectId).eq('is_active', true).order('name', { ascending: true }); setConfigs(data || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { configs, isLoading, refresh: loadData }
}

export function useRecentBuilds(projectId?: string, limit?: number) {
  const [builds, setBuilds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('builds').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(limit || 10); setBuilds(data || []) } finally { setIsLoading(false) }
  }, [projectId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { builds, isLoading, refresh: loadData }
}

export function useBuildRealtime(buildId?: string) {
  const [build, setBuild] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!buildId) return
    supabase.from('builds').select('*').eq('id', buildId).single().then(({ data }) => setBuild(data))
    supabase.from('build_logs').select('*').eq('build_id', buildId).order('timestamp', { ascending: true }).then(({ data }) => setLogs(data || []))
    const channel = supabase.channel(`build_${buildId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'builds', filter: `id=eq.${buildId}` }, (payload) => {
        setBuild(payload.new)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'build_logs', filter: `build_id=eq.${buildId}` }, (payload) => {
        setLogs(prev => [...prev, payload.new])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [buildId])
  return { build, logs }
}

export function useBuildStats(projectId?: string) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; successRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('builds').select('status').eq('project_id', projectId)
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, b) => { acc[b.status || 'unknown'] = (acc[b.status || 'unknown'] || 0) + 1; return acc }, {})
      const successCount = byStatus['success'] || 0
      const failedCount = byStatus['failed'] || 0
      const successRate = (successCount + failedCount) > 0 ? (successCount / (successCount + failedCount)) * 100 : 0
      setStats({ total, byStatus, successRate })
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
