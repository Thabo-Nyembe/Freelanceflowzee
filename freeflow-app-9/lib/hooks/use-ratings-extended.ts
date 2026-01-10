'use client'

/**
 * Extended Ratings Hooks
 * Tables: ratings, rating_criteria, rating_responses, rating_summaries, rating_reports, rating_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRating(ratingId?: string) {
  const [rating, setRating] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!ratingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('ratings').select('*, rating_criteria(*), rating_responses(*), users(*)').eq('id', ratingId).single(); setRating(data) } finally { setIsLoading(false) }
  }, [ratingId])
  useEffect(() => { fetch() }, [fetch])
  return { rating, isLoading, refresh: fetch }
}

export function useRatings(options: { entity_type: string; entity_id: string; min_rating?: number; verified_only?: boolean; sort_by?: string; limit?: number }) {
  const [ratings, setRatings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ratings').select('*, rating_responses(*), users(*)').eq('entity_type', options.entity_type).eq('entity_id', options.entity_id)
      if (options.min_rating) query = query.gte('rating', options.min_rating)
      if (options.verified_only) query = query.eq('is_verified', true)
      let orderBy = 'created_at'
      if (options.sort_by === 'helpful') orderBy = 'helpful_count'
      else if (options.sort_by === 'rating_high') { query = query.order('rating', { ascending: false }) }
      else if (options.sort_by === 'rating_low') { query = query.order('rating', { ascending: true }) }
      if (options.sort_by !== 'rating_high' && options.sort_by !== 'rating_low') { query = query.order(orderBy, { ascending: false }) }
      const { data } = await query.limit(options.limit || 50)
      setRatings(data || [])
    } finally { setIsLoading(false) }
  }, [options.entity_type, options.entity_id, options.min_rating, options.verified_only, options.sort_by, options.limit])
  useEffect(() => { fetch() }, [fetch])
  return { ratings, isLoading, refresh: fetch }
}

export function useRatingSummary(entityType?: string, entityId?: string) {
  const [summary, setSummary] = useState<{ total_ratings: number; average_rating: number; distribution: { [key: number]: number } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('rating_summaries').select('*').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setSummary(data || { total_ratings: 0, average_rating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useRatingCriteria(entityType?: string) {
  const [criteria, setCriteria] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('rating_criteria').select('*').eq('entity_type', entityType).eq('is_active', true).order('order', { ascending: true }); setCriteria(data || []) } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { fetch() }, [fetch])
  return { criteria, isLoading, refresh: fetch }
}

export function useUserRating(entityType?: string, entityId?: string, userId?: string) {
  const [rating, setRating] = useState<any>(null)
  const [hasRated, setHasRated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('ratings').select('*, rating_responses(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('user_id', userId).single()
      setRating(data)
      setHasRated(!!data)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { rating, hasRated, isLoading, refresh: fetch }
}

export function useMyRatings(userId?: string, options?: { entity_type?: string; limit?: number }) {
  const [ratings, setRatings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('ratings').select('*').eq('user_id', userId)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setRatings(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.entity_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { ratings, isLoading, refresh: fetch }
}

export function useTopRated(entityType?: string, options?: { min_ratings?: number; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('rating_summaries').select('*').eq('entity_type', entityType)
      if (options?.min_ratings) query = query.gte('total_ratings', options.min_ratings)
      const { data } = await query.order('average_rating', { ascending: false }).limit(options?.limit || 10)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, options?.min_ratings, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useRecentRatings(options?: { entity_type?: string; limit?: number }) {
  const [ratings, setRatings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ratings').select('*, users(*)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setRatings(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { ratings, isLoading, refresh: fetch }
}

export function useRatingReports(options?: { status?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rating_reports').select('*, ratings(*), users(*)')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useAverageRating(entityType?: string, entityId?: string) {
  const [average, setAverage] = useState<number>(0)
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('rating_summaries').select('average_rating, total_ratings').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setAverage(data?.average_rating || 0)
      setCount(data?.total_ratings || 0)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { average, count, isLoading, refresh: fetch }
}

export function useRatingDistribution(entityType?: string, entityId?: string) {
  const [distribution, setDistribution] = useState<{ [key: number]: number }>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('rating_summaries').select('distribution').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setDistribution(data?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { fetch() }, [fetch])
  return { distribution, isLoading, refresh: fetch }
}
