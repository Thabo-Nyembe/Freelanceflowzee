'use client'

/**
 * Extended Suggestion Hooks - Covers all Suggestion-related tables
 * Tables: suggestions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSuggestion(suggestionId?: string) {
  const [suggestion, setSuggestion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!suggestionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('suggestions').select('*').eq('id', suggestionId).single()
      setSuggestion(data)
    } finally { setIsLoading(false) }
  }, [suggestionId])
  useEffect(() => { fetch() }, [fetch])
  return { suggestion, isLoading, refresh: fetch }
}

export function useSuggestions(options?: { user_id?: string; type?: string; status?: string; target_id?: string; target_type?: string; limit?: number }) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('suggestions').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.target_id) query = query.eq('target_id', options.target_id)
      if (options?.target_type) query = query.eq('target_type', options.target_type)
      const { data } = await query.order('score', { ascending: false }).order('priority', { ascending: false }).limit(options?.limit || 50)
      setSuggestions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.target_id, options?.target_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { suggestions, isLoading, refresh: fetch }
}

export function usePendingSuggestions(userId?: string, options?: { type?: string; limit?: number }) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('suggestions').select('*').eq('user_id', userId).eq('status', 'pending')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('score', { ascending: false }).order('priority', { ascending: false }).limit(options?.limit || 20)
      setSuggestions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { suggestions, isLoading, refresh: fetch }
}

export function useTopSuggestions(userId?: string, options?: { type?: string; limit?: number }) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('suggestions').select('*').eq('user_id', userId).eq('status', 'pending')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('score', { ascending: false }).limit(options?.limit || 5)
      setSuggestions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { suggestions, isLoading, refresh: fetch }
}

export function useSuggestionsByType(userId?: string, type?: string, options?: { status?: string; limit?: number }) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !type) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('suggestions').select('*').eq('user_id', userId).eq('type', type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSuggestions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, type, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { suggestions, isLoading, refresh: fetch }
}

export function useSuggestionStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; byType: Record<string, number>; byStatus: Record<string, number>; acceptanceRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('suggestions').select('type, status').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const byType = data.reduce((acc: Record<string, number>, s) => { acc[s.type || 'unknown'] = (acc[s.type || 'unknown'] || 0) + 1; return acc }, {})
      const byStatus = data.reduce((acc: Record<string, number>, s) => { acc[s.status || 'unknown'] = (acc[s.status || 'unknown'] || 0) + 1; return acc }, {})
      const accepted = byStatus['accepted'] || 0
      const total = data.length
      const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0
      setStats({ total, byType, byStatus, acceptanceRate })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useSuggestionTypes(userId?: string) {
  const [types, setTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('suggestions').select('type').eq('user_id', userId)
      const uniqueTypes = [...new Set((data || []).map(s => s.type).filter(Boolean))]
      setTypes(uniqueTypes)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useAcceptedSuggestions(userId?: string, options?: { type?: string; limit?: number }) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('suggestions').select('*').eq('user_id', userId).eq('status', 'accepted')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('accepted_at', { ascending: false }).limit(options?.limit || 50)
      setSuggestions(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { suggestions, isLoading, refresh: fetch }
}

export function useSuggestionsRealtime(userId?: string) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('suggestions').select('*').eq('user_id', userId).eq('status', 'pending').order('score', { ascending: false }).limit(50).then(({ data }) => setSuggestions(data || []))
    const channel = supabase.channel(`suggestions_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'suggestions', filter: `user_id=eq.${userId}` }, (payload) => {
        if ((payload.new as Record<string, unknown>).status === 'pending') {
          setSuggestions(prev => [payload.new, ...prev].slice(0, 50))
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'suggestions', filter: `user_id=eq.${userId}` }, (payload) => {
        const updated = payload.new as Record<string, unknown>
        if (updated.status === 'pending') {
          setSuggestions(prev => prev.map(s => s.id === updated.id ? updated : s))
        } else {
          setSuggestions(prev => prev.filter(s => s.id !== updated.id))
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'suggestions', filter: `user_id=eq.${userId}` }, (payload) => setSuggestions(prev => prev.filter(s => s.id !== (payload.old as Record<string, unknown>).id)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return { suggestions }
}

export function useSuggestionCount(userId?: string, options?: { type?: string; status?: string }) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('suggestions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { count: total } = await query
      setCount(total || 0)
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useRelatedSuggestions(suggestionId?: string, options?: { limit?: number }) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!suggestionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: suggestion } = await supabase.from('suggestions').select('target_id, target_type, type, user_id').eq('id', suggestionId).single()
      if (!suggestion) { setSuggestions([]); return }
      const { data } = await supabase.from('suggestions').select('*').eq('user_id', suggestion.user_id).eq('type', suggestion.type).neq('id', suggestionId).eq('status', 'pending').order('score', { ascending: false }).limit(options?.limit || 5)
      setSuggestions(data || [])
    } finally { setIsLoading(false) }
  }, [suggestionId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { suggestions, isLoading, refresh: fetch }
}
