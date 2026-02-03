'use client'

/**
 * Extended Action Hooks - Covers all Action-related tables
 * Tables: action_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useActionHistory(actionId?: string) {
  const [action, setAction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!actionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('action_history').select('*').eq('id', actionId).single()
      setAction(data)
    } finally { setIsLoading(false) }
  }, [actionId])
  useEffect(() => { loadData() }, [loadData])
  return { action, isLoading, refresh: loadData }
}

export function useUserActionHistory(userId?: string, options?: { actionType?: string; entityType?: string; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('action_history').select('*', { count: 'exact' }).eq('user_id', userId)
      if (options?.actionType) query = query.eq('action_type', options.actionType)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      const { data: result, count } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
      setTotal(count || 0)
    } finally { setIsLoading(false) }
  }, [userId, options?.actionType, options?.entityType, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, total, isLoading, refresh: loadData }
}

export function useEntityActionHistory(entityType?: string, entityId?: string, options?: { limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('action_history').select('*, users(id, name, email)').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useRecentActions(options?: { limit?: number; actionTypes?: string[] }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('action_history').select('*, users(id, name, email)')
      if (options?.actionTypes?.length) query = query.in('action_type', options.actionTypes)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.limit, options?.actionTypes])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useActionStats(userId?: string, options?: { startDate?: string; endDate?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('action_history').select('action_type, entity_type')
      if (userId) query = query.eq('user_id', userId)
      if (options?.startDate) query = query.gte('created_at', options.startDate)
      if (options?.endDate) query = query.lte('created_at', options.endDate)
      const { data } = await query
      const result = { total: data?.length || 0, byActionType: {} as Record<string, number>, byEntityType: {} as Record<string, number> }
      data?.forEach(a => {
        result.byActionType[a.action_type] = (result.byActionType[a.action_type] || 0) + 1
        result.byEntityType[a.entity_type] = (result.byEntityType[a.entity_type] || 0) + 1
      })
      setStats(result)
    } finally { setIsLoading(false) }
  }, [userId, options?.startDate, options?.endDate])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useActionHistoryRealtime(userId?: string) {
  const [actions, setActions] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('action_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50).then(({ data }) => setActions(data || []))
    const channel = supabase.channel(`action_history_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'action_history', filter: `user_id=eq.${userId}` }, (payload) => setActions(prev => [payload.new, ...prev].slice(0, 50)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return { actions }
}

export function useActionSearch(searchTerm: string, options?: { userId?: string; entityType?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 2) { setData([]); return }
    setIsLoading(true)
    try {
      let query = supabase.from('action_history').select('*, users(id, name)').ilike('description', `%${searchTerm}%`)
      if (options?.userId) query = query.eq('user_id', options.userId)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      const { data: result } = await query.order('created_at', { ascending: false }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [searchTerm, options?.userId, options?.entityType])
  useEffect(() => { const timer = setTimeout(search, 300); return () => clearTimeout(timer) }, [search])
  return { data, isLoading }
}
