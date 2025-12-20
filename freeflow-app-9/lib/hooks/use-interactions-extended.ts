'use client'

/**
 * Extended Interactions Hooks
 * Tables: interactions, interaction_types, interaction_logs, interaction_analytics, interaction_rules, interaction_triggers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInteraction(interactionId?: string) {
  const [interaction, setInteraction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!interactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('interactions').select('*, interaction_types(*)').eq('id', interactionId).single(); setInteraction(data) } finally { setIsLoading(false) }
  }, [interactionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { interaction, isLoading, refresh: fetch }
}

export function useInteractions(options?: { user_id?: string; target_id?: string; target_type?: string; interaction_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [interactions, setInteractions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('interactions').select('*, interaction_types(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.target_id) query = query.eq('target_id', options.target_id)
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      if (options?.interaction_type) query = query.eq('interaction_type', options.interaction_type)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setInteractions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.target_id, options?.target_type, options?.interaction_type, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { interactions, isLoading, refresh: fetch }
}

export function useUserInteractions(userId?: string, options?: { target_type?: string; limit?: number }) {
  const [interactions, setInteractions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('interactions').select('*').eq('user_id', userId)
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInteractions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.target_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { interactions, isLoading, refresh: fetch }
}

export function useTargetInteractions(targetId?: string, targetType?: string, options?: { interaction_type?: string; limit?: number }) {
  const [interactions, setInteractions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!targetId || !targetType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('interactions').select('*').eq('target_id', targetId).eq('target_type', targetType)
      if (options?.interaction_type) query = query.eq('interaction_type', options.interaction_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInteractions(data || [])
    } finally { setIsLoading(false) }
  }, [targetId, targetType, options?.interaction_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { interactions, isLoading, refresh: fetch }
}

export function useInteractionTypes(options?: { category?: string; is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('interaction_types').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useInteractionLogs(interactionId?: string, options?: { limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!interactionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('interaction_logs').select('*').eq('interaction_id', interactionId).order('logged_at', { ascending: false }).limit(options?.limit || 50); setLogs(data || []) } finally { setIsLoading(false) }
  }, [interactionId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useInteractionAnalytics(options?: { target_type?: string; interaction_type?: string; from_date?: string; to_date?: string }) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('interaction_analytics').select('*')
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      if (options?.interaction_type) query = query.eq('interaction_type', options.interaction_type)
      if (options?.from_date) query = query.gte('date', options.from_date)
      if (options?.to_date) query = query.lte('date', options.to_date)
      const { data } = await query.order('date', { ascending: false }).limit(30)
      setAnalytics(data || [])
    } finally { setIsLoading(false) }
  }, [options?.target_type, options?.interaction_type, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}

export function useInteractionRules(options?: { trigger_type?: string; is_active?: boolean }) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('interaction_rules').select('*')
      if (options?.trigger_type) query = query.eq('trigger_type', options.trigger_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setRules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.trigger_type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rules, isLoading, refresh: fetch }
}

export function useInteractionCount(targetId?: string, targetType?: string, interactionType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!targetId || !targetType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('interactions').select('id', { count: 'exact' }).eq('target_id', targetId).eq('target_type', targetType)
      if (interactionType) query = query.eq('interaction_type', interactionType)
      const { count: c } = await query
      setCount(c || 0)
    } finally { setIsLoading(false) }
  }, [targetId, targetType, interactionType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
