'use client'

/**
 * Extended Territories Hooks
 * Tables: territories, territory_assignments, territory_boundaries, territory_metrics, territory_history, territory_rules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTerritory(territoryId?: string) {
  const [territory, setTerritory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!territoryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('territories').select('*, territory_assignments(*, users(*)), territory_boundaries(*), territory_metrics(*), territory_rules(*)').eq('id', territoryId).single(); setTerritory(data) } finally { setIsLoading(false) }
  }, [territoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { territory, isLoading, refresh: fetch }
}

export function useTerritories(options?: { territory_type?: string; parent_id?: string | null; region?: string; country?: string; status?: string; search?: string; limit?: number }) {
  const [territories, setTerritories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('territories').select('*, territory_assignments(count)')
      if (options?.territory_type) query = query.eq('territory_type', options.territory_type)
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      if (options?.region) query = query.eq('region', options.region)
      if (options?.country) query = query.eq('country', options.country)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setTerritories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.territory_type, options?.parent_id, options?.region, options?.country, options?.status, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { territories, isLoading, refresh: fetch }
}

export function useTerritoryHierarchy(rootId?: string | null) {
  const [hierarchy, setHierarchy] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('territories').select('*')
      if (rootId === null) query = query.is('parent_id', null)
      else if (rootId) query = query.eq('parent_id', rootId)
      else query = query.is('parent_id', null)
      const { data } = await query.order('name', { ascending: true })
      setHierarchy(data || [])
    } finally { setIsLoading(false) }
  }, [rootId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { hierarchy, isLoading, refresh: fetch }
}

export function useTerritoryAssignments(territoryId?: string, options?: { role?: string; status?: string }) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!territoryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('territory_assignments').select('*, users(*)').eq('territory_id', territoryId)
      if (options?.role) query = query.eq('role', options.role)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setAssignments(data || [])
    } finally { setIsLoading(false) }
  }, [territoryId, options?.role, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { assignments, isLoading, refresh: fetch }
}

export function useUserTerritories(userId?: string, options?: { role?: string; is_primary?: boolean }) {
  const [territories, setTerritories] = useState<any[]>([])
  const [primaryTerritory, setPrimaryTerritory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('territory_assignments').select('*, territories(*)').eq('user_id', userId).eq('status', 'active')
      if (options?.role) query = query.eq('role', options.role)
      if (options?.is_primary !== undefined) query = query.eq('is_primary', options.is_primary)
      const { data } = await query.order('is_primary', { ascending: false })
      const result = (data || []).map(a => ({ ...a.territories, assignment: a }))
      setTerritories(result)
      setPrimaryTerritory(result.find(t => t.assignment?.is_primary) || null)
    } finally { setIsLoading(false) }
  }, [userId, options?.role, options?.is_primary, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { territories, primaryTerritory, isLoading, refresh: fetch }
}

export function useTerritoryBoundaries(territoryId?: string) {
  const [boundaries, setBoundaries] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!territoryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('territory_boundaries').select('*').eq('territory_id', territoryId).single(); setBoundaries(data) } finally { setIsLoading(false) }
  }, [territoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { boundaries, isLoading, refresh: fetch }
}

export function useTerritoryMetrics(territoryId?: string, options?: { from_period?: string; to_period?: string; limit?: number }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [latestMetrics, setLatestMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!territoryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('territory_metrics').select('*').eq('territory_id', territoryId)
      if (options?.from_period) query = query.gte('period', options.from_period)
      if (options?.to_period) query = query.lte('period', options.to_period)
      const { data } = await query.order('period', { ascending: false }).limit(options?.limit || 12)
      setMetrics(data || [])
      setLatestMetrics(data?.[0] || null)
    } finally { setIsLoading(false) }
  }, [territoryId, options?.from_period, options?.to_period, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, latestMetrics, isLoading, refresh: fetch }
}

export function useTerritoryHistory(territoryId?: string, options?: { action?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!territoryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('territory_history').select('*, users(*)').eq('territory_id', territoryId)
      if (options?.action) query = query.eq('action', options.action)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [territoryId, options?.action, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useTerritoryRules(territoryId?: string, options?: { rule_type?: string; is_active?: boolean }) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!territoryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('territory_rules').select('*').eq('territory_id', territoryId)
      if (options?.rule_type) query = query.eq('rule_type', options.rule_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('priority', { ascending: true })
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [territoryId, options?.rule_type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function useChildTerritories(parentId?: string) {
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('territories').select('*, territory_assignments(count)').eq('parent_id', parentId).order('name', { ascending: true }); setChildren(data || []) } finally { setIsLoading(false) }
  }, [parentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { children, isLoading, refresh: fetch }
}

export function useRegions() {
  const [regions, setRegions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('territories').select('region').not('region', 'is', null)
      const unique = [...new Set(data?.map(t => t.region).filter(Boolean))]
      setRegions(unique)
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { regions, isLoading, refresh: fetch }
}
