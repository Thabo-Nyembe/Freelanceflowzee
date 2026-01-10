'use client'

/**
 * Extended Services Hooks
 * Tables: services, service_categories, service_providers, service_bookings, service_pricing, service_reviews
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useService(serviceId?: string) {
  const [service, setService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('services').select('*, service_categories(*), service_providers(*), service_pricing(*), service_reviews(count)').eq('id', serviceId).single(); setService(data) } finally { setIsLoading(false) }
  }, [serviceId])
  useEffect(() => { fetch() }, [fetch])
  return { service, isLoading, refresh: fetch }
}

export function useServices(options?: { category_id?: string; provider_id?: string; is_active?: boolean; min_price?: number; max_price?: number; search?: string; limit?: number }) {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('services').select('*, service_categories(*), service_providers(*), service_pricing(*), service_reviews(count)')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.provider_id) query = query.eq('provider_id', options.provider_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.min_price) query = query.gte('base_price', options.min_price)
      if (options?.max_price) query = query.lte('base_price', options.max_price)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setServices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id, options?.provider_id, options?.is_active, options?.min_price, options?.max_price, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { services, isLoading, refresh: fetch }
}

export function useServiceCategories(options?: { parent_id?: string | null; is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('service_categories').select('*, services(count)')
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.parent_id, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useServiceProviders(options?: { is_active?: boolean; is_verified?: boolean; search?: string; limit?: number }) {
  const [providers, setProviders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('service_providers').select('*, services(count), users(*)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.is_verified !== undefined) query = query.eq('is_verified', options.is_verified)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setProviders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.is_verified, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { providers, isLoading, refresh: fetch }
}

export function useServiceBookings(serviceId?: string, options?: { from_date?: string; to_date?: string; status?: string; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('service_bookings').select('*, users(*), service_providers(*)').eq('service_id', serviceId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('scheduled_at', options.from_date)
      if (options?.to_date) query = query.lte('scheduled_at', options.to_date)
      const { data } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 100)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [serviceId, options?.from_date, options?.to_date, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bookings, isLoading, refresh: fetch }
}

export function useMyServiceBookings(customerId?: string, options?: { status?: string; upcoming_only?: boolean; limit?: number }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('service_bookings').select('*, services(*, service_categories(*)), service_providers(*)').eq('customer_id', customerId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.upcoming_only) query = query.gte('scheduled_at', new Date().toISOString())
      const { data } = await query.order('scheduled_at', { ascending: true }).limit(options?.limit || 50)
      setBookings(data || [])
    } finally { setIsLoading(false) }
  }, [customerId, options?.status, options?.upcoming_only, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bookings, isLoading, refresh: fetch }
}

export function useServicePricing(serviceId?: string) {
  const [pricing, setPricing] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('service_pricing').select('*').eq('service_id', serviceId).order('type', { ascending: true }); setPricing(data || []) } finally { setIsLoading(false) }
  }, [serviceId])
  useEffect(() => { fetch() }, [fetch])
  return { pricing, isLoading, refresh: fetch }
}

export function useServiceAvailability(serviceId?: string, date?: string) {
  const [availability, setAvailability] = useState<{ service: any; bookings: any[]; date: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serviceId || !date) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: service } = await supabase.from('services').select('duration_minutes, max_bookings_per_slot').eq('id', serviceId).single()
      if (!service) { setAvailability(null); return }
      const { data: bookings } = await supabase.from('service_bookings').select('scheduled_at, end_time').eq('service_id', serviceId).neq('status', 'cancelled').gte('scheduled_at', date).lt('scheduled_at', date + 'T23:59:59')
      setAvailability({ service, bookings: bookings || [], date })
    } finally { setIsLoading(false) }
  }, [serviceId, date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { availability, isLoading, refresh: fetch }
}

export function useProviderServices(providerId?: string, options?: { is_active?: boolean }) {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!providerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('services').select('*, service_categories(*), service_pricing(*)').eq('provider_id', providerId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setServices(data || [])
    } finally { setIsLoading(false) }
  }, [providerId, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { services, isLoading, refresh: fetch }
}

export function useServiceStats() {
  const [stats, setStats] = useState<{ total: number; active: number; categories: number; providers: number; bookingsToday: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [total, active, categories, providers, bookingsToday] = await Promise.all([
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('service_categories').select('*', { count: 'exact', head: true }),
        supabase.from('service_providers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('service_bookings').select('*', { count: 'exact', head: true }).gte('scheduled_at', today).lt('scheduled_at', today + 'T23:59:59')
      ])
      setStats({ total: total.count || 0, active: active.count || 0, categories: categories.count || 0, providers: providers.count || 0, bookingsToday: bookingsToday.count || 0 })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

