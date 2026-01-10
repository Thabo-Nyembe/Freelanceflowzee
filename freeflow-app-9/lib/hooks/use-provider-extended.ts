'use client'

/**
 * Extended Provider Hooks
 * Tables: providers, provider_services, provider_availability, provider_reviews
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProvider(providerId?: string) {
  const [provider, setProvider] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('providers').select('*, provider_services(*)').eq('id', providerId).single(); setProvider(data) } finally { setIsLoading(false) }
  }, [providerId])
  useEffect(() => { fetch() }, [fetch])
  return { provider, isLoading, refresh: fetch }
}

export function useProviders(options?: { type?: string; status?: string; min_rating?: number; limit?: number }) {
  const [providers, setProviders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('providers').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.min_rating) query = query.gte('rating', options.min_rating)
      const { data } = await query.order('rating', { ascending: false }).limit(options?.limit || 50)
      setProviders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.status, options?.min_rating, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { providers, isLoading, refresh: fetch }
}

export function useProviderServices(providerId?: string) {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('provider_services').select('*').eq('provider_id', providerId).eq('is_active', true).order('name', { ascending: true }); setServices(data || []) } finally { setIsLoading(false) }
  }, [providerId])
  useEffect(() => { fetch() }, [fetch])
  return { services, isLoading, refresh: fetch }
}

export function useProviderAvailability(providerId?: string, options?: { date_from?: string; date_to?: string }) {
  const [availability, setAvailability] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('provider_availability').select('*').eq('provider_id', providerId)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query.order('date', { ascending: true })
      setAvailability(data || [])
    } finally { setIsLoading(false) }
  }, [providerId, options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { availability, isLoading, refresh: fetch }
}

export function useProviderReviews(providerId?: string, options?: { limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('provider_reviews').select('*').eq('provider_id', providerId).order('created_at', { ascending: false }).limit(options?.limit || 20); setReviews(data || []) } finally { setIsLoading(false) }
  }, [providerId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useTopProviders(options?: { type?: string; limit?: number }) {
  const [providers, setProviders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('providers').select('*').eq('status', 'active')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('rating', { ascending: false }).limit(options?.limit || 10)
      setProviders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { providers, isLoading, refresh: fetch }
}
