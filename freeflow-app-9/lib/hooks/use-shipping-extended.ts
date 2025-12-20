'use client'

/**
 * Extended Shipping Hooks
 * Tables: shipping_rates, shipping_zones, shipping_methods, shipping_carriers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useShippingRate(rateId?: string) {
  const [rate, setRate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!rateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('shipping_rates').select('*').eq('id', rateId).single(); setRate(data) } finally { setIsLoading(false) }
  }, [rateId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rate, isLoading, refresh: fetch }
}

export function useShippingRates(options?: { zone_id?: string; method_id?: string; is_active?: boolean; limit?: number }) {
  const [rates, setRates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('shipping_rates').select('*')
      if (options?.zone_id) query = query.eq('zone_id', options.zone_id)
      if (options?.method_id) query = query.eq('method_id', options.method_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setRates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.zone_id, options?.method_id, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { rates, isLoading, refresh: fetch }
}

export function useShippingZones(options?: { is_active?: boolean }) {
  const [zones, setZones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('shipping_zones').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setZones(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { zones, isLoading, refresh: fetch }
}

export function useShippingMethods(options?: { is_active?: boolean; carrier_id?: string }) {
  const [methods, setMethods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('shipping_methods').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.carrier_id) query = query.eq('carrier_id', options.carrier_id)
      const { data } = await query.order('name', { ascending: true })
      setMethods(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.carrier_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { methods, isLoading, refresh: fetch }
}

export function useShippingCarriers(options?: { is_active?: boolean }) {
  const [carriers, setCarriers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('shipping_carriers').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCarriers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { carriers, isLoading, refresh: fetch }
}
