'use client'

/**
 * Extended Priorities Hooks
 * Tables: priorities, priority_levels, priority_rules, priority_assignments, priority_history, priority_escalations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePriority(priorityId?: string) {
  const [priority, setPriority] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priorityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('priorities').select('*, priority_levels(*), priority_rules(*), priority_assignments(*)').eq('id', priorityId).single(); setPriority(data) } finally { setIsLoading(false) }
  }, [priorityId])
  useEffect(() => { fetch() }, [fetch])
  return { priority, isLoading, refresh: fetch }
}

export function usePriorities(options?: { organization_id?: string; is_active?: boolean; limit?: number }) {
  const [priorities, setPriorities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('priorities').select('*, priority_assignments(count)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('level', { ascending: false }).limit(options?.limit || 50)
      setPriorities(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { priorities, isLoading, refresh: fetch }
}

export function usePriorityLevels(organizationId?: string) {
  const [levels, setLevels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('priority_levels').select('*')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('value', { ascending: false })
      setLevels(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { levels, isLoading, refresh: fetch }
}

export function usePriorityAssignment(entityType?: string, entityId?: string) {
  const [assignment, setAssignment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('priority_assignments').select('*, priorities(*)').eq('entity_type', entityType).eq('entity_id', entityId).single(); setAssignment(data) } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { assignment, isLoading, refresh: fetch }
}

export function usePriorityRules(priorityId?: string) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priorityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('priority_rules').select('*').eq('priority_id', priorityId).eq('is_active', true).order('created_at', { ascending: true }); setRules(data || []) } finally { setIsLoading(false) }
  }, [priorityId])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function usePriorityHistory(entityType?: string, entityId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('priority_history').select('*, old_priority:priorities!old_priority_id(*), new_priority:priorities!new_priority_id(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('changed_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function usePriorityEscalations(priorityId?: string) {
  const [escalations, setEscalations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!priorityId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('priority_escalations').select('*, escalate_to:priorities!escalate_to_priority_id(*)').eq('priority_id', priorityId).eq('is_active', true).order('after_hours', { ascending: true }); setEscalations(data || []) } finally { setIsLoading(false) }
  }, [priorityId])
  useEffect(() => { fetch() }, [fetch])
  return { escalations, isLoading, refresh: fetch }
}

export function useHighPriorityItems(entityType?: string, options?: { organization_id?: string; min_level?: number; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('priority_assignments').select('*, priorities(*)')
      if (entityType) query = query.eq('entity_type', entityType)
      const { data } = await query.order('assigned_at', { ascending: false }).limit(options?.limit || 50)
      const filtered = data?.filter(a => a.priorities?.level >= (options?.min_level || 3)) || []
      setItems(filtered)
    } finally { setIsLoading(false) }
  }, [entityType, options?.organization_id, options?.min_level, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function usePriorityStats(organizationId?: string) {
  const [stats, setStats] = useState<{ byLevel: { [level: number]: number }; total: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const query = supabase.from('priority_assignments').select('*, priorities(*)')
      const { data } = await query
      const byLevel: { [level: number]: number } = {}
      data?.forEach(a => {
        const level = a.priorities?.level || 0
        byLevel[level] = (byLevel[level] || 0) + 1
      })
      setStats({ byLevel, total: data?.length || 0 })
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useOverdueEscalations(options?: { limit?: number }) {
  const [escalations, setEscalations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: assignments } = await supabase.from('priority_assignments').select('*, priorities(*), priority_escalations(*)')
      const overdue: any[] = []
      assignments?.forEach(a => {
        if (a.priority_escalations && a.priority_escalations.length > 0) {
          const hoursSinceAssigned = (Date.now() - new Date(a.assigned_at).getTime()) / (1000 * 60 * 60)
          const applicableEscalation = a.priority_escalations.find((e: any) => e.is_active && e.auto_escalate && hoursSinceAssigned >= e.after_hours)
          if (applicableEscalation) { overdue.push({ ...a, escalation: applicableEscalation, hoursSinceAssigned }) }
        }
      })
      setEscalations(overdue.slice(0, options?.limit || 50))
    } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { escalations, isLoading, refresh: fetch }
}
