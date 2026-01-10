'use client'

/**
 * Extended Tracks Hooks
 * Tables: tracks, track_items, track_progress, track_completions, track_enrollments, track_certificates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTrack(trackId?: string) {
  const [track, setTrack] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trackId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tracks').select('*, track_items(*, courses(*), lessons(*)), track_enrollments(count)').eq('id', trackId).single(); setTrack(data) } finally { setIsLoading(false) }
  }, [trackId])
  useEffect(() => { fetch() }, [fetch])
  return { track, isLoading, refresh: fetch }
}

export function useTracks(options?: { track_type?: string; category?: string; difficulty?: string; status?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [tracks, setTracks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tracks').select('*, track_items(count)')
      if (options?.track_type) query = query.eq('track_type', options.track_type)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.difficulty) query = query.eq('difficulty', options.difficulty)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTracks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.track_type, options?.category, options?.difficulty, options?.status, options?.is_public, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tracks, isLoading, refresh: fetch }
}

export function useTrackItems(trackId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trackId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('track_items').select('*, courses(*), lessons(*)').eq('track_id', trackId).order('order_index', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [trackId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useTrackEnrollment(trackId?: string, userId?: string) {
  const [enrollment, setEnrollment] = useState<any>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trackId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('track_enrollments').select('*').eq('track_id', trackId).eq('user_id', userId).single(); setEnrollment(data); setIsEnrolled(!!data) } finally { setIsLoading(false) }
  }, [trackId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { enrollment, isEnrolled, isLoading, refresh: fetch }
}

export function useUserEnrollments(userId?: string, options?: { status?: string; limit?: number }) {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('track_enrollments').select('*, tracks(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('enrolled_at', { ascending: false }).limit(options?.limit || 50)
      setEnrollments(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { enrollments, isLoading, refresh: fetch }
}

export function useTrackProgress(trackId?: string, userId?: string) {
  const [progress, setProgress] = useState<any[]>([])
  const [stats, setStats] = useState<{ completedCount: number; totalItems: number; overallProgress: number }>({ completedCount: 0, totalItems: 0, overallProgress: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trackId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [itemsRes, progressRes] = await Promise.all([
        supabase.from('track_items').select('id, is_required').eq('track_id', trackId),
        supabase.from('track_progress').select('*').eq('track_id', trackId).eq('user_id', userId)
      ])
      const items = itemsRes.data || []
      const progressData = progressRes.data || []
      const completedCount = progressData.filter(p => p.status === 'completed').length
      const requiredItems = items.filter(i => i.is_required).length
      const overallProgress = requiredItems > 0 ? Math.round((completedCount / requiredItems) * 100) : 0
      setProgress(progressData)
      setStats({ completedCount, totalItems: items.length, overallProgress })
    } finally { setIsLoading(false) }
  }, [trackId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { progress, stats, isLoading, refresh: fetch }
}

export function useTrackCompletion(trackId?: string, userId?: string) {
  const [completion, setCompletion] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trackId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('track_completions').select('*').eq('track_id', trackId).eq('user_id', userId).single(); setCompletion(data); setIsCompleted(!!data) } finally { setIsLoading(false) }
  }, [trackId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { completion, isCompleted, isLoading, refresh: fetch }
}

export function useUserCertificates(userId?: string) {
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('track_certificates').select('*, tracks(*)').eq('user_id', userId).order('issued_at', { ascending: false }); setCertificates(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { certificates, isLoading, refresh: fetch }
}

export function useTrackCertificate(trackId?: string, userId?: string) {
  const [certificate, setCertificate] = useState<any>(null)
  const [hasCertificate, setHasCertificate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!trackId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('track_certificates').select('*, tracks(*)').eq('track_id', trackId).eq('user_id', userId).single(); setCertificate(data); setHasCertificate(!!data) } finally { setIsLoading(false) }
  }, [trackId, userId])
  useEffect(() => { fetch() }, [fetch])
  return { certificate, hasCertificate, isLoading, refresh: fetch }
}

export function usePopularTracks(options?: { category?: string; difficulty?: string; limit?: number }) {
  const [tracks, setTracks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('tracks').select('*, track_items(count)').eq('status', 'published').eq('is_public', true)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.difficulty) query = query.eq('difficulty', options.difficulty)
      const { data } = await query.order('enrollment_count', { ascending: false }).limit(options?.limit || 20)
      setTracks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.difficulty, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { tracks, isLoading, refresh: fetch }
}

export function useTrackCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('tracks').select('category').not('category', 'is', null).eq('status', 'published')
      const unique = [...new Set(data?.map(t => t.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useMyCreatedTracks(userId?: string, options?: { status?: string }) {
  const [tracks, setTracks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('tracks').select('*, track_items(count), track_enrollments(count)').eq('created_by', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false })
      setTracks(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { tracks, isLoading, refresh: fetch }
}
