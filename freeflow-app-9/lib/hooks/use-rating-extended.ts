'use client'

/**
 * Extended Rating Hooks - Covers all Rating-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRatings(itemId?: string, itemType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('ratings').select('*').order('created_at', { ascending: false })
      if (itemId) query = query.eq('item_id', itemId)
      if (itemType) query = query.eq('item_type', itemType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [itemId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserRating(userId?: string, itemId?: string, itemType?: string) {
  const [rating, setRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId || !itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('ratings').select('rating').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single()
      setRating(data?.rating || null)
    } finally { setIsLoading(false) }
  }, [userId, itemId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rating, isLoading, refresh: fetch }
}

export function useAverageRating(itemId?: string, itemType?: string) {
  const [average, setAverage] = useState<number>(0)
  const [count, setCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('ratings').select('rating').eq('item_id', itemId).eq('item_type', itemType)
      if (data && data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0)
        setAverage(sum / data.length)
        setCount(data.length)
      } else {
        setAverage(0)
        setCount(0)
      }
    } finally { setIsLoading(false) }
  }, [itemId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { average, count, isLoading, refresh: fetch }
}

export function useRatingDistribution(itemId?: string, itemType?: string) {
  const [distribution, setDistribution] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!itemId || !itemType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('ratings').select('rating').eq('item_id', itemId).eq('item_type', itemType)
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      data?.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1 })
      setDistribution(dist)
    } finally { setIsLoading(false) }
  }, [itemId, itemType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { distribution, isLoading, refresh: fetch }
}
