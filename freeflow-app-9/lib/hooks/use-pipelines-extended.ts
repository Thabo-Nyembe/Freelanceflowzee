'use client'

/**
 * Extended Pipelines Hooks
 * Tables: pipelines, pipeline_stages, pipeline_items, pipeline_automations, pipeline_triggers, pipeline_metrics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePipeline(pipelineId?: string) {
  const [pipeline, setPipeline] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pipelines').select('*, pipeline_stages(*), pipeline_automations(*)').eq('id', pipelineId).single(); setPipeline(data) } finally { setIsLoading(false) }
  }, [pipelineId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { pipeline, isLoading, refresh: fetch }
}

export function usePipelines(options?: { organization_id?: string; owner_id?: string; type?: string; status?: string; limit?: number }) {
  const [pipelines, setPipelines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('pipelines').select('*, pipeline_stages(count), pipeline_items(count)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPipelines(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.owner_id, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { pipelines, isLoading, refresh: fetch }
}

export function usePipelineStages(pipelineId?: string) {
  const [stages, setStages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pipeline_stages').select('*, pipeline_items(count)').eq('pipeline_id', pipelineId).order('order', { ascending: true }); setStages(data || []) } finally { setIsLoading(false) }
  }, [pipelineId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stages, isLoading, refresh: fetch }
}

export function usePipelineItems(pipelineId?: string, options?: { stage_id?: string; status?: string; owner_id?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('pipeline_items').select('*, pipeline_stages(*)').eq('pipeline_id', pipelineId)
      if (options?.stage_id) query = query.eq('stage_id', options.stage_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      const { data } = await query.order('position', { ascending: true }).order('created_at', { ascending: false }).limit(options?.limit || 100)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [pipelineId, options?.stage_id, options?.status, options?.owner_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useStageItems(stageId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!stageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pipeline_items').select('*').eq('stage_id', stageId).eq('status', 'active').order('position', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [stageId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function usePipelineAutomations(pipelineId?: string) {
  const [automations, setAutomations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('pipeline_automations').select('*').eq('pipeline_id', pipelineId).order('created_at', { ascending: false }); setAutomations(data || []) } finally { setIsLoading(false) }
  }, [pipelineId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { automations, isLoading, refresh: fetch }
}

export function usePipelineMetrics(pipelineId?: string, options?: { from_date?: string; to_date?: string }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('pipeline_metrics').select('*').eq('pipeline_id', pipelineId)
      if (options?.from_date) query = query.gte('moved_at', options.from_date)
      if (options?.to_date) query = query.lte('moved_at', options.to_date)
      const { data } = await query.order('moved_at', { ascending: false })
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [pipelineId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function usePipelineBoard(pipelineId?: string) {
  const [board, setBoard] = useState<{ stages: any[]; items: Record<string, any[]> }>({ stages: [], items: {} })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [stagesRes, itemsRes] = await Promise.all([
        supabase.from('pipeline_stages').select('*').eq('pipeline_id', pipelineId).order('order', { ascending: true }),
        supabase.from('pipeline_items').select('*').eq('pipeline_id', pipelineId).eq('status', 'active').order('position', { ascending: true })
      ])
      const stages = stagesRes.data || []
      const itemsByStage: Record<string, any[]> = {}
      stages.forEach(s => { itemsByStage[s.id] = [] })
      itemsRes.data?.forEach(item => {
        if (item.stage_id && itemsByStage[item.stage_id]) {
          itemsByStage[item.stage_id].push(item)
        }
      })
      setBoard({ stages, items: itemsByStage })
    } finally { setIsLoading(false) }
  }, [pipelineId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { board, isLoading, refresh: fetch }
}

export function usePipelineStats(pipelineId?: string) {
  const [stats, setStats] = useState<{ totalItems: number; totalValue: number; stageDistribution: Record<string, number>; wonCount: number; lostCount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: items } = await supabase.from('pipeline_items').select('stage_id, value, status').eq('pipeline_id', pipelineId)
      const totalItems = items?.filter(i => i.status === 'active').length || 0
      const totalValue = items?.filter(i => i.status === 'active').reduce((sum, i) => sum + (i.value || 0), 0) || 0
      const wonCount = items?.filter(i => i.status === 'won').length || 0
      const lostCount = items?.filter(i => i.status === 'lost').length || 0
      const stageDistribution: Record<string, number> = {}
      items?.filter(i => i.status === 'active').forEach(item => {
        if (item.stage_id) {
          stageDistribution[item.stage_id] = (stageDistribution[item.stage_id] || 0) + 1
        }
      })
      setStats({ totalItems, totalValue, stageDistribution, wonCount, lostCount })
    } finally { setIsLoading(false) }
  }, [pipelineId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
