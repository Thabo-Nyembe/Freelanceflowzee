'use client'

/**
 * Extended Statuses Hooks
 * Tables: statuses, status_history, status_transitions, status_rules, status_notifications, status_groups
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStatus(statusId?: string) {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!statusId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('statuses').select('*, status_groups(*), status_transitions(*), status_rules(*)').eq('id', statusId).single(); setStatus(data) } finally { setIsLoading(false) }
  }, [statusId])
  useEffect(() => { fetch() }, [fetch])
  return { status, isLoading, refresh: fetch }
}

export function useStatuses(options?: { entity_type?: string; group_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [statuses, setStatuses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('statuses').select('*, status_groups(*)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('order_index', { ascending: true }).limit(options?.limit || 100)
      setStatuses(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.group_id, options?.is_active, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { statuses, isLoading, refresh: fetch }
}

export function useStatusGroups(options?: { entity_type?: string; is_active?: boolean }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('status_groups').select('*, statuses(count)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useCurrentStatus(entityType?: string, entityId?: string) {
  const [currentStatus, setCurrentStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('status_history').select('*, statuses(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('changed_at', { ascending: false }).limit(1).single()
      setCurrentStatus(data?.statuses || null)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { currentStatus, isLoading, refresh: fetch }
}

export function useStatusHistory(entityType?: string, entityId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('status_history').select('*, statuses(*), from_status:from_status_id(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('changed_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useAvailableTransitions(fromStatusId?: string) {
  const [transitions, setTransitions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!fromStatusId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('status_transitions').select('*, to_status:to_status_id(*)').eq('from_status_id', fromStatusId).eq('is_active', true)
      setTransitions(data || [])
    } finally { setIsLoading(false) }
  }, [fromStatusId])
  useEffect(() => { fetch() }, [fetch])
  return { transitions, isLoading, refresh: fetch }
}

export function useDefaultStatus(entityType?: string) {
  const [defaultStatus, setDefaultStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('statuses').select('*').eq('entity_type', entityType).eq('is_default', true).eq('is_active', true).single()
      setDefaultStatus(data)
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { fetch() }, [fetch])
  return { defaultStatus, isLoading, refresh: fetch }
}

export function useStatusRules(statusId?: string) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!statusId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('status_rules').select('*').eq('status_id', statusId).order('name', { ascending: true }); setRules(data || []) } finally { setIsLoading(false) }
  }, [statusId])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function useStatusesByGroup(entityType?: string) {
  const [groupedStatuses, setGroupedStatuses] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('statuses').select('*, status_groups(*)').eq('entity_type', entityType).eq('is_active', true).order('order_index', { ascending: true })
      const grouped: Record<string, any[]> = {}
      data?.forEach(status => {
        const groupName = status.status_groups?.name || 'Ungrouped'
        if (!grouped[groupName]) grouped[groupName] = []
        grouped[groupName].push(status)
      })
      setGroupedStatuses(grouped)
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { fetch() }, [fetch])
  return { groupedStatuses, isLoading, refresh: fetch }
}

