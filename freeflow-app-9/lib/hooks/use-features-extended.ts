'use client'

/**
 * Extended Features Hooks
 * Tables: features, feature_flags, feature_requests, feature_usage
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFeature(featureId?: string) {
  const [feature, setFeature] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!featureId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('features').select('*').eq('id', featureId).single(); setFeature(data) } finally { setIsLoading(false) }
  }, [featureId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { feature, isLoading, refresh: fetch }
}

export function useFeatures(options?: { is_enabled?: boolean; limit?: number }) {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('features').select('*')
      if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setFeatures(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_enabled, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { features, isLoading, refresh: fetch }
}

export function useFeatureFlags(options?: { user_id?: string; environment?: string }) {
  const [flags, setFlags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('feature_flags').select('*, features(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.environment) query = query.eq('environment', options.environment)
      const { data } = await query
      setFlags(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.environment, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { flags, isLoading, refresh: fetch }
}

export function useFeatureRequests(options?: { status?: string; limit?: number }) {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('feature_requests').select('*')
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('votes', { ascending: false }).limit(options?.limit || 50)
      setRequests(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { requests, isLoading, refresh: fetch }
}

export function useEnabledFeatures() {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('features').select('*').eq('is_enabled', true).order('name', { ascending: true }); setFeatures(data || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { features, isLoading, refresh: fetch }
}

export function useFeatureByKey(key?: string) {
  const [feature, setFeature] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!key) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('features').select('*').eq('key', key).single(); setFeature(data) } finally { setIsLoading(false) }
  }, [key, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { feature, isLoading, refresh: fetch }
}
