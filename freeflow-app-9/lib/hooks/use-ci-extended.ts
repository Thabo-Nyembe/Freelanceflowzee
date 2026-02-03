'use client'

/**
 * Extended CI/CD Hooks
 * Tables: ci_pipelines, ci_stages, ci_jobs, ci_artifacts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePipeline(pipelineId?: string) {
  const [pipeline, setPipeline] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ci_pipelines').select('*, ci_stages(*, ci_jobs(*))').eq('id', pipelineId).single(); setPipeline(data) } finally { setIsLoading(false) }
  }, [pipelineId])
  useEffect(() => { loadData() }, [loadData])
  return { pipeline, isLoading, refresh: loadData }
}

export function usePipelines(options?: { project_id?: string; status?: string; branch?: string; limit?: number }) {
  const [pipelines, setPipelines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ci_pipelines').select('*')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.branch) query = query.eq('branch', options.branch)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPipelines(data || [])
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.status, options?.branch, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { pipelines, isLoading, refresh: loadData }
}

export function usePipelineStages(pipelineId?: string) {
  const [stages, setStages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ci_stages').select('*, ci_jobs(*)').eq('pipeline_id', pipelineId).order('position', { ascending: true }); setStages(data || []) } finally { setIsLoading(false) }
  }, [pipelineId])
  useEffect(() => { loadData() }, [loadData])
  return { stages, isLoading, refresh: loadData }
}

export function usePipelineJobs(pipelineId?: string, stageId?: string) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('ci_jobs').select('*').eq('pipeline_id', pipelineId)
      if (stageId) query = query.eq('stage_id', stageId)
      const { data } = await query.order('created_at', { ascending: true })
      setJobs(data || [])
    } finally { setIsLoading(false) }
  }, [pipelineId, stageId])
  useEffect(() => { loadData() }, [loadData])
  return { jobs, isLoading, refresh: loadData }
}

export function useJobArtifacts(jobId?: string) {
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ci_artifacts').select('*').eq('job_id', jobId).order('created_at', { ascending: false }); setArtifacts(data || []) } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { loadData() }, [loadData])
  return { artifacts, isLoading, refresh: loadData }
}

export function usePipelineRealtime(pipelineId?: string) {
  const [pipeline, setPipeline] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!pipelineId) return
    supabase.from('ci_pipelines').select('*, ci_stages(*, ci_jobs(*))').eq('id', pipelineId).single().then(({ data }) => { setPipeline(data); setJobs(data?.ci_stages?.flatMap((s: any) => s.ci_jobs) || []) })
    const channel = supabase.channel(`pipeline_${pipelineId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ci_pipelines', filter: `id=eq.${pipelineId}` }, (payload) => {
        setPipeline((prev: any) => ({ ...prev, ...payload.new }))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ci_jobs', filter: `pipeline_id=eq.${pipelineId}` }, () => {
        supabase.from('ci_jobs').select('*').eq('pipeline_id', pipelineId).then(({ data }) => setJobs(data || []))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [pipelineId])
  return { pipeline, jobs }
}

export function usePipelineStats(projectId?: string) {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; successRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('ci_pipelines').select('status').eq('project_id', projectId)
      if (!data) { setStats(null); return }
      const total = data.length
      const byStatus = data.reduce((acc: Record<string, number>, p) => { acc[p.status || 'unknown'] = (acc[p.status || 'unknown'] || 0) + 1; return acc }, {})
      const successCount = byStatus['success'] || 0
      const failedCount = byStatus['failed'] || 0
      const successRate = (successCount + failedCount) > 0 ? (successCount / (successCount + failedCount)) * 100 : 0
      setStats({ total, byStatus, successRate })
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useRecentPipelines(projectId?: string, limit?: number) {
  const [pipelines, setPipelines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ci_pipelines').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(limit || 10); setPipelines(data || []) } finally { setIsLoading(false) }
  }, [projectId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { pipelines, isLoading, refresh: loadData }
}
