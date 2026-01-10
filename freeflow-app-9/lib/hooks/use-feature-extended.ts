'use client'

/**
 * Extended Feature Hooks
 * Tables: features, feature_flags, feature_requests, feature_votes, feature_releases
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFeature(featureId?: string) {
  const [feature, setFeature] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!featureId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('features').select('*, feature_votes(*)').eq('id', featureId).single(); setFeature(data) } finally { setIsLoading(false) }
  }, [featureId])
  useEffect(() => { fetch() }, [fetch])
  return { feature, isLoading, refresh: fetch }
}

export function useFeatures(options?: { category?: string; status?: string; priority?: string; owner_id?: string; limit?: number }) {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('features').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setFeatures(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.status, options?.priority, options?.owner_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { features, isLoading, refresh: fetch }
}

export function useFeatureFlag(flagKey?: string) {
  const [flag, setFlag] = useState<any>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!flagKey) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('feature_flags').select('*').eq('key', flagKey).single(); setFlag(data); setIsEnabled(data?.is_enabled ?? false) } finally { setIsLoading(false) }
  }, [flagKey])
  useEffect(() => { fetch() }, [fetch])
  return { flag, isEnabled, isLoading, refresh: fetch }
}

export function useFeatureFlags(options?: { is_enabled?: boolean }) {
  const [flags, setFlags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('feature_flags').select('*')
      if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled)
      const { data } = await query.order('name', { ascending: true })
      setFlags(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_enabled])
  useEffect(() => { fetch() }, [fetch])
  return { flags, isLoading, refresh: fetch }
}

export function useFeatureRequests(options?: { status?: string; category?: string; user_id?: string; limit?: number }) {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('feature_requests').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('vote_count', { ascending: false }).limit(options?.limit || 50)
      setRequests(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.category, options?.user_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { requests, isLoading, refresh: fetch }
}

export function useHasVoted(featureId?: string, userId?: string) {
  const [hasVoted, setHasVoted] = useState(false)
  const [vote, setVote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!featureId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('feature_votes').select('*').eq('feature_id', featureId).eq('user_id', userId).single(); setHasVoted(!!data); setVote(data) } finally { setIsLoading(false) }
  }, [featureId, userId])
  useEffect(() => { check() }, [check])
  return { hasVoted, vote, isLoading, recheck: check }
}

export function useFeatureReleases(options?: { status?: string; limit?: number }) {
  const [releases, setReleases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('feature_releases').select('*, features(*)')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('release_date', { ascending: false }).limit(options?.limit || 20)
      setReleases(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { releases, isLoading, refresh: fetch }
}

export function useTopVotedFeatures(limit?: number) {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('features').select('*').order('vote_count', { ascending: false }).limit(limit || 10); setFeatures(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { features, isLoading, refresh: fetch }
}

export function useFeaturesByStatus() {
  const [byStatus, setByStatus] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('features').select('*').order('created_at', { ascending: false })
      const grouped: Record<string, any[]> = {}
      data?.forEach(f => { if (!grouped[f.status]) grouped[f.status] = []; grouped[f.status].push(f) })
      setByStatus(grouped)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { byStatus, isLoading, refresh: fetch }
}

export function useFeatureCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('features').select('category')
      const uniqueCategories = [...new Set(data?.map(f => f.category).filter(Boolean))]
      setCategories(uniqueCategories as string[])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}
