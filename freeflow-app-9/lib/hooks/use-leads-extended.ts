'use client'

/**
 * Extended Leads Hooks
 * Tables: leads, lead_sources, lead_stages, lead_activities, lead_scores, lead_assignments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLead(leadId?: string) {
  const [lead, setLead] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!leadId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('leads').select('*, lead_sources(*), lead_stages(*), lead_activities(*), lead_scores(*)').eq('id', leadId).single(); setLead(data) } finally { setIsLoading(false) }
  }, [leadId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { lead, isLoading, refresh: fetch }
}

export function useLeads(options?: { owner_id?: string; stage_id?: string; source_id?: string; status?: string; limit?: number }) {
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('leads').select('*, lead_sources(*), lead_stages(*)')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.stage_id) query = query.eq('stage_id', options.stage_id)
      if (options?.source_id) query = query.eq('source_id', options.source_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setLeads(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.stage_id, options?.source_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { leads, isLoading, refresh: fetch }
}

export function useLeadsByStage(stageId?: string) {
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!stageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('leads').select('*, lead_sources(*)').eq('stage_id', stageId).order('score', { ascending: false }); setLeads(data || []) } finally { setIsLoading(false) }
  }, [stageId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { leads, isLoading, refresh: fetch }
}

export function useLeadActivities(leadId?: string, options?: { type?: string; limit?: number }) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!leadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('lead_activities').select('*').eq('lead_id', leadId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setActivities(data || [])
    } finally { setIsLoading(false) }
  }, [leadId, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { activities, isLoading, refresh: fetch }
}

export function useLeadSources() {
  const [sources, setSources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('lead_sources').select('*').order('name', { ascending: true }); setSources(data || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sources, isLoading, refresh: fetch }
}

export function useLeadStages() {
  const [stages, setStages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('lead_stages').select('*').order('order', { ascending: true }); setStages(data || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stages, isLoading, refresh: fetch }
}

export function useLeadSearch(query?: string, options?: { owner_id?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let dbQuery = supabase.from('leads').select('*, lead_sources(*), lead_stages(*)').or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      if (options?.owner_id) dbQuery = dbQuery.eq('owner_id', options.owner_id)
      const { data } = await dbQuery.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [query, options?.owner_id, options?.limit, supabase])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useLeadPipeline() {
  const [pipeline, setPipeline] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: stages } = await supabase.from('lead_stages').select('*').order('order', { ascending: true })
      const { data: leads } = await supabase.from('leads').select('*, lead_sources(*)').neq('status', 'converted')
      const pipelineData: Record<string, any[]> = {}
      stages?.forEach(stage => { pipelineData[stage.id] = leads?.filter(l => l.stage_id === stage.id) || [] })
      setPipeline(pipelineData)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { pipeline, isLoading, refresh: fetch }
}

export function useLeadScoreHistory(leadId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!leadId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('lead_scores').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [leadId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useMyLeads(userId?: string, options?: { status?: string }) {
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('leads').select('*, lead_sources(*), lead_stages(*)').eq('owner_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setLeads(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { leads, isLoading, refresh: fetch }
}
