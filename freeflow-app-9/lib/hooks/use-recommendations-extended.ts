'use client'

/**
 * Extended Recommendations Hooks
 * Tables: recommendations, recommendation_models, recommendation_scores, recommendation_feedback, recommendation_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRecommendation(recommendationId?: string) {
  const [recommendation, setRecommendation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!recommendationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('recommendations').select('*, recommendation_models(*), users(*), recommendation_feedback(*)').eq('id', recommendationId).single(); setRecommendation(data) } finally { setIsLoading(false) }
  }, [recommendationId])
  useEffect(() => { loadData() }, [loadData])
  return { recommendation, isLoading, refresh: loadData }
}

export function useRecommendations(options: { user_id: string; entity_type?: string; model_id?: string; status?: string; min_score?: number; limit?: number }) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!options.user_id) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('recommendations').select('*').eq('user_id', options.user_id)
      if (options.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options.model_id) query = query.eq('model_id', options.model_id)
      if (options.status) query = query.eq('status', options.status)
      else query = query.eq('status', 'active')
      if (options.min_score) query = query.gte('score', options.min_score)
      const { data } = await query.order('score', { ascending: false }).limit(options.limit || 20)
      setRecommendations(data || [])
    } finally { setIsLoading(false) }
  }, [options.user_id, options.entity_type, options.model_id, options.status, options.min_score, options.limit])
  useEffect(() => { loadData() }, [loadData])
  return { recommendations, isLoading, refresh: loadData }
}

export function useTopRecommendations(userId?: string, entityType?: string, limit?: number) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('recommendations').select('*').eq('user_id', userId).eq('entity_type', entityType).eq('status', 'active').order('score', { ascending: false }).limit(limit || 10)
      setRecommendations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, entityType, limit])
  useEffect(() => { loadData() }, [loadData])
  return { recommendations, isLoading, refresh: loadData }
}

export function useRecommendationModels(options?: { type?: string; is_active?: boolean }) {
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('recommendation_models').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setModels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { models, isLoading, refresh: loadData }
}

export function useRecommendationFeedback(recommendationId?: string) {
  const [feedback, setFeedback] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!recommendationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('recommendation_feedback').select('*, users(*)').eq('recommendation_id', recommendationId).order('created_at', { ascending: false }); setFeedback(data || []) } finally { setIsLoading(false) }
  }, [recommendationId])
  useEffect(() => { loadData() }, [loadData])
  return { feedback, isLoading, refresh: loadData }
}

export function useRecommendationStats(options?: { model_id?: string; entity_type?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; active: number; accepted: number; dismissed: number; converted: number; acceptanceRate: number; conversionRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('recommendations').select('status, entity_type')
      if (options?.model_id) query = query.eq('model_id', options.model_id)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const recommendations = data || []
      const total = recommendations.length
      const active = recommendations.filter(r => r.status === 'active').length
      const accepted = recommendations.filter(r => r.status === 'accepted').length
      const dismissed = recommendations.filter(r => r.status === 'dismissed').length
      const converted = recommendations.filter(r => r.status === 'converted').length
      const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0
      const conversionRate = accepted > 0 ? Math.round((converted / accepted) * 100) : 0
      setStats({ total, active, accepted, dismissed, converted, acceptanceRate, conversionRate })
    } finally { setIsLoading(false) }
  }, [options?.model_id, options?.entity_type, options?.from_date, options?.to_date])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useSimilarItems(entityType?: string, entityId?: string, limit?: number) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('recommendation_scores').select('*').eq('source_entity_type', entityType).eq('source_entity_id', entityId).order('similarity_score', { ascending: false }).limit(limit || 10)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useMyRecommendationHistory(userId?: string, options?: { entity_type?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('recommendations').select('*').eq('user_id', userId).in('status', ['accepted', 'converted', 'dismissed'])
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.entity_type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function usePersonalizedRecommendations(userId?: string, options?: { categories?: string[]; limit?: number }) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('recommendations').select('*').eq('user_id', userId).eq('status', 'active')
      if (options?.categories && options.categories.length > 0) query = query.in('entity_type', options.categories)
      const { data } = await query.order('score', { ascending: false }).limit(options?.limit || 20)
      setRecommendations(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.categories?.join(','), options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { recommendations, isLoading, refresh: loadData }
}
