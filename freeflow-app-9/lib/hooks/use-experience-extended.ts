'use client'

/**
 * Extended Experience Hooks
 * Tables: experiences, experience_ratings, experience_reviews, experience_bookings, experience_hosts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useExperience(experienceId?: string) {
  const [experience, setExperience] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!experienceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('experiences').select('*, experience_hosts(*), experience_reviews(*)').eq('id', experienceId).single(); setExperience(data) } finally { setIsLoading(false) }
  }, [experienceId])
  useEffect(() => { loadData() }, [loadData])
  return { experience, isLoading, refresh: loadData }
}

export function useExperiences(options?: { host_id?: string; category?: string; status?: string; price_max?: number; search?: string; limit?: number }) {
  const [experiences, setExperiences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('experiences').select('*')
      if (options?.host_id) query = query.eq('host_id', options.host_id)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.price_max) query = query.lte('price', options.price_max)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setExperiences(data || [])
    } finally { setIsLoading(false) }
  }, [options?.host_id, options?.category, options?.status, options?.price_max, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { experiences, isLoading, refresh: loadData }
}

export function useExperienceBookings(experienceId?: string, options?: { status?: string; date_from?: string; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!experienceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('experience_bookings').select('*').eq('experience_id', experienceId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.date_from) query = query.gte('scheduled_date', options.date_from)
      const { data } = await query.order('scheduled_date', { ascending: true }).limit(options?.limit || 50)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [experienceId, options?.status, options?.date_from, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { bookings, isLoading, refresh: loadData }
}

export function useUserExperienceBookings(userId?: string, options?: { status?: string; upcoming?: boolean; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('experience_bookings').select('*, experiences(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.upcoming) query = query.gte('scheduled_date', new Date().toISOString().split('T')[0])
      const { data } = await query.order('scheduled_date', { ascending: options?.upcoming ?? true }).limit(options?.limit || 50)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.upcoming, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { bookings, isLoading, refresh: loadData }
}

export function useExperienceReviews(experienceId?: string, options?: { limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!experienceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('experience_reviews').select('*').eq('experience_id', experienceId).order('created_at', { ascending: false }).limit(options?.limit || 20); setReviews(data || []) } finally { setIsLoading(false) }
  }, [experienceId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { reviews, isLoading, refresh: loadData }
}

export function useFeaturedExperiences(limit?: number) {
  const [experiences, setExperiences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('experiences').select('*').eq('status', 'published').order('rating_avg', { ascending: false }).limit(limit || 10); setExperiences(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { loadData() }, [loadData])
  return { experiences, isLoading, refresh: loadData }
}

export function useExperienceHost(hostId?: string) {
  const [host, setHost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!hostId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('experience_hosts').select('*').eq('id', hostId).single(); setHost(data) } finally { setIsLoading(false) }
  }, [hostId])
  useEffect(() => { loadData() }, [loadData])
  return { host, isLoading, refresh: loadData }
}

export function useExperienceCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('experiences').select('category').eq('status', 'published')
      const uniqueCategories = [...new Set(data?.map(e => e.category).filter(Boolean))]
      setCategories(uniqueCategories as string[])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useHostExperienceStats(hostId?: string) {
  const [stats, setStats] = useState<{ totalExperiences: number; totalBookings: number; avgRating: number; totalRevenue: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!hostId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: experiences } = await supabase.from('experiences').select('id, rating_avg, booking_count').eq('host_id', hostId)
      if (!experiences) { setStats(null); return }
      const experienceIds = experiences.map(e => e.id)
      const { data: bookings } = await supabase.from('experience_bookings').select('total_price').in('experience_id', experienceIds).eq('status', 'completed')
      const totalExperiences = experiences.length
      const totalBookings = experiences.reduce((sum, e) => sum + (e.booking_count || 0), 0)
      const ratings = experiences.filter(e => e.rating_avg > 0).map(e => e.rating_avg)
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
      setStats({ totalExperiences, totalBookings, avgRating, totalRevenue })
    } finally { setIsLoading(false) }
  }, [hostId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
