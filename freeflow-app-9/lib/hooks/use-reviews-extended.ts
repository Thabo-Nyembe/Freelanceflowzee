'use client'

/**
 * Extended Reviews Hooks
 * Tables: reviews, review_responses, review_votes, review_reports, review_media, review_summaries
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReview(reviewId?: string) {
  const [review, setReview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reviewId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('reviews').select('*, review_responses(*), review_votes(*), review_media(*), users(*)').eq('id', reviewId).single(); setReview(data) } finally { setIsLoading(false) }
  }, [reviewId])
  useEffect(() => { fetch() }, [fetch])
  return { review, isLoading, refresh: fetch }
}

export function useReviews(options: { entity_type: string; entity_id: string; min_rating?: number; verified_only?: boolean; with_media?: boolean; sort_by?: 'recent' | 'helpful' | 'rating_high' | 'rating_low'; limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reviews').select('*, review_media(*), review_responses(*), users(*)').eq('entity_type', options.entity_type).eq('entity_id', options.entity_id).eq('status', 'published')
      if (options.min_rating) query = query.gte('rating', options.min_rating)
      if (options.verified_only) query = query.eq('is_verified_purchase', true)
      let orderBy = 'created_at'
      let ascending = false
      if (options.sort_by === 'helpful') orderBy = 'helpful_count'
      else if (options.sort_by === 'rating_high') { orderBy = 'rating'; ascending = false }
      else if (options.sort_by === 'rating_low') { orderBy = 'rating'; ascending = true }
      const { data } = await query.order(orderBy, { ascending }).limit(options.limit || 50)
      setReviews(data || [])
    } finally { setIsLoading(false) }
  }, [options.entity_type, options.entity_id, options.min_rating, options.verified_only, options.with_media, options.sort_by, options.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useReviewSummary(entityType?: string, entityId?: string) {
  const [summary, setSummary] = useState<{ total_reviews: number; average_rating: number; distribution: { [key: number]: number } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('review_summaries').select('*').eq('entity_type', entityType).eq('entity_id', entityId).single()
      setSummary(data || { total_reviews: 0, average_rating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useUserReview(entityType?: string, entityId?: string, userId?: string) {
  const [review, setReview] = useState<any>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('reviews').select('*, review_media(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('user_id', userId).single()
      setReview(data)
      setHasReviewed(!!data)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { review, hasReviewed, isLoading, refresh: fetch }
}

export function useMyReviews(userId?: string, options?: { entity_type?: string; limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('reviews').select('*, review_media(*), review_responses(count)').eq('user_id', userId)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReviews(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.entity_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useReviewResponses(reviewId?: string) {
  const [responses, setResponses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reviewId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('review_responses').select('*, users(*)').eq('review_id', reviewId).order('created_at', { ascending: true }); setResponses(data || []) } finally { setIsLoading(false) }
  }, [reviewId])
  useEffect(() => { fetch() }, [fetch])
  return { responses, isLoading, refresh: fetch }
}

export function useReviewVote(reviewId?: string, userId?: string) {
  const [vote, setVote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reviewId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('review_votes').select('*').eq('review_id', reviewId).eq('user_id', userId).single(); setVote(data) } finally { setIsLoading(false) }
  }, [reviewId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { vote, isLoading, refresh: fetch }
}

export function useTopReviewed(entityType?: string, options?: { min_reviews?: number; min_rating?: number; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('review_summaries').select('*').eq('entity_type', entityType)
      if (options?.min_reviews) query = query.gte('total_reviews', options.min_reviews)
      if (options?.min_rating) query = query.gte('average_rating', options.min_rating)
      const { data } = await query.order('average_rating', { ascending: false }).order('total_reviews', { ascending: false }).limit(options?.limit || 20)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, options?.min_reviews, options?.min_rating, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useRecentReviews(options?: { entity_type?: string; limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('reviews').select('*, review_media(*), users(*)').eq('status', 'published')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setReviews(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useReviewMedia(reviewId?: string) {
  const [media, setMedia] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!reviewId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('review_media').select('*').eq('review_id', reviewId).order('created_at', { ascending: true }); setMedia(data || []) } finally { setIsLoading(false) }
  }, [reviewId])
  useEffect(() => { fetch() }, [fetch])
  return { media, isLoading, refresh: fetch }
}
