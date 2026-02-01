'use client'

/**
 * Extended Stages Hooks
 * Tables: stages, stage_transitions, stage_rules, stage_assignments, stage_history, stage_automations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStage(stageId?: string) {
  const [stage, setStage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!stageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('stages').select('*, stage_transitions(*), stage_rules(*), stage_automations(*)').eq('id', stageId).single(); setStage(data) } finally { setIsLoading(false) }
  }, [stageId])
  useEffect(() => { fetch() }, [fetch])
  return { stage, isLoading, refresh: fetch }
}

export function useStages(options?: { pipeline_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [stages, setStages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stages').select('*, stage_assignments(count)')
      if (options?.pipeline_id) query = query.eq('pipeline_id', options.pipeline_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('order_index', { ascending: true }).limit(options?.limit || 100)
      setStages(data || [])
    } finally { setIsLoading(false) }
  }, [options?.pipeline_id, options?.is_active, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { stages, isLoading, refresh: fetch }
}

export function useStageTransitions(pipelineId?: string) {
  const [transitions, setTransitions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: stages } = await supabase.from('stages').select('id').eq('pipeline_id', pipelineId)
      const stageIds = stages?.map(s => s.id) || []
      if (stageIds.length === 0) { setTransitions([]); return }
      const { data } = await supabase.from('stage_transitions').select('*, from_stage:from_stage_id(*), to_stage:to_stage_id(*)').in('from_stage_id', stageIds)
      setTransitions(data || [])
    } finally { setIsLoading(false) }
  }, [pipelineId])
  useEffect(() => { fetch() }, [fetch])
  return { transitions, isLoading, refresh: fetch }
}

export function useStageHistory(entityType?: string, entityId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('stage_history').select('*, from_stage:from_stage_id(*), to_stage:to_stage_id(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('moved_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useCurrentStage(entityType?: string, entityId?: string) {
  const [assignment, setAssignment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('stage_assignments').select('*, stages(*)').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setAssignment(data)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { assignment, stage: assignment?.stages, isLoading, refresh: fetch }
}

export function useAvailableTransitions(stageId?: string) {
  const [transitions, setTransitions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!stageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('stage_transitions').select('*, to_stage:to_stage_id(*)').eq('from_stage_id', stageId).eq('is_active', true)
      setTransitions(data || [])
    } finally { setIsLoading(false) }
  }, [stageId])
  useEffect(() => { fetch() }, [fetch])
  return { transitions, isLoading, refresh: fetch }
}

export function useStageRules(stageId?: string) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!stageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('stage_rules').select('*').eq('stage_id', stageId).order('name', { ascending: true })
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [stageId])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function usePipelineStats(pipelineId?: string) {
  const [stats, setStats] = useState<{ stages: number; itemsByStage: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!pipelineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: stages } = await supabase.from('stages').select('id, name, stage_assignments(count)').eq('pipeline_id', pipelineId).order('order_index', { ascending: true })
      const itemsByStage: Record<string, number> = {}
      stages?.forEach(s => { itemsByStage[s.name] = (s.stage_assignments as unknown[])?.[0]?.count || 0 })
      setStats({ stages: stages?.length || 0, itemsByStage })
    } finally { setIsLoading(false) }
  }, [pipelineId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

