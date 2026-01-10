'use client'

/**
 * Extended Rules Hooks
 * Tables: rules, rule_conditions, rule_actions, rule_executions, rule_groups, rule_templates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRule(ruleId?: string) {
  const [rule, setRule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ruleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rules').select('*, rule_conditions(*), rule_actions(*), rule_groups(*)').eq('id', ruleId).single(); setRule(data) } finally { setIsLoading(false) }
  }, [ruleId])
  useEffect(() => { fetch() }, [fetch])
  return { rule, isLoading, refresh: fetch }
}

export function useRules(options?: { group_id?: string; type?: string; trigger_event?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rules').select('*, rule_conditions(count), rule_actions(count), rule_groups(*)')
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.trigger_event) query = query.eq('trigger_event', options.trigger_event)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('priority', { ascending: true }).order('name', { ascending: true }).limit(options?.limit || 100)
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.group_id, options?.type, options?.trigger_event, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function useRuleConditions(ruleId?: string) {
  const [conditions, setConditions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ruleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rule_conditions').select('*').eq('rule_id', ruleId).order('condition_order', { ascending: true }); setConditions(data || []) } finally { setIsLoading(false) }
  }, [ruleId])
  useEffect(() => { fetch() }, [fetch])
  return { conditions, isLoading, refresh: fetch }
}

export function useRuleActions(ruleId?: string) {
  const [actions, setActions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ruleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rule_actions').select('*').eq('rule_id', ruleId).order('action_order', { ascending: true }); setActions(data || []) } finally { setIsLoading(false) }
  }, [ruleId])
  useEffect(() => { fetch() }, [fetch])
  return { actions, isLoading, refresh: fetch }
}

export function useRuleExecutions(ruleId?: string, options?: { status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ruleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('rule_executions').select('*').eq('rule_id', ruleId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('executed_at', options.from_date)
      if (options?.to_date) query = query.lte('executed_at', options.to_date)
      const { data } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 100)
      setExecutions(data || [])
    } finally { setIsLoading(false) }
  }, [ruleId, options?.status, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { executions, isLoading, refresh: fetch }
}

export function useRuleGroups(options?: { is_active?: boolean }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rule_groups').select('*, rules(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useRuleTemplates(options?: { type?: string; is_active?: boolean }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rule_templates').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useActiveRules(options?: { trigger_event?: string }) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rules').select('*, rule_conditions(*), rule_actions(*)').eq('is_active', true)
      if (options?.trigger_event) query = query.eq('trigger_event', options.trigger_event)
      const { data } = await query.order('priority', { ascending: true })
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.trigger_event])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function useRuleStats() {
  const [stats, setStats] = useState<{ total: number; active: number; groups: number; executionsToday: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [total, active, groups, executions] = await Promise.all([
        supabase.from('rules').select('*', { count: 'exact', head: true }),
        supabase.from('rules').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('rule_groups').select('*', { count: 'exact', head: true }),
        supabase.from('rule_executions').select('*', { count: 'exact', head: true }).gte('executed_at', today)
      ])
      setStats({ total: total.count || 0, active: active.count || 0, groups: groups.count || 0, executionsToday: executions.count || 0 })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useRecentExecutions(options?: { limit?: number }) {
  const [executions, setExecutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('rule_executions').select('*, rules(*)').order('executed_at', { ascending: false }).limit(options?.limit || 20)
      setExecutions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { executions, isLoading, refresh: fetch }
}

